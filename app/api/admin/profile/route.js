/**
 * GET /api/admin/profile  — get super admin's profile
 * PUT /api/admin/profile  — update super admin's name, email, phone, org, or password
 */
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { updateProfile } from "@/services/auth.service";
import { findById } from "@/repositories/users.repo";

export async function GET() {
  const { user, error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();

  try {
    const admin = await findById(user.id);
    if (!admin) return unauthorized();
    return ok({
      id:                admin.id,
      name:              admin.name,
      email:             admin.email,
      phone:             admin.phone,
      organization_name: admin.organization_name,
      role:              admin.role,
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(request) {
  const { user, error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();

  try {
    const body = await request.json();
    const { name, email, phone, organization_name, password } = body;

    if (!name || !email) {
      return err("Name and email are required.", 400);
    }

    await updateProfile(user.id, { name, email, phone, organization_name, password });
    return ok({ message: "Admin credentials updated successfully." });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return err("Email already in use by another account.", 409);
    }
    if (e.message?.includes("characters")) {
      return err(e.message, 400);
    }
    return serverError(e);
  }
}
