/**
 * GET /api/admin/subcenters  — list all subcenters (admin view)
 */
import { ok, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getAllSubcenters } from "@/services/centers.service";

export async function GET(request) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get("centerId") ?? null;
    const subcenters = await getAllSubcenters(centerId);
    return ok(subcenters);
  } catch (e) { return serverError(e); }
}
