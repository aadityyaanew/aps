/**
 * PUT /api/center/leads/[id]  — update lead status or details
 */
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { updateLeadStatus, updateAdmStatus, updateLead } from "@/services/leads.service";

export async function PUT(request, { params }) {
  const { error } = await requireRole("center");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "status")     await updateLeadStatus(params.id, data.status);
    else if (action === "adm")   await updateAdmStatus(params.id, data.admStatus);
    else if (action === "full")  await updateLead(params.id, data);
    else return err("Invalid action. Use: status | adm | full");

    return ok({ updated: true });
  } catch (e) {
    if (e.message === "Invalid status")     return err(e.message, 422);
    if (e.message === "Invalid ADM status") return err(e.message, 422);
    return serverError(e);
  }
}
