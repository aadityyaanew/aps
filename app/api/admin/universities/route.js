/**
 * GET  /api/admin/universities — list all universities
 * POST /api/admin/universities — create a new university
 */
import { ok, err, serverError, unauthorized, forbidden } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import {
  findAllUniversities,
  createUniversity,
} from "@/repositories/universities.repo";

export async function GET() {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const unis = await findAllUniversities();
    return ok(unis);
  } catch (e) { return serverError(e); }
}

export async function POST(request) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const body = await request.json();
    const { name, location, website } = body;
    if (!name?.trim()) return err("University name is required");
    const id = await createUniversity({ name: name.trim(), location: location?.trim() || null, website: website?.trim() || null });
    return ok({ id }, 201);
  } catch (e) { return serverError(e); }
}
