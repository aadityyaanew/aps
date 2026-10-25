import { getCurrentUser } from "@/lib/session";
import { ok, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/repositories/billing-notifications.repo";

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "center") return forbidden();

    const body = await req.json().catch(() => ({}));
    const { notificationId, markAll = false } = body;

    if (markAll) {
      await markAllNotificationsAsRead(user.id);
      return ok({ message: "All notifications marked as read." });
    }

    if (notificationId) {
      await markNotificationAsRead(parseInt(notificationId, 10), user.id);
      return ok({ message: "Notification marked as read." });
    }

    await markAllNotificationsAsRead(user.id);
    return ok({ message: "All notifications marked as read." });
  } catch (error) {
    return serverError(error);
  }
}
