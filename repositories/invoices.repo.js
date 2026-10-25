/**
 * repositories/invoices.repo.js — Database queries for invoices.
 */
import { query, queryOne, execute } from "@/lib/db";

/**
 * Create a new invoice.
 */
export async function createInvoice({
  unit_id,
  invoice_number,
  invoice_date,
  invoice_month,
  invoice_year,
  amount,
  signed_by,
  file_url,
  file_key,
  file_name,
  file_size,
}) {
  const result = await execute(
    `INSERT INTO invoices 
      (unit_id, invoice_number, invoice_date, invoice_month, invoice_year, amount, signed_by, file_url, file_key, file_name, file_size, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
    [
      unit_id,
      invoice_number,
      invoice_date,
      invoice_month,
      invoice_year,
      amount,
      signed_by,
      file_url,
      file_key,
      file_name,
      file_size ?? null,
    ]
  );
  return result.insertId;
}

/**
 * Get all invoices for a specific unit (Center view).
 */
export async function findInvoicesByUnit(unitId, { month, year, status, search } = {}) {
  const conditions = ["i.unit_id = ?"];
  const params = [unitId];

  if (month) {
    conditions.push("i.invoice_month = ?");
    params.push(month);
  }
  if (year) {
    conditions.push("i.invoice_year = ?");
    params.push(parseInt(year, 10));
  }
  if (status) {
    conditions.push("i.status = ?");
    params.push(status);
  }
  if (search) {
    conditions.push("(i.invoice_number LIKE ? OR i.signed_by LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const sql = `
    SELECT 
      i.id, i.unit_id, i.invoice_number, i.invoice_date, i.invoice_month, i.invoice_year,
      i.amount, i.signed_by, i.file_url, i.file_key, i.file_name, i.file_size,
      i.status, i.admin_remarks, i.reviewed_at, i.created_at, i.updated_at,
      u.name AS unit_name, u.organization_name
    FROM invoices i
    JOIN users u ON u.id = i.unit_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY i.created_at DESC
  `;

  return query(sql, params);
}

/**
 * Get all invoices across all units (Admin view).
 */
export async function findAllInvoices({ unit_id, month, year, status, search } = {}) {
  const conditions = ["1=1"];
  const params = [];

  if (unit_id) {
    conditions.push("i.unit_id = ?");
    params.push(parseInt(unit_id, 10));
  }
  if (month) {
    conditions.push("i.invoice_month = ?");
    params.push(month);
  }
  if (year) {
    conditions.push("i.invoice_year = ?");
    params.push(parseInt(year, 10));
  }
  if (status) {
    conditions.push("i.status = ?");
    params.push(status);
  }
  if (search) {
    conditions.push("(i.invoice_number LIKE ? OR i.signed_by LIKE ? OR u.name LIKE ? OR u.organization_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const sql = `
    SELECT 
      i.id, i.unit_id, i.invoice_number, i.invoice_date, i.invoice_month, i.invoice_year,
      i.amount, i.signed_by, i.file_url, i.file_key, i.file_name, i.file_size,
      i.status, i.admin_remarks, i.reviewed_at, i.created_at, i.updated_at,
      u.name AS unit_name, u.email AS unit_email, u.organization_name,
      r.name AS reviewer_name
    FROM invoices i
    JOIN users u ON u.id = i.unit_id
    LEFT JOIN users r ON r.id = i.reviewed_by
    WHERE ${conditions.join(" AND ")}
    ORDER BY i.created_at DESC
  `;

  return query(sql, params);
}

/**
 * Find invoice by ID.
 */
export async function findInvoiceById(id) {
  return queryOne(
    `SELECT i.*, u.name AS unit_name, u.email AS unit_email, u.organization_name
     FROM invoices i
     JOIN users u ON u.id = i.unit_id
     WHERE i.id = ? LIMIT 1`,
    [id]
  );
}

/**
 * Update invoice status and admin remarks.
 */
export async function updateInvoiceStatus(id, { status, admin_remarks, reviewed_by }) {
  return execute(
    `UPDATE invoices 
     SET status = ?, admin_remarks = ?, reviewed_by = ?, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = ?`,
    [status, admin_remarks ?? null, reviewed_by ?? null, id]
  );
}

/**
 * Get overall billing summary metrics for Admin Dashboard.
 */
export async function getBillingSummary() {
  const row = await queryOne(`
    SELECT 
      COUNT(*) AS total_invoices,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_invoices,
      SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved_invoices,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_invoices,
      COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) AS total_approved_amount
    FROM invoices
  `);

  return {
    total_invoices: Number(row?.total_invoices || 0),
    pending_invoices: Number(row?.pending_invoices || 0),
    approved_invoices: Number(row?.approved_invoices || 0),
    rejected_invoices: Number(row?.rejected_invoices || 0),
    total_approved_amount: Number(row?.total_approved_amount || 0),
  };
}
