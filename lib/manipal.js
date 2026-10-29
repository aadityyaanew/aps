import fs from "fs";
import path from "path";

/**
 * Allowed Course Values for Online Manipal as defined in manipal_api.pdf:
 * Section 6: Allowed Course Values (mx_course_applying_for)
 */
export const MANIPAL_MUJ_COURSES = [
  "BBA",
  "MBA",
  "B.Com",
  "M.Com",
  "BCA",
  "MCA",
  "MA.JMC",
  "MA in Economics",
  "MSc in Mathematics",
];

export const MANIPAL_SMU_COURSES = [
  "BA",
  "MA in English",
  "MA in Sociology",
  "MA in Political Science",
  "B.Com",
  "M.Com",
  "MCA",
  "MBA",
  "BBA",
];

/**
 * Clean environment keys from surrounding quotes and escape characters.
 */
function cleanKey(val) {
  if (!val) return "";
  return String(val)
    .replace(/\\/g, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

/**
 * Get Manipal API credentials and configuration from process.env or fallback env files.
 */
export function getManipalCredentials() {
  let apiUrl = cleanKey(process.env.MANIPAL_API_URL);
  let source = cleanKey(process.env.MANIPAL_SOURCE) || "Agents";
  let sourceMedium = cleanKey(process.env.MANIPAL_SOURCE_MEDIUM) || "GIPL";
  let inboundMobile = cleanKey(process.env.MANIPAL_INBOUND_MOBILE) || "+91- 8076480188";

  // Check fallback env files if missing
  if (!apiUrl) {
    const envFiles = [".env.production", ".env.local", ".env"];
    for (const file of envFiles) {
      try {
        const envPath = path.join(process.cwd(), file);
        if (fs.existsSync(envPath)) {
          const raw = fs.readFileSync(envPath, "utf-8");
          for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (trimmed.startsWith("MANIPAL_API_URL=")) {
              apiUrl = cleanKey(trimmed.replace("MANIPAL_API_URL=", ""));
            }
            if (trimmed.startsWith("MANIPAL_SOURCE=")) {
              source = cleanKey(trimmed.replace("MANIPAL_SOURCE=", ""));
            }
            if (trimmed.startsWith("MANIPAL_SOURCE_MEDIUM=")) {
              sourceMedium = cleanKey(trimmed.replace("MANIPAL_SOURCE_MEDIUM=", ""));
            }
            if (trimmed.startsWith("MANIPAL_INBOUND_MOBILE=")) {
              inboundMobile = cleanKey(trimmed.replace("MANIPAL_INBOUND_MOBILE=", ""));
            }
          }
          if (apiUrl) break;
        }
      } catch (e) {
        console.warn(`[Manipal Env Read Warning for ${file}]:`, e.message);
      }
    }
  }

  // Fallback to verified Lapp API URL from manipal_api.pdf documentation
  if (!apiUrl) {
    apiUrl =
      "https://lapps-in21.leadsquared.com/executebylapptoken?name=da_54036_e738136c&stage=Live&xapikey=402809e910794df692e68da913bfee87";
  }

  return { apiUrl, source, sourceMedium, inboundMobile };
}

/**
 * Checks if a university name belongs to Manipal (MUJ, SMU, or Online Manipal).
 *
 * @param {string} universityName
 * @returns {boolean}
 */
export function isManipalUniversity(universityName) {
  if (!universityName) return false;
  const n = String(universityName).toLowerCase();
  return (
    n.includes("manipal") ||
    n.includes("sikkim manipal") ||
    n.includes("smu") ||
    n.includes("muj")
  );
}

/**
 * Resolves the enquired university code: "MUJ" or "SMU".
 *
 * @param {string} universityName
 * @param {string} [courseName]
 * @returns {"MUJ" | "SMU"}
 */
export function resolveManipalEnquiredUniversity(universityName, courseName = "") {
  const uni = String(universityName || "").toLowerCase();
  const course = String(courseName || "").toLowerCase();

  // Explicit SMU indicators
  if (uni.includes("sikkim") || uni.includes("smu")) {
    return "SMU";
  }

  // Explicit MUJ indicators
  if (uni.includes("jaipur") || uni.includes("muj")) {
    return "MUJ";
  }

  // Course-specific indicators if university is generically "Manipal University" / "Online Manipal"
  if (
    course.includes("english") ||
    course.includes("sociology") ||
    course.includes("political science") ||
    course === "ba" ||
    course.startsWith("ba ")
  ) {
    return "SMU";
  }

  if (
    course.includes("bca") ||
    course.includes("jmc") ||
    course.includes("economics") ||
    course.includes("mathematics")
  ) {
    return "MUJ";
  }

  // Default to MUJ (Manipal University Jaipur)
  return "MUJ";
}

/**
 * Resolves course name to exact allowed values specified in Section 6 of manipal_api.pdf.
 *
 * @param {string} courseName
 * @param {"MUJ" | "SMU"} enquiredUni
 * @returns {string} Allowed course value
 */
export function resolveManipalCourse(courseName, enquiredUni = "MUJ") {
  if (!courseName) return enquiredUni === "SMU" ? "BBA" : "BBA";

  const raw = String(courseName).trim();
  const lower = raw.toLowerCase();

  const allowedList = enquiredUni === "SMU" ? MANIPAL_SMU_COURSES : MANIPAL_MUJ_COURSES;

  // 1. Direct case-insensitive match against allowed course values
  const exact = allowedList.find((c) => c.toLowerCase() === lower);
  if (exact) return exact;

  if (enquiredUni === "SMU") {
    // SMU Allowed: BA, MA in English, MA in Sociology, MA in Political Science, B.Com, M.Com, MCA, MBA, BBA
    if (lower.includes("english")) return "MA in English";
    if (lower.includes("sociology")) return "MA in Sociology";
    if (lower.includes("political")) return "MA in Political Science";
    if (lower.includes("b.com") || lower.includes("bcom") || (lower.includes("commerce") && (lower.includes("bachelor") || !lower.includes("master")))) {
      return "B.Com";
    }
    if (lower.includes("m.com") || lower.includes("mcom") || (lower.includes("commerce") && lower.includes("master"))) {
      return "M.Com";
    }
    if (lower.includes("mca") || (lower.includes("computer") && lower.includes("master"))) {
      return "MCA";
    }
    if (lower.includes("mba") || (lower.includes("business") && lower.includes("master"))) {
      return "MBA";
    }
    if (lower.includes("bba") || (lower.includes("business") && (lower.includes("bachelor") || !lower.includes("master")))) {
      return "BBA";
    }
    if (lower === "ba" || lower.includes("bachelor of arts") || lower.startsWith("ba ") || lower.includes(" ba")) {
      return "BA";
    }
    return "BBA";
  }

  // MUJ Allowed: BBA, MBA, B.Com, M.Com, BCA, MCA, MA.JMC, MA in Economics, MSc in Mathematics
  if (lower.includes("economics")) return "MA in Economics";
  if (lower.includes("mathematics") || lower.includes("math")) return "MSc in Mathematics";
  if (lower.includes("jmc") || lower.includes("journalism") || lower.includes("mass communication")) return "MA.JMC";
  if (lower.includes("bca") || (lower.includes("computer") && (lower.includes("bachelor") || !lower.includes("master")))) {
    return "BCA";
  }
  if (lower.includes("mca") || (lower.includes("computer") && lower.includes("master"))) {
    return "MCA";
  }
  if (lower.includes("b.com") || lower.includes("bcom") || (lower.includes("commerce") && (lower.includes("bachelor") || !lower.includes("master")))) {
    return "B.Com";
  }
  if (lower.includes("m.com") || lower.includes("mcom") || (lower.includes("commerce") && lower.includes("master"))) {
    return "M.Com";
  }
  if (lower.includes("mba") || (lower.includes("business") && lower.includes("master"))) {
    return "MBA";
  }
  if (lower.includes("bba") || (lower.includes("business") && (lower.includes("bachelor") || !lower.includes("master")))) {
    return "BBA";
  }

  return "BBA";
}

/**
 * Format phone number to the required "+91-XXXXXXXXXX" format (Rule 1).
 *
 * @param {string} phone
 * @returns {string} Formatted phone e.g. "+91-9110429179"
 */
export function formatManipalPhone(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/[^0-9]/g, "");

  if (cleaned.length === 10) {
    return `+91-${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91-${cleaned.slice(2)}`;
  }
  if (cleaned.length > 10) {
    return `+91-${cleaned.slice(-10)}`;
  }
  return `+91-${cleaned}`;
}

/**
 * Push a lead to Online Manipal API (LeadSquared Lapp API).
 *
 * @param {object} lead - Lead object from database
 * @returns {Promise<{ success: boolean, isDuplicate?: boolean, leadType?: string, message?: string, error?: string, data?: any }>}
 */
export async function pushLeadToManipal(lead) {
  const { apiUrl, source, sourceMedium, inboundMobile } = getManipalCredentials();

  // 1. Name
  const fullName = (lead.student_name || "").trim() || "Lead";

  // 2. Email
  const email = (lead.email || "").trim();
  if (!email) {
    return {
      success: false,
      error: "Valid email address is required to push to Online Manipal.",
    };
  }

  // 3. Phone (Must include country code e.g. +91-9110429179)
  const phoneFormatted = formatManipalPhone(lead.phone);
  const rawDigits = (lead.phone || "").replace(/[^0-9]/g, "");
  if (!rawDigits || rawDigits.length < 10) {
    return {
      success: false,
      error: "Valid 10-digit mobile number is required to push to Online Manipal.",
    };
  }

  // 4. University & Course resolution
  const enquiredUni = resolveManipalEnquiredUniversity(lead.university_name, lead.course_name);
  const courseValue = resolveManipalCourse(lead.course_name, enquiredUni);

  // 5. Construct payload array as specified in Section 3 of manipal_api.pdf
  const payload = [
    { Attribute: "FirstName", Value: fullName },
    { Attribute: "EmailAddress", Value: email },
    { Attribute: "Phone", Value: phoneFormatted },
    { Attribute: "mx_course_applying_for", Value: courseValue },
    { Attribute: "Source", Value: source },
    { Attribute: "SourceMedium", Value: sourceMedium },
    { Attribute: "mx_Mobile", Value: inboundMobile },
    { Attribute: "mx_Enquired_University", Value: enquiredUni },
  ];

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let result = null;
    try {
      result = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn("[Manipal JSON Parse Warning]:", parseErr.message, rawText);
    }

    const msgObj = result?.message && typeof result.message === "object" ? result.message : {};
    const statusMsg = String(msgObj?.Message || result?.Message || result?.message || "").toLowerCase();
    const rawLower = (rawText || "").toLowerCase();

    // Check Duplicate:
    // LeadSquared Lapp returns HTTP 409 or message.statusCode 409 with "Error Occurred: Lead Already Exists"
    const isDuplicate =
      response.status === 409 ||
      result?.statusCode === 409 ||
      msgObj?.statusCode === 409 ||
      msgObj?.phoneExists === true ||
      msgObj?.emailExists === true ||
      statusMsg.includes("already exist") ||
      statusMsg.includes("already exists") ||
      statusMsg.includes("duplicate") ||
      rawLower.includes("lead already exists") ||
      rawLower.includes("duplicate");

    if (isDuplicate) {
      let reason = "";
      if (msgObj?.emailExists && msgObj?.phoneExists) {
        reason = " (Both Email and Phone already exist in Manipal CRM)";
      } else if (msgObj?.emailExists) {
        reason = " (Email already registered in Manipal CRM)";
      } else if (msgObj?.phoneExists) {
        reason = " (Phone number already registered in Manipal CRM)";
      }

      const baseMsg = msgObj?.Message || result?.Message || "Lead already exists in Online Manipal CRM!";
      const displayMsg = `${baseMsg}${reason ? `${reason}.` : "."} Type updated to Duplicate.`;

      return {
        success: true,
        isDuplicate: true,
        leadType: "Duplicate",
        message: displayMsg,
        data: result || rawText,
      };
    }

    // Check Success:
    // HTTP 200/201 and Status !== "Failed"
    const isFailed =
      response.status >= 400 ||
      msgObj?.Status === "Failed" ||
      result?.Status === "Failed" ||
      msgObj?.statusCode >= 400 ||
      result?.statusCode >= 400;

    if (!isFailed && (response.ok || response.status === 200 || response.status === 201)) {
      return {
        success: true,
        isDuplicate: false,
        leadType: "Primary",
        message: "Lead successfully pushed to Online Manipal CRM! Type updated to Primary.",
        data: result || rawText,
      };
    }

    // Extract Error Message
    const errorMsg =
      msgObj?.Message ||
      result?.Message ||
      (typeof result?.message === "string" ? result.message : null) ||
      result?.ErrorMessage ||
      `Online Manipal API returned status ${response.status}`;

    return {
      success: false,
      error: errorMsg,
      data: result || rawText,
    };
  } catch (err) {
    console.error("[Online Manipal API Error]:", err);
    return {
      success: false,
      error: err.message || "Failed to connect to Online Manipal API",
    };
  }
}

