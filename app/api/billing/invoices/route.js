import { getCurrentUser } from "@/lib/session";
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { findInvoicesByUnit, findAllInvoices } from "@/repositories/invoices.repo";
import { submitUnitInvoice } from "@/services/billing.service";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || "";
    const year = searchParams.get("year") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    if (user.role === "admin") {
      const unit_id = searchParams.get("unit_id") || "";
      const invoices = await findAllInvoices({ unit_id, month, year, status, search });
      return ok(invoices);
    }

    if (user.role === "center") {
      if (!user.billingAccess) {
        return forbidden();
      }
      const invoices = await findInvoicesByUnit(user.id, { month, year, status, search });
      return ok(invoices);
    }

    return forbidden();
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (user.role !== "center" && user.role !== "admin") {
      return forbidden();
    }

    if (user.role === "center" && !user.billingAccess) {
      return forbidden();
    }

    const formData = await req.formData();
    const invoiceNumber = formData.get("invoice_number");
    const amount = formData.get("amount");
    const signedBy = formData.get("signed_by");
    const file = formData.get("file");

    // Automatically compute date, month, and year from server timestamp in Asia/Kolkata
    // to strictly prevent any client-side manipulation of date, time, month, or year
    const now = new Date();
    const serverInvoiceDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const serverInvoiceMonth = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      month: "long",
    }).format(now);

    const serverInvoiceYear = parseInt(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
      }).format(now),
      10
    );

    // If admin is testing/uploading on behalf of a unit, allow target_unit_id, otherwise use user.id
    const targetUnitId = user.role === "admin" && formData.get("unit_id") 
      ? parseInt(formData.get("unit_id"), 10) 
      : user.id;

    if (!invoiceNumber || !amount || !signedBy || !file) {
      return err("All fields (Invoice Number, Amount, Signed By, and Document) are mandatory.");
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (file.type && !allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|webp|doc|docx)$/i)) {
      return err("Invalid file format. Please upload PDF, PNG, JPG, or DOC documents.");
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return err("File size exceeds 20MB limit.");
    }

    const invoice = await submitUnitInvoice({
      unitId: targetUnitId,
      invoiceNumber: String(invoiceNumber),
      invoiceDate: serverInvoiceDate,
      invoiceMonth: serverInvoiceMonth,
      invoiceYear: serverInvoiceYear,
      amount: String(amount),
      signedBy: String(signedBy),
      file,
    });

    return ok(invoice, 201);
  } catch (error) {
    console.error("[Invoice Upload Error]:", error);
    return err(error.message || "Failed to upload invoice.", 500);
  }
}
