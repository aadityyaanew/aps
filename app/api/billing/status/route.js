import { getCurrentUser } from "@/lib/session";
import { ok, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { getUnitBillingStatus } from "@/services/billing.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (user.role === "admin") {
      return ok({
        role: "admin",
        hasAccess: true,
        hasPassword: true,
        unreadCount: 0,
      });
    }

    if (user.role !== "center") {
      return forbidden();
    }

    const status = await getUnitBillingStatus(user.id);
    return ok({
      role: "center",
      ...status,
    });
  } catch (error) {
    return serverError(error);
  }
}
