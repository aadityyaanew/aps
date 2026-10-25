/**
 * GET  /api/admin/leads — all leads across the system (admin view)
 * POST /api/admin/leads — admin creates a new lead
 */
import { ok, err, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/session";
import { getAllLeads, addLead } from "@/services/leads.service";
import * as usersRepo from "@/repositories/users.repo";

export async function GET(request) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      status:   searchParams.get("status")   ?? undefined,
      centerId: searchParams.get("centerId") ?? undefined,
      limit:    parseInt(searchParams.get("limit")  ?? "50"),
      offset:   parseInt(searchParams.get("offset") ?? "0"),
    };
    const leads = await getAllLeads(filters);
    return ok(leads);
  } catch (e) { return serverError(e); }
}

export async function POST(request) {
  const { error } = await requireRole("admin");
  if (error === "unauthenticated") return unauthorized();
  if (error === "forbidden")       return forbidden();
  try {
    const body = await request.json();
    const { studentName, phone, email, universityId, courseId } = body;
    let centerId = body.centerId;

    if (!studentName?.trim() || !phone?.trim() || !email?.trim()) {
      return err("studentName, phone, and email are required");
    }

    if (!universityId || !courseId) {
      return err("universityId and courseId are required");
    }

    // If centerId not specified, associate with first active center or fallback
    if (!centerId) {
      const centers = await usersRepo.findAllCenters();
      if (centers && centers.length > 0) {
        centerId = centers[0].id;
      }
    }

    if (!centerId) {
      return err("A valid center must exist to assign leads.");
    }

    const result = await addLead({
      ...body,
      centerId,
      subcenterId: body.subcenterId || null,
    });
    return ok({
      id: result.id,
      leadType: result.leadType,
      isDuplicate: result.isDuplicate,
    }, 201);
  } catch (e) {
    return serverError(e);
  }
}
