/**
 * POST /api/auth/change-password
 * Allows any authenticated user (admin, center/unit, subcenter/associate) to change their password.
 */
import { ok, err, unauthorized, serverError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { changePassword } from "@/services/auth.service";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return err("Current password and new password are required.", 400);
    }

    if (newPassword.length < 6) {
      return err("New password must be at least 6 characters.", 400);
    }

    await changePassword(user.id, currentPassword, newPassword);
    return ok({ message: "Password changed successfully." });
  } catch (e) {
    if (e.message?.includes("incorrect") || e.message?.includes("characters") || e.message?.includes("required")) {
      return err(e.message, 400);
    }
    return serverError(e);
  }
}
