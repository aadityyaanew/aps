/**
 * GET  /api/admin/centers       — list all centers
 * POST /api/admin/centers       — create new center
 */
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getAllCenters, createCenter } from "@/services/centers.service";

export async function GET() {
  const { user, error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const centers = await getAllCenters();
    return ok(centers);
  } catch (e) { return serverError(e); }
}

export async function POST(request) {
  const { user, error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const body = await request.json();
    const { name, email, password, phone, organization_name, address } = body;
    if (!name || !email || !password) return err("name, email and password are required");
    const id = await createCenter({ name, email, password, phone, organization_name, address });
    return ok({ id }, 201);
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return err("Email already exists", 409);
    return serverError(e);
  }
}
