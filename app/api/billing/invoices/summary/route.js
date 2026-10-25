import { getCurrentUser } from "@/lib/session";
import { ok, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { getBillingSummary } from "@/repositories/invoices.repo";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    const summary = await getBillingSummary();
    return ok(summary);
  } catch (error) {
    return serverError(error);
  }
}
