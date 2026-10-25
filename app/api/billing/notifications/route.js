import { getCurrentUser } from "@/lib/session";
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import {
  getNotificationsForUnit,
  getAllNotificationsAdmin,
} from "@/repositories/billing-notifications.repo";
import { adminSendNotification } from "@/services/billing.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (user.role === "admin") {
      const all = await getAllNotificationsAdmin();
      return ok(all);
    }

    if (user.role === "center") {
      if (!user.billingAccess) return forbidden();
      const notifs = await getNotificationsForUnit(user.id);
      return ok(notifs);
    }

    return forbidden();
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    const body = await req.json();
    const { title, message, type = "announcement", targetAllUnits = true, unitIds = [] } = body;

    if (!title?.trim() || !message?.trim()) {
      return err("Notification title and message are required.");
    }

    const result = await adminSendNotification({
      title,
      message,
      type,
      createdBy: user.id,
      targetAllUnits: Boolean(targetAllUnits),
      unitIds: Array.isArray(unitIds) ? unitIds : [],
    });

    return ok(result, 201);
  } catch (error) {
    return serverError(error);
  }
}
