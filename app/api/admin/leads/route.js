/**
 * GET /api/admin/leads  — all leads across the system (admin view)
 */
import { ok, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getAllLeads } from "@/services/leads.service";

export async function GET(request) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      status:   searchParams.get("status")   ?? undefined,
      centerId: searchParams.get("centerId") ?? undefined,
      limit:    parseInt(searchParams.get("limit")  ?? "50"),
      offset:   parseInt(searchParams.get("offset") ?? "0"),
    };
    const leads = await getAllLeads(filters);
    return ok(leads);
  } catch (e) { return serverError(e); }
}
