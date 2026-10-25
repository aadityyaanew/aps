import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrlBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
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
export async function uploadToR2({ fileBuffer, fileName, contentType = "application/octet-stream", folder = "invoices" }) {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueKey = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${sanitizedName}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  const url = publicUrlBase ? `${publicUrlBase}/${uniqueKey}` : `/api/invoices/file?key=${encodeURIComponent(uniqueKey)}`;

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
  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
  return response;
}
