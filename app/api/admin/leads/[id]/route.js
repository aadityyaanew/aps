/**
 * PUT /api/admin/leads/[id] — update lead status, ADM status, or lead type
 * Restricted exclusively to Super Admin.
 */
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { updateLeadStatus, updateAdmStatus, updateLeadType, updateLead } from "@/services/leads.service";

export async function PUT(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();

  try {
    const body = await request.json();
    const { action, ...data } = body;
    const { id } = await params;

    if (action === "status") {
      await updateLeadStatus(id, data.status);
    } else if (action === "adm") {
      await updateAdmStatus(id, data.admStatus);
    } else if (action === "type") {
      await updateLeadType(id, data.leadType);
    } else if (action === "full") {
      await updateLead(id, data);
    } else {
      return err("Invalid action. Use: status | adm | type | full");
    }

    return ok({ updated: true });
  } catch (e) {
    if (e.message?.startsWith("Invalid")) {
      return err(e.message, 422);
    }
    return serverError(e);
  }
}
