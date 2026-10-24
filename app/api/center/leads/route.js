/**
 * GET  /api/center/leads  — center's leads (own + subcenters)
 * POST /api/center/leads  — add a new lead
 */
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getCenterLeads, addLead } from "@/services/leads.service";

export async function GET(request) {
  const { user, error } = await requireRole("center");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") ?? undefined,
      limit:  parseInt(searchParams.get("limit")  ?? "50"),
      offset: parseInt(searchParams.get("offset") ?? "0"),
    };
    const leads = await getCenterLeads(user.id, filters);
    return ok(leads);
  } catch (e) { return serverError(e); }
}

export async function POST(request) {
  const { user, error } = await requireRole("center");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const body = await request.json();
    const { studentName, phone } = body;
    if (!studentName || !phone) return err("studentName and phone are required");
    const id = await addLead({ ...body, centerId: user.id, subcenterId: null });
    return ok({ id }, 201);
  } catch (e) { return serverError(e); }
}
