/**
 * PUT /api/center/leads/[id] — update lead details or type (automation/backend push)
 * NOTE: Status and ADM Status can only be changed by Super Admin.
 */
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { updateLeadType, updateLead } from "@/services/leads.service";

export async function PUT(request, { params }) {
  const { error } = await requireRole("center");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();

  try {
    const body = await request.json();
    const { action, ...data } = body;
    const { id } = await params;

    if (action === "type") {
      // Allow automation / backend push to update type (e.g. Primary, Duplicate, Under Review)
      await updateLeadType(id, data.leadType);
    } else if (action === "full") {
      // Do not allow center to override status or admStatus directly
      delete data.status;
      delete data.admStatus;
      await updateLead(id, data);
    } else if (action === "status" || action === "adm") {
      return err("Lead Status and ADM Status can only be edited by Super Admin", 403);
    } else {
      return err("Invalid action. Use: type | full");
    }

    return ok({ updated: true });
  } catch (e) {
    if (e.message?.startsWith("Invalid")) return err(e.message, 422);
    return serverError(e);
  }
}
