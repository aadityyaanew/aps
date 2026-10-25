/**
 * PUT    /api/admin/courses/[id] — update a course
 * DELETE /api/admin/courses/[id] — delete a course
 */
import { ok, err, serverError, unauthorized, forbidden } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { updateCourse, deleteCourse } from "@/repositories/universities.repo";

export async function PUT(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, duration, fees } = body;
    if (!name?.trim()) return err("Course name is required");
    await updateCourse(id, { name: name.trim(), duration: duration?.trim() || null, fees: fees ? parseFloat(fees) : null });
    return ok({ id });
  } catch (e) { return serverError(e); }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    await deleteCourse(id);
    return ok({ deleted: true });
  } catch (e) { return serverError(e); }
}
