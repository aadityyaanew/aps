import { getCurrentUser } from "@/lib/session";
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { verifyBillingPassword, setInitialBillingPassword } from "@/services/billing.service";

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (user.role !== "center") {
      // If admin, they don't need a unit billing password
      if (user.role === "admin") {
        return ok({ verified: true });
      }
      return forbidden();
    }

    if (!user.billingAccess) {
      return forbidden();
    }

    const body = await req.json();
    const { action, password } = body;

    if (action === "create") {
      if (!password || password.length < 4) {
        return err("Password must be at least 4 characters long.");
      }
      await setInitialBillingPassword(user.id, password);
      return ok({ message: "Billing password created successfully." });
    }

    if (action === "verify") {
      const isValid = await verifyBillingPassword(user.id, password);
      if (!isValid) {
        return err("Incorrect billing password. Please try again.", 401);
      }
      return ok({ verified: true });
    }

    return err("Invalid action. Must be 'create' or 'verify'.");
  } catch (error) {
    return serverError(error);
  }
}
