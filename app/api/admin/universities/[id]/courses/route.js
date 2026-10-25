/**
 * GET  /api/admin/universities/[id]/courses — list courses for a university
 * POST /api/admin/universities/[id]/courses — add a course to a university
 */
import { ok, err, serverError, unauthorized, forbidden } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { findCoursesByUniversity, createCourse } from "@/repositories/universities.repo";

export async function GET(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const courses = await findCoursesByUniversity(id);
    return ok(courses);
  } catch (e) { return serverError(e); }
}

export async function POST(request, { params }) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, duration, fees } = body;
    if (!name?.trim()) return err("Course name is required");
    const courseId = await createCourse({
      universityId: id,
      name: name.trim(),
      duration: duration?.trim() || null,
      fees: fees ? parseFloat(fees) : null,
    });
    return ok({ id: courseId }, 201);
  } catch (e) { return serverError(e); }
}
