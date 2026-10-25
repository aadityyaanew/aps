import { getCurrentUser } from "@/lib/session";
import { ok, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { findAllCenters } from "@/repositories/users.repo";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    const units = await findAllCenters();
    return ok(units);
  } catch (error) {
    return serverError(error);
  }
}
