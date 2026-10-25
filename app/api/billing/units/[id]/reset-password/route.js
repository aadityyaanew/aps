import { getCurrentUser } from "@/lib/session";
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { adminResetBillingPassword } from "@/services/billing.service";

export async function POST(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    const { id } = await params;
    const body = await req.json();
    const { new_password } = body;

    if (!new_password || new_password.length < 4) {
      return err("New password must be at least 4 characters long.");
    }

    const result = await adminResetBillingPassword(parseInt(id, 10), new_password);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
