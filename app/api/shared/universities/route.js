/**
 * GET  /api/shared/universities  — all universities for dropdowns
 * POST /api/shared/universities  — create university (with optional initial course)
 */
import { ok, err, serverError, unauthorized } from "@/lib/api-response";
import { getSession } from "@/lib/session";
import { findAllUniversities, createUniversity, createCourse } from "@/repositories/universities.repo";

export async function GET() {
  try {
    const universities = await findAllUniversities();
    return ok(universities);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  try {
    const body = await request.json();
    const { name, location, website, courseName, duration, fees } = body;
    if (!name?.trim()) return err("University name is required");

    const universityId = await createUniversity({
      name: name.trim(),
      location: location?.trim() || null,
      website: website?.trim() || null,
    });

    let courseId = null;
    if (courseName?.trim()) {
      courseId = await createCourse({
        universityId,
        name: courseName.trim(),
        duration: duration?.trim() || null,
        fees: fees ? parseFloat(fees) : null,
      });
    }

    return ok({ id: universityId, courseId }, 201);
  } catch (e) {
    return serverError(e);
  }
}
