/**
 * GET   /api/center/subcenters/[id]  — get own subcenter details
 * PUT   /api/center/subcenters/[id]  — update own subcenter credentials/details
 * PATCH /api/center/subcenters/[id]  — toggle activate / deactivate without affecting leads
 */
import { ok, err, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getSubcenterById, updateSubcenter, toggleUserActive } from "@/services/centers.service";

export async function GET(request, { params }) {
  const { user, error } = await requireRole("center");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const subcenter = await getSubcenterById(id);
    if (!subcenter || subcenter.parent_center_id !== user.id) return notFound("Associate");
    return ok(subcenter);
  } catch (e) { return serverError(e); }
}

export async function PUT(request, { params }) {
  const { user, error } = await requireRole("center");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const subcenter = await getSubcenterById(id);
    if (!subcenter || subcenter.parent_center_id !== user.id) return notFound("Associate");

    const body = await request.json();
    // Protect parent_center_id from being changed by center
    body.parent_center_id = user.id;
    await updateSubcenter(id, body);
    return ok({ updated: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return err("Email already in use", 409);
    if (e.message?.includes("characters")) return err(e.message, 400);
    return serverError(e);
  }
}

export async function PATCH(request, { params }) {
  const { user, error } = await requireRole("center");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const subcenter = await getSubcenterById(id);
    if (!subcenter || subcenter.parent_center_id !== user.id) return notFound("Associate");

    const body = await request.json();
    const { is_active } = body;
    if (is_active === undefined) return err("is_active is required", 400);
    await toggleUserActive(id, is_active);
    return ok({ updated: true, is_active: Boolean(is_active) });
  } catch (e) { return serverError(e); }
}
