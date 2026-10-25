import { getCurrentUser } from "@/lib/session";
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { adminReviewInvoice } from "@/services/billing.service";

export async function PATCH(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    const { id } = await params;
    const body = await req.json();
    const { status, adminRemarks } = body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return err("Invalid status. Expected Approved, Rejected, or Pending.");
    }

    const updated = await adminReviewInvoice({
      invoiceId: parseInt(id, 10),
      status,
      adminRemarks,
      reviewerId: user.id,
    });

    return ok(updated);
  } catch (error) {
    return serverError(error);
  }
}
