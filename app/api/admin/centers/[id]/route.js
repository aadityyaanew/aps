/**
 * GET    /api/admin/centers/[id]  — get center details
 * PUT    /api/admin/centers/[id]  — update center
 * DELETE /api/admin/centers/[id]  — delete center
 */
import { ok, err, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getCenterById, updateUser, deleteCenter } from "@/services/centers.service";

export async function GET(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const center = await getCenterById(params.id);
    if (!center) return notFound("Center");
    return ok(center);
  } catch (e) { return serverError(e); }
}

export async function PUT(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const body = await request.json();
    await updateUser(params.id, body);
    return ok({ updated: true });
  } catch (e) { return serverError(e); }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    await deleteCenter(params.id);
    return ok({ deleted: true });
  } catch (e) { return serverError(e); }
}
