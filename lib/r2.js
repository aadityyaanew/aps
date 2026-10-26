import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Clean and validate R2 configuration from environment variables.
 * Trims any accidental whitespace, quotes, or line-breaks that cause
 * Signature Version 4 HMAC mismatch on Cloudflare R2.
 */
export function getR2Config() {
  const accountId = (process.env.R2_ACCOUNT_ID || "").replace(/['"]/g, "").trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").replace(/['"]/g, "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").replace(/['"]/g, "").trim();
  const bucketName = (process.env.R2_BUCKET_NAME || "").replace(/['"]/g, "").trim();
  const publicUrlBase = (process.env.R2_PUBLIC_URL || "").replace(/['"]/g, "").trim().replace(/\/$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    const missing = [];
    if (!accountId) missing.push("R2_ACCOUNT_ID");
    if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
    if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
    if (!bucketName) missing.push("R2_BUCKET_NAME");
    throw new Error(
      `Cloudflare R2 configuration missing: ${missing.join(", ")}. Please configure these environment variables in your server hosting panel.`
    );
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrlBase };
}

let cachedClient = null;
let cachedKeyHash = "";

/**
 * Returns an S3Client configured specifically for Cloudflare R2.
 * Enforces region: "auto", account-level endpoint, and disables modern AWS flexible
 * request checksums (which trigger "SignatureDoesNotMatch" on R2).
 */
export function getR2Client() {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();
  const keyHash = `${accountId}_${accessKeyId}_${secretAccessKey}`;

  if (!cachedClient || cachedKeyHash !== keyHash) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      // Cloudflare R2 compatibility: Disable modern AWS flexible checksums (crc32, sha256)
      // that break SigV4 canonical request matching in R2's S3-compatible layer.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
    cachedKeyHash = keyHash;
  }

  return cachedClient;
}

/**
 * Transparent proxy for backward compatibility where `r2Client.send(...)` is called.
 */
export const r2Client = new Proxy({}, {
  get(target, prop) {
    const client = getR2Client();
    const val = client[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

/**
 * Upload buffer to Cloudflare R2 bucket.
 * @param {Object} params
 * @param {Buffer|Uint8Array} params.fileBuffer
 * @param {string} params.fileName
 * @param {string} [params.contentType]
 * @param {string} [params.folder]
 * @returns {Promise<{ key: string, url: string }>}
 */
export async function uploadToR2({
  fileBuffer,
  fileName,
  contentType = "application/octet-stream",
  folder = "invoices",
}) {
  const { bucketName, publicUrlBase } = getR2Config();
  const client = getR2Client();

  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueKey = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${sanitizedName}`;

  // Ensure fileBuffer is a clean Node.js Buffer and compute explicit ContentLength
  const body = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: body,
        ContentType: contentType,
        ContentLength: body.length,
      })
    );
  } catch (err) {
    if (err.name === "SignatureDoesNotMatch" || err.message?.includes("request signature we calculated")) {
      throw new Error(
        "Cloudflare R2 authentication failed: Request signature does not match. Please verify that R2_SECRET_ACCESS_KEY and R2_ACCESS_KEY_ID are correctly configured in your server environment variables without extra quotes or spaces."
      );
    }
    throw err;
  }

  const url = publicUrlBase
    ? `${publicUrlBase}/${uniqueKey}`
    : `/api/invoices/file?key=${encodeURIComponent(uniqueKey)}`;

  return {
    key: uniqueKey,
    url,
  };
}

/**
 * Get an object stream from Cloudflare R2 bucket.
 * @param {string} key
 */
export async function getFromR2(key) {
  const { bucketName } = getR2Config();
  const client = getR2Client();

  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
  return response;
}

/**
 * Delete an object from Cloudflare R2 bucket.
 * @param {string} key
 */
export async function deleteFromR2(key) {
  const { bucketName } = getR2Config();
  const client = getR2Client();

  return client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}
