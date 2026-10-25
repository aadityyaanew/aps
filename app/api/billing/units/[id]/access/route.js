import { getCurrentUser } from "@/lib/session";
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { adminToggleBillingAccess } from "@/services/billing.service";

export async function PATCH(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    const { id } = await params;
    const body = await req.json();
    const { billing_access } = body;

    if (billing_access === undefined) {
      return err("billing_access is required.");
    }

    const result = await adminToggleBillingAccess(parseInt(id, 10), Boolean(billing_access));
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
