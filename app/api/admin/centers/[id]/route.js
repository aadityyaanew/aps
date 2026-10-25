/**
 * GET    /api/admin/centers/[id]  — get center (unit) details
 * PUT    /api/admin/centers/[id]  — update center details & credentials
 * PATCH  /api/admin/centers/[id]  — toggle activate / deactivate without affecting leads
 * DELETE /api/admin/centers/[id]  — delete center
 */
import { ok, err, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getCenterById, updateCenter, toggleUserActive, deleteCenter } from "@/services/centers.service";

export async function GET(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const center = await getCenterById(id);
    if (!center) return notFound("Unit");
    return ok(center);
  } catch (e) { return serverError(e); }
}

export async function PUT(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const body = await request.json();
    await updateCenter(id, body);
    return ok({ updated: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return err("Email already in use", 409);
    if (e.message?.includes("characters")) return err(e.message, 400);
    return serverError(e);
  }
}

export async function PATCH(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_active } = body;
    if (is_active === undefined) return err("is_active is required", 400);
    await toggleUserActive(id, is_active);
    return ok({ updated: true, is_active: Boolean(is_active) });
  } catch (e) { return serverError(e); }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    await deleteCenter(id);
    return ok({ deleted: true });
  } catch (e) { return serverError(e); }
}
