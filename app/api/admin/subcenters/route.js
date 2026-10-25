/**
 * GET  /api/admin/subcenters  — list all subcenters (admin view)
 * POST /api/admin/subcenters  — admin create new subcenter under a specified center
 */
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getAllSubcenters, createSubcenter } from "@/services/centers.service";

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

export async function POST(request) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const body = await request.json();
    const { name, email, password, phone, organization_name, parentCenterId } = body;
    if (!name || !email || !password || !parentCenterId) {
      return err("Name, email, password and parent unit are required", 400);
    }
    const id = await createSubcenter({ name, email, password, phone, organization_name, parentCenterId });
    return ok({ id }, 201);
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return err("Email already exists", 409);
    return serverError(e);
  }
}
