/**
 * repositories/billing-notifications.repo.js — Database queries for billing notifications.
 */
import { query, queryOne, execute } from "@/lib/db";

/**
 * Create a billing announcement/instruction/reminder and distribute to recipients.
 */
export async function createBillingNotification({
  title,
  message,
  type = "announcement",
  created_by,
  target_all_units = true,
  unit_ids = [],
}) {
  const notifResult = await execute(
    `INSERT INTO billing_notifications (title, message, type, created_by, target_all_units)
     VALUES (?, ?, ?, ?, ?)`,
    [title, message, type, created_by, Boolean(target_all_units)]
  );
  const notificationId = notifResult.insertId;

  // Determine recipients: only units with billing_access = 1
  let targetUnits = [];
  if (target_all_units) {
    const units = await query(
      `SELECT id FROM users WHERE role = 'center' AND billing_access = 1 AND is_active = 1`
    );
    targetUnits = units.map((u) => u.id);
  } else if (Array.isArray(unit_ids) && unit_ids.length > 0) {
    // Only select those among unit_ids that have billing_access
    const placeholders = unit_ids.map(() => "?").join(",");
    const units = await query(
      `SELECT id FROM users WHERE id IN (${placeholders}) AND billing_access = 1 AND is_active = 1`,
      unit_ids
    );
    targetUnits = units.map((u) => u.id);
  }

  // Insert recipient rows
  for (const uid of targetUnits) {
    await execute(
      `INSERT IGNORE INTO billing_notification_recipients (notification_id, unit_id, is_read)
       VALUES (?, ?, 0)`,
      [notificationId, uid]
    );
  }

  return { notificationId, recipientCount: targetUnits.length };
}

/**
 * Get notification history for a specific unit.
 */
export async function getNotificationsForUnit(unitId) {
  return query(
    `SELECT 
       n.id AS notification_id,
       n.title,
       n.message,
       n.type,
       n.created_at,
       r.id AS recipient_id,
       r.is_read,
       r.read_at
     FROM billing_notification_recipients r
     JOIN billing_notifications n ON n.id = r.notification_id
     WHERE r.unit_id = ?
     ORDER BY n.created_at DESC`,
    [unitId]
  );
}

/**
 * Get unread notification count for a unit.
 */
export async function getUnreadCountForUnit(unitId) {
  const row = await queryOne(
    `SELECT COUNT(*) AS unread_count
     FROM billing_notification_recipients
     WHERE unit_id = ? AND is_read = 0`,
    [unitId]
  );
  return Number(row?.unread_count || 0);
}

/**
 * Mark a single notification as read for a unit.
 */
export async function markNotificationAsRead(notificationId, unitId) {
  return execute(
    `UPDATE billing_notification_recipients
     SET is_read = 1, read_at = NOW()
     WHERE notification_id = ? AND unit_id = ?`,
    [notificationId, unitId]
  );
}

/**
 * Mark all notifications as read for a unit.
 */
export async function markAllNotificationsAsRead(unitId) {
  return execute(
    `UPDATE billing_notification_recipients
     SET is_read = 1, read_at = NOW()
     WHERE unit_id = ? AND is_read = 0`,
    [unitId]
  );
}

/**
 * Admin view: Get list of all billing notifications sent.
 */
export async function getAllNotificationsAdmin() {
  return query(
    `SELECT 
       n.id,
       n.title,
       n.message,
       n.type,
       n.target_all_units,
       n.created_at,
       u.name AS sender_name,
       COUNT(r.id) AS total_recipients,
       SUM(CASE WHEN r.is_read = 1 THEN 1 ELSE 0 END) AS read_count
     FROM billing_notifications n
     LEFT JOIN users u ON u.id = n.created_by
     LEFT JOIN billing_notification_recipients r ON r.notification_id = n.id
     GROUP BY n.id
     ORDER BY n.created_at DESC`
  );
}
