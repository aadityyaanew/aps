/**
 * GET  /api/center/subcenters  — center's own subcenters
 * POST /api/center/subcenters  — create new subcenter under this center
 */
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getAllSubcenters, createSubcenter } from "@/services/centers.service";

export async function GET(request) {
  const { user, error } = await requireRole("center");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const subcenters = await getAllSubcenters(user.id);
    return ok(subcenters);
  } catch (e) { return serverError(e); }
}

export async function POST(request) {
  const { user, error } = await requireRole("center");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const body = await request.json();
    const { name, email, password, phone, organization_name } = body;
    if (!name || !email || !password) return err("name, email and password are required");
    const id = await createSubcenter({ name, email, password, phone, organization_name, parentCenterId: user.id });
    return ok({ id }, 201);
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return err("Email already exists", 409);
    return serverError(e);
  }
}
