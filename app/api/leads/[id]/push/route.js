/**
 * POST /api/leads/[id]/push
 * Pushes a lead to the university's external CRM/API (e.g. Shoolini University LeadSquared).
 * If the lead already exists in the external CRM, updates lead_type to "Duplicate".
 * If successfully pushed, updates lead_type to "Primary".
 */
import { ok, err, unauthorized, serverError, notFound } from "@/lib/api-response";
import { getSession } from "@/lib/session";
import * as leadsRepo from "@/repositories/leads.repo";
import { getOneCrmUniversityConfig, pushLeadToOneCrm } from "@/lib/onecrm";
import { pushLeadToGla } from "@/lib/gla";

import fs from "fs";
import path from "path";

function cleanKey(val) {
  if (!val) return "";
  return String(val)
    .replace(/\\/g, "")           // Strip any escape backslashes (e.g. u\$rf -> u$rf)
    .replace(/^['"]|['"]$/g, "")  // Strip surrounding quotes
    .trim();                      // Strip whitespace
}

function getShooliniCredentials() {
  let host = process.env.SHOOLINI_API_HOST || "https://api-in21.leadsquared.com/v2/";
  let accessKey = cleanKey(process.env.SHOOLINI_ACCESS_KEY);
  let secretKey = cleanKey(process.env.SHOOLINI_SECRET_KEY);
  host = String(host).replace(/^['"]|['"]$/g, "").trim();

  // Protect against Next.js $ expansion bug or missing keys in production
  if (!accessKey || accessKey.length < 15 || !secretKey) {
    const envFiles = [".env.production", ".env.local", ".env"];
    for (const file of envFiles) {
      try {
        const envPath = path.join(process.cwd(), file);
        if (fs.existsSync(envPath)) {
          const raw = fs.readFileSync(envPath, "utf-8");
          for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (trimmed.startsWith("SHOOLINI_ACCESS_KEY=")) {
              accessKey = cleanKey(trimmed.replace("SHOOLINI_ACCESS_KEY=", ""));
            }
            if (trimmed.startsWith("SHOOLINI_SECRET_KEY=")) {
              secretKey = cleanKey(trimmed.replace("SHOOLINI_SECRET_KEY=", ""));
            }
            if (trimmed.startsWith("SHOOLINI_API_HOST=")) {
              host = String(trimmed.replace("SHOOLINI_API_HOST=", "")).replace(/^['"]|['"]$/g, "").trim();
            }
          }
          if (accessKey && accessKey.length >= 15 && secretKey) break;
        }
      } catch (e) {
        console.warn(`[Env Read Warning for ${file}]:`, e.message);
      }
    }
  }

  // Guaranteed fallback to verified Shoolini credentials if production environment is missing them
  if (!accessKey || accessKey.length < 15) {
    accessKey = "u$rf26e5b7ea589e91e738ca0e5e22db348";
  }
  if (!secretKey || secretKey.length < 15) {
    secretKey = "2ee455f80eaa54f3e8d24b27bd99ae0393af5b5e";
  }

  return { host, accessKey, secretKey };
}

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  try {
    const { id } = await params;
    const lead = await leadsRepo.findById(id);
    if (!lead) return notFound("Lead");

    if (lead.is_pushed || lead.lead_type === "Primary") {
      return err("This lead has already been pushed and cannot be pushed again.", 400);
    }

    const uniName = (lead.university_name || "").toLowerCase();

    // Check if Shoolini University
    const isShoolini =
      uniName.includes("shoolini") ||
      uniName.includes("shalloni") ||
      uniName.includes("shaallni") ||
      uniName.includes("shoolini university");

    if (isShoolini) {
      const { host, accessKey, secretKey } = getShooliniCredentials();

      if (!accessKey || !secretKey) {
        return err("Shoolini University API keys are not configured in .env.local", 500);
      }

      const phoneClean = (lead.phone || "").replace(/[^0-9]/g, "");
      const targetEmail = (lead.email || "").trim().toLowerCase();

      // Duplicate Lead Criteria:
      // A lead is marked as a duplicate ONLY when all three fields match simultaneously:
      // Mobile Number, Email ID, and University.
      // Partial matches (e.g. only phone, or only email) must be treated as Normal Leads, not duplicate.
      let isDuplicate = false;

      if (phoneClean && targetEmail) {
        try {
          const phoneUrl = `${host.replace(/\/+$/, "")}/LeadManagement.svc/RetrieveLeadByPhoneNumber?accessKey=${encodeURIComponent(accessKey)}&secretKey=${encodeURIComponent(secretKey)}&phone=${encodeURIComponent(phoneClean)}`;
          const phoneRes = await fetch(phoneUrl);
          if (phoneRes.ok) {
            const phoneData = await phoneRes.json().catch(() => null);
            if (Array.isArray(phoneData) && phoneData.length > 0) {
              // Verify that email ALSO matches on at least one returned lead
              const matched = phoneData.some((item) => {
                const itemEmail = (item.EmailAddress || item.Email || "").trim().toLowerCase();
                return itemEmail && itemEmail === targetEmail;
              });
              if (matched) {
                isDuplicate = true;
              }
            }
          }
        } catch (e) {
          console.warn("[Shoolini Check Phone Error]:", e.message);
        }

        // If phone query didn't find a simultaneous match, check email query to verify if phone matches
        if (!isDuplicate) {
          try {
            const emailUrl = `${host.replace(/\/+$/, "")}/LeadManagement.svc/Leads.GetByEmailaddress?accessKey=${encodeURIComponent(accessKey)}&secretKey=${encodeURIComponent(secretKey)}&emailaddress=${encodeURIComponent(targetEmail)}`;
            const emailRes = await fetch(emailUrl);
            if (emailRes.ok) {
              const emailData = await emailRes.json().catch(() => null);
              if (Array.isArray(emailData) && emailData.length > 0) {
                const matched = emailData.some((item) => {
                  const itemPhone = String(item.Phone || item.Mobile || "").replace(/[^0-9]/g, "");
                  const itemLast10 = itemPhone.slice(-10);
                  const targetLast10 = phoneClean.slice(-10);
                  return itemLast10 && targetLast10 && itemLast10 === targetLast10;
                });
                if (matched) {
                  isDuplicate = true;
                }
              }
            }
          } catch (e) {
            console.warn("[Shoolini Check Email Error]:", e.message);
          }
        }
      }

      // If already exists in LeadSquared CRM matching both Phone and Email simultaneously:
      if (isDuplicate) {
        await leadsRepo.updateLeadType(id, "Duplicate");
        await leadsRepo.markAsPushed(id);
        return ok({
          success: true,
          isDuplicate: true,
          leadType: "Duplicate",
          message: "Lead already exists in Shoolini University CRM! Type updated to Duplicate.",
        });
      }

      // 3. Lead does not exist yet -> Push via Lead.Capture using ONLY: Lead Name, Phone Number, Email, Course Interested
      const nameParts = (lead.student_name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || lead.student_name?.trim() || "Lead";
      const lastName = nameParts.slice(1).join(" ") || "";

      const captureUrl = `${host.replace(/\/+$/, "")}/LeadManagement.svc/Lead.Capture?accessKey=${encodeURIComponent(accessKey)}&secretKey=${encodeURIComponent(secretKey)}`;

      const leadSource = process.env.SHOOLINI_LEAD_SOURCE || "hyskilled";

      const payload = [
        { Attribute: "FirstName", Value: firstName },
        { Attribute: "LastName", Value: lastName },
        { Attribute: "Phone", Value: phoneClean },
        { Attribute: "Mobile", Value: phoneClean },
        { Attribute: "Source", Value: leadSource },
        { Attribute: "LeadSource", Value: leadSource },
        { Attribute: "mx_Lead_Source", Value: leadSource },
        { Attribute: "SourceMedium", Value: leadSource },
      ];

      if (lead.email?.trim()) {
        payload.push({ Attribute: "EmailAddress", Value: lead.email.trim() });
      }

      if (lead.course_name?.trim()) {
        // Shoolini LeadSquared schema maps "Course Interested" to mx_COURSES and "Course" to mx_Course
        payload.push({ Attribute: "mx_COURSES", Value: lead.course_name.trim() });
        payload.push({ Attribute: "mx_Course", Value: lead.course_name.trim() });
      }

      const captureRes = await fetch(captureUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await captureRes.text();
      let captureData = null;
      try {
        captureData = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn("[Shoolini JSON Parse Warning]:", parseErr.message, rawText);
      }

      const errMsg = (
        captureData?.ExceptionMessage ||
        (typeof captureData?.Message === "string" ? captureData.Message : "") ||
        captureData?.ErrorMessage ||
        ""
      ).toLowerCase();

      const errType = (captureData?.ExceptionType || "").toLowerCase();
      const rawLower = (rawText || "").toLowerCase();

      // Check if lead already exists in Shoolini LeadSquared CRM
      const isDuplicateEntry =
        errType.includes("duplicate") ||
        errType.includes("unauthorized") ||
        errMsg.includes("already exist") ||
        errMsg.includes("already exists") ||
        errMsg.includes("duplicate") ||
        errMsg.includes("permission to update") ||
        errMsg.includes("same email") ||
        errMsg.includes("same phone") ||
        errMsg.includes("conflict") ||
        errMsg.includes("already present") ||
        rawLower.includes("duplicate") ||
        rawLower.includes("already exist") ||
        rawLower.includes("permission to update") ||
        (captureData?.Status === "Success" && captureData?.Message?.IsCreated === false);

      if (isDuplicateEntry) {
        await leadsRepo.updateLeadType(id, "Duplicate");
        return ok({
          success: true,
          isDuplicate: true,
          leadType: "Duplicate",
          message: "Lead already exists in Shoolini University CRM! Type updated to Duplicate.",
        });
      }

      // Check for clean successful creation
      if (
        (captureData?.Status === "Success" || captureRes.ok) &&
        captureData?.Status !== "Error"
      ) {
        await leadsRepo.updateLeadType(id, "Primary");
        await leadsRepo.markAsPushed(id);
        return ok({
          success: true,
          isDuplicate: false,
          leadType: "Primary",
          message: "Lead successfully pushed to Shoolini University CRM! Type updated to Primary.",
          data: captureData,
        });
      }

      // If genuine other error
      const displayError =
        captureData?.ExceptionMessage ||
        (typeof captureData?.Message === "string" ? captureData.Message : null) ||
        captureData?.ErrorMessage ||
        "Failed to push lead to Shoolini University CRM";

      return err(displayError, 400);
    }

    // Check if GLA University
    const isGla =
      uniName.includes("gla") ||
      uniName.includes("gla university") ||
      uniName.includes("gla online");

    if (isGla) {
      const pushRes = await pushLeadToGla(lead);

      if (!pushRes.success) {
        return err(pushRes.error || "Failed to push lead to GLA University CRM", 400);
      }

      if (pushRes.isDuplicate) {
        await leadsRepo.updateLeadType(id, "Duplicate");
        await leadsRepo.markAsPushed(id);
        return ok({
          success: true,
          isDuplicate: true,
          leadType: "Duplicate",
          message: pushRes.message,
          data: pushRes.data,
        });
      }

      // Successful primary lead push
      await leadsRepo.updateLeadType(id, "Primary");
      await leadsRepo.markAsPushed(id);
      return ok({
        success: true,
        isDuplicate: false,
        leadType: "Primary",
        message: pushRes.message,
        data: pushRes.data,
      });
    }

    // Check if university is integrated with OneCRM Lead API
    const oneCrmConfig = getOneCrmUniversityConfig(lead.university_name);

    if (oneCrmConfig) {
      const pushRes = await pushLeadToOneCrm(lead, oneCrmConfig);

      if (!pushRes.success) {
        return err(
          pushRes.error || `Failed to push lead to ${oneCrmConfig.displayName} CRM`,
          pushRes.status || 400
        );
      }

      if (pushRes.isDuplicate) {
        await leadsRepo.updateLeadType(id, "Duplicate");
        await leadsRepo.markAsPushed(id);
        return ok({
          success: true,
          isDuplicate: true,
          leadType: "Duplicate",
          message: pushRes.message,
          data: pushRes.data,
        });
      }

      // Successful primary lead push
      await leadsRepo.updateLeadType(id, "Primary");
      await leadsRepo.markAsPushed(id);
      return ok({
        success: true,
        isDuplicate: false,
        leadType: "Primary",
        message: pushRes.message,
        data: pushRes.data,
      });
    }

    // For other universities where API hasn't been configured yet
    return err(
      `Push API for "${lead.university_name || "selected university"}" will be configured soon.`
    );
  } catch (e) {
    return serverError(e);
  }
}

