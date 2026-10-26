/**
 * services/billing.service.js — Business logic for Billing management, Cloudflare R2 upload,
 * billing password hashing/verification, access control, and notifications.
 */
import bcrypt from "bcryptjs";
import { findById, findByIdWithPassword, setUnitBillingAccess, setUnitBillingPassword } from "@/repositories/users.repo";
import {
  createInvoice,
  findInvoicesByUnit,
  findAllInvoices,
  findInvoiceById,
  updateInvoiceStatus,
  getBillingSummary,
} from "@/repositories/invoices.repo";
import {
  createBillingNotification,
  getNotificationsForUnit,
  getUnreadCountForUnit,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAllNotificationsAdmin,
} from "@/repositories/billing-notifications.repo";
import { uploadToR2 } from "@/lib/r2";

/**
 * Get billing access & password status for a unit.
 */
export async function getUnitBillingStatus(unitId) {
  const user = await findById(unitId);
  if (!user) {
    throw new Error("Unit not found");
  }

  const unreadCount = user.billing_access ? await getUnreadCountForUnit(unitId) : 0;

  return {
    unitId: user.id,
    unitName: user.name,
    organizationName: user.organization_name,
    hasAccess: Boolean(user.billing_access),
    hasPassword: Boolean(user.has_billing_password),
    unreadCount,
  };
}

/**
 * Verify a unit's billing password.
 */
export async function verifyBillingPassword(unitId, plainPassword) {
  if (!plainPassword) return false;
  const user = await findByIdWithPassword(unitId);
  if (!user || !user.billing_access || !user.billing_password_hash) {
    return false;
  }
  return bcrypt.compare(plainPassword, user.billing_password_hash);
}

/**
 * Set initial billing password for a unit (first-time setup).
 */
export async function setInitialBillingPassword(unitId, password) {
  if (!password || password.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  const user = await findByIdWithPassword(unitId);
  if (!user) {
    throw new Error("Unit not found.");
  }
  if (!user.billing_access) {
    throw new Error("Unit does not have billing access.");
  }
  if (user.billing_password_hash) {
    throw new Error("Billing password is already set. Please contact admin to reset.");
  }

  const hash = await bcrypt.hash(password, 10);
  await setUnitBillingPassword(unitId, hash);
  return { success: true };
}

/**
 * Admin: Create or reset a unit's billing password.
 */
export async function adminResetBillingPassword(unitId, newPassword) {
  if (!newPassword || newPassword.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  const user = await findById(unitId);
  if (!user) {
    throw new Error("Unit not found.");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await setUnitBillingPassword(unitId, hash);
  return { success: true };
}

/**
 * Admin: Grant or revoke billing access for a unit.
 */
export async function adminToggleBillingAccess(unitId, grantAccess) {
  const user = await findById(unitId);
  if (!user) {
    throw new Error("Unit not found.");
  }

  await setUnitBillingAccess(unitId, Boolean(grantAccess));
  return { success: true, billing_access: Boolean(grantAccess) };
}

/**
 * Upload and submit an invoice.
 */
export async function submitUnitInvoice({
  unitId,
  invoiceNumber,
  invoiceDate,
  invoiceMonth,
  invoiceYear,
  amount,
  signedBy,
  file,
}) {
  const user = await findById(unitId);
  if (!user || !user.billing_access) {
    throw new Error("Your unit does not have access to the Billing section.");
  }

  if (!invoiceNumber?.trim()) throw new Error("Invoice Number is required.");
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new Error("Valid Invoice Amount is required.");
  }
  if (!signedBy?.trim()) throw new Error("Invoice Signed By is required.");
  if (!file) throw new Error("Invoice document is required.");

  // Enforce server-authoritative date, month, and year (Asia/Kolkata) to prevent manipulation
  const now = new Date();
  const safeInvoiceDate = invoiceDate || new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const safeInvoiceMonth = invoiceMonth?.trim() || new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "long",
  }).format(now);

  const safeInvoiceYear = invoiceYear ? parseInt(invoiceYear, 10) : parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
    }).format(now),
    10
  );

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  // Upload to Cloudflare R2
  const { key, url } = await uploadToR2({
    fileBuffer,
    fileName: file.name,
    contentType: file.type || "application/pdf",
    folder: `invoices/unit_${unitId}`,
  });

  const invoiceId = await createInvoice({
    unit_id: unitId,
    invoice_number: invoiceNumber.trim(),
    invoice_date: safeInvoiceDate,
    invoice_month: safeInvoiceMonth,
    invoice_year: safeInvoiceYear,
    amount: parseFloat(amount),
    signed_by: signedBy.trim(),
    file_url: url,
    file_key: key,
    file_name: file.name,
    file_size: file.size,
  });

  const created = await findInvoiceById(invoiceId);
  return created;
}

/**
 * Admin review invoice (Approve or Reject with remarks).
 */
export async function adminReviewInvoice({ invoiceId, status, adminRemarks, reviewerId }) {
  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    throw new Error("Invalid status. Allowed: Approved, Rejected, Pending.");
  }

  const invoice = await findInvoiceById(invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  await updateInvoiceStatus(invoiceId, {
    status,
    admin_remarks: adminRemarks?.trim() || null,
    reviewed_by: reviewerId,
  });

  return findInvoiceById(invoiceId);
}

/**
 * Admin send announcement / instruction / reminder to units.
 */
export async function adminSendNotification({
  title,
  message,
  type = "announcement",
  createdBy,
  targetAllUnits = true,
  unitIds = [],
}) {
  if (!title?.trim()) throw new Error("Notification title is required.");
  if (!message?.trim()) throw new Error("Notification message is required.");

  return createBillingNotification({
    title: title.trim(),
    message: message.trim(),
    type,
    created_by: createdBy,
    target_all_units: targetAllUnits,
    unit_ids: unitIds,
  });
}
