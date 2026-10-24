/**
 * GET /api/shared/universities  — all universities for dropdowns
 */
import { ok, serverError } from "@/lib/api-response";
import { findAllUniversities } from "@/repositories/universities.repo";

export async function GET() {
  try {
    const universities = await findAllUniversities();
    return ok(universities);
  } catch (e) { return serverError(e); }
}
