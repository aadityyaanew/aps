/**
 * GET  /api/shared/courses?universityId=X  — courses by university
 * POST /api/shared/courses                 — add a course to a university
 */
import { ok, err, serverError, unauthorized } from "@/lib/api-response";
import { getSession } from "@/lib/session";
import { findCoursesByUniversity, createCourse } from "@/repositories/universities.repo";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get("universityId");
    if (!universityId) return err("universityId is required");
    const courses = await findCoursesByUniversity(universityId);
    return ok(courses);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  try {
    const body = await request.json();
    const { universityId, name, duration, fees } = body;
    if (!universityId || !name?.trim()) {
      return err("universityId and name are required");
    }

    const courseId = await createCourse({
      universityId: parseInt(universityId, 10),
      name: name.trim(),
      duration: duration?.trim() || null,
      fees: fees ? parseFloat(fees) : null,
    });

    return ok({ id: courseId }, 201);
  } catch (e) {
    return serverError(e);
  }
}
