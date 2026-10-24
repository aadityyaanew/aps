/**
 * GET /api/shared/courses?universityId=X  — courses by university
 */
import { ok, err, serverError } from "@/lib/api-response";
import { findCoursesByUniversity } from "@/repositories/universities.repo";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get("universityId");
    if (!universityId) return err("universityId is required");
    const courses = await findCoursesByUniversity(universityId);
    return ok(courses);
  } catch (e) { return serverError(e); }
}
