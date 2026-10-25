/**
 * GET    /api/admin/universities/[id] — get single university
 * PUT    /api/admin/universities/[id] — update university
 * DELETE /api/admin/universities/[id] — delete university (cascades courses)
 */
import { ok, err, notFound, serverError, unauthorized, forbidden } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import {
  findUniversityById,
  updateUniversity,
  deleteUniversity,
} from "@/repositories/universities.repo";

export async function GET(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const uni = await findUniversityById(id);
    if (!uni) return notFound("University");
    return ok(uni);
  } catch (e) { return serverError(e); }
}

export async function PUT(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, location, website } = body;
    if (!name?.trim()) return err("Name is required");
    await updateUniversity(id, { name: name.trim(), location: location?.trim() || null, website: website?.trim() || null });
    return ok({ id });
  } catch (e) { return serverError(e); }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    await deleteUniversity(id);
    return ok({ deleted: true });
  } catch (e) { return serverError(e); }
}
