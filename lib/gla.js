import fs from "fs";
import path from "path";

/**
 * 15 GLA Online University Programs provided for Channel Partner API.
 */
export const GLA_PROGRAMS = [
  { code: "OGLABBA201", shortName: "BBA", description: "Human Resource Management", fullName: "BBA - Human Resource Management" },
  { code: "OGLABBA202", shortName: "BBA", description: "Marketing Management", fullName: "BBA - Marketing Management" },
  { code: "OGLABBA203", shortName: "BBA", description: "Financial Management", fullName: "BBA - Financial Management" },
  { code: "OGLABBA204", shortName: "BBA", description: "Banking and Insurance", fullName: "BBA - Banking and Insurance" },
  { code: "OGLABCA201", shortName: "BCA", description: "Bachelor of Computer Application", fullName: "BCA - Bachelor of Computer Application" },
  { code: "OGLABCM206", shortName: "B.Com", description: "Bachelor of Commerce", fullName: "B.Com - Bachelor of Commerce" },
  { code: "OGLAMBA201", shortName: "MBA", description: "Marketing Management", fullName: "MBA - Marketing Management" },
  { code: "OGLAMBA202", shortName: "MBA", description: "Human Resource Management", fullName: "MBA - Human Resource Management" },
  { code: "OGLAMBA203", shortName: "MBA", description: "Finance Management", fullName: "MBA - Finance Management" },
  { code: "OGLAMBA204", shortName: "MBA", description: "Information Technology Management", fullName: "MBA - Information Technology Management" },
  { code: "OGLAMBA205", shortName: "MBA", description: "Operations Management", fullName: "MBA - Operations Management" },
  { code: "OGLAMBA206", shortName: "MBA", description: "Banking and Financial Services", fullName: "MBA - Banking and Financial Services" },
  { code: "OGLAMBA207", shortName: "MBA", description: "Business Analytics", fullName: "MBA - Business Analytics" },
  { code: "OGLAMBA208", shortName: "MBA", description: "Supply Chain Management", fullName: "MBA - Supply Chain Management" },
  { code: "OGLAMCA201", shortName: "MCA", description: "Masters of Computer Application", fullName: "MCA - Masters of Computer Application" },
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
 * Get GLA credentials from process.env or fallback env files.
 */
export function getGlaCredentials() {
  let apiUrl = cleanKey(process.env.GLA_API_URL) || "https://glawebapi.glaonline.com/api/ChannelPartner/CPRegistrationOnline_API";
  let source = cleanKey(process.env.GLA_SOURCE) || "Growhys_Innovations";

  if (!apiUrl || !source) {
    const envFiles = [".env.production", ".env.local", ".env"];
    for (const file of envFiles) {
      try {
        const envPath = path.join(process.cwd(), file);
        if (fs.existsSync(envPath)) {
          const raw = fs.readFileSync(envPath, "utf-8");
          for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (trimmed.startsWith("GLA_API_URL=")) {
              apiUrl = cleanKey(trimmed.replace("GLA_API_URL=", ""));
            }
            if (trimmed.startsWith("GLA_SOURCE=")) {
              source = cleanKey(trimmed.replace("GLA_SOURCE=", ""));
            }
          }
          if (apiUrl && source) break;
        }
      } catch (e) {
        console.warn(`[GLA Env Read Warning for ${file}]:`, e.message);
      }
    }
  }

  if (!apiUrl) apiUrl = "https://glawebapi.glaonline.com/api/ChannelPartner/CPRegistrationOnline_API";
  if (!source) source = "Growhys_Innovations";

  return { apiUrl, source };
}

/**
 * Resolves a course name/string to the exact GLA Program Code.
 * Matches code directly (e.g. OGLAMCA201), full name, short name + specialization, or generic course.
 *
 * @param {string} courseName
 * @returns {string} GLA Program Code (e.g. "OGLAMCA201")
 */
export function resolveGlaProgramCode(courseName) {
  if (!courseName) return "OGLAMBA201";

  const rawUpper = String(courseName).toUpperCase().trim();
  const rawLower = String(courseName).toLowerCase().trim();

  // 1. Direct program code match (e.g. "OGLAMCA201")
  const exactCode = GLA_PROGRAMS.find((p) => rawUpper.includes(p.code));
  if (exactCode) return exactCode.code;

  // 2. MCA
  if (rawLower.includes("mca") || (rawLower.includes("computer application") && rawLower.includes("master"))) {
    return "OGLAMCA201";
  }

  // 3. BCA
  if (rawLower.includes("bca") || (rawLower.includes("computer application") && (rawLower.includes("bachelor") || !rawLower.includes("master")))) {
    return "OGLABCA201";
  }

  // 4. B.Com
  if (rawLower.includes("b.com") || rawLower.includes("bcom") || rawLower.includes("b com") || rawLower.includes("commerce")) {
    return "OGLABCM206";
  }

  // 5. BBA specializations
  if (rawLower.includes("bba") || rawLower.includes("bachelor of business")) {
    if (rawLower.includes("marketing")) return "OGLABBA202";
    if (rawLower.includes("financ")) return "OGLABBA203";
    if (rawLower.includes("bank") || rawLower.includes("insurance")) return "OGLABBA204";
    if (rawLower.includes("human resource") || rawLower.includes("hr")) return "OGLABBA201";
    return "OGLABBA201"; // Default BBA
  }

  // 6. MBA specializations
  if (rawLower.includes("mba") || rawLower.includes("master of business")) {
    if (rawLower.includes("analytic")) return "OGLAMBA207";
    if (rawLower.includes("supply")) return "OGLAMBA208";
    if (rawLower.includes("bank") || rawLower.includes("financial service")) return "OGLAMBA206";
    if (rawLower.includes("operation")) return "OGLAMBA205";
    if (rawLower.includes("information technology") || rawLower.includes("it management") || rawLower.includes(" it ")) return "OGLAMBA204";
    if (rawLower.includes("human resource") || rawLower.includes("hr")) return "OGLAMBA202";
    if (rawLower.includes("financ")) return "OGLAMBA203";
    if (rawLower.includes("marketing")) return "OGLAMBA201";
    return "OGLAMBA201"; // Default MBA
  }

  // 7. Check by description
  for (const prog of GLA_PROGRAMS) {
    if (rawLower.includes(prog.description.toLowerCase())) {
      return prog.code;
    }
  }

  return "OGLAMBA201";
}

/**
 * Format date of birth to DD/MM/YYYY required by GLA API.
 * Accepts "YYYY-MM-DD", "DD/MM/YYYY", "DD-MM-YYYY", or Date object.
 */
export function formatGlaDob(dob) {
  if (!dob) return "01/01/2000";

  if (typeof dob === "string") {
    const trimmed = dob.trim();
    // Already DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-");
      return `${day}/${month}/${year}`;
    }
    // DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split("-");
      return `${day}/${month}/${year}`;
    }
  }

  try {
    const d = new Date(dob);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    // fallback
  }

  return "01/01/2000";
}

/**
 * Push a lead to GLA University Channel Partner Online Registration API.
 *
 * @param {object} lead - Lead object from database
 * @returns {Promise<{ success: boolean, isDuplicate?: boolean, leadType?: string, message?: string, error?: string, data?: any }>}
 */
export async function pushLeadToGla(lead) {
  const { apiUrl, source } = getGlaCredentials();

  const name = (lead.student_name || "").trim() || "Lead";
  const email = (lead.email || "").trim();
  const rawPhone = (lead.phone || "").replace(/[^0-9]/g, "");
  const mobile = rawPhone.length >= 10 ? rawPhone.slice(-10) : rawPhone;
  const programCode = resolveGlaProgramCode(lead.course_name);
  const dob = formatGlaDob(lead.dob);
  const city = (lead.city || "0").toString().trim();

  if (!mobile || mobile.length < 10) {
    return {
      success: false,
      error: "Valid 10-digit mobile number is required to push to GLA University.",
    };
  }

  if (!email) {
    return {
      success: false,
      error: "Valid email address is required to push to GLA University.",
    };
  }

  const queryParams = new URLSearchParams({
    Name: name,
    DOB: dob,
    EmailId: email,
    Mobile: mobile,
    ProgramCode: programCode,
    source: source,
    City: city,
  });

  const fullUrl = `${apiUrl}?${queryParams.toString()}`;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    });

    const rawResponse = await response.text();
    const cleanResponse = (rawResponse || "").replace(/^['"]|['"]$/g, "").trim();
    const lower = cleanResponse.toLowerCase();

    // Check duplicate:
    // API returns: "Email Id or Mobile No already registered, please check and try again"
    if (
      lower.includes("already registered") ||
      lower.includes("already exist") ||
      lower.includes("duplicate")
    ) {
      return {
        success: true,
        isDuplicate: true,
        leadType: "Duplicate",
        message: "Lead already exists in GLA University! Type updated to Duplicate.",
        data: cleanResponse,
      };
    }

    // Check success:
    // API returns: "Registration successful with UserId:GLAO..."
    if (
      lower.includes("registration successful") ||
      lower.includes("userid") ||
      lower.includes("successful")
    ) {
      return {
        success: true,
        isDuplicate: false,
        leadType: "Primary",
        message: `Lead successfully pushed to GLA University! ${cleanResponse}`,
        data: cleanResponse,
      };
    }

    // Check error
    const errorMsg = cleanResponse || `GLA University API returned status ${response.status}`;
    return {
      success: false,
      error: errorMsg,
      data: cleanResponse,
    };
  } catch (err) {
    console.error("[GLA API Error]:", err);
    return {
      success: false,
      error: err.message || "Failed to connect to GLA University API",
    };
  }
}

