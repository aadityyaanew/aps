import fs from "fs";
import path from "path";

/**
 * University configuration map for OneCRM Lead Drop API.
 * Sub-entity codes and default sources verified via QA testing against OneCRM ERP API.
 */
export const ONECRM_UNIVERSITIES = {
  ANDHRA: {
    displayName: "Andhra University",
    subEntityCode: "ANDHRA",
    source: "ANDHRA",
    matches: (name) => {
      const n = (name || "").toLowerCase();
      return n.includes("andhra");
    },
  },
  BDU: {
    displayName: "Bharatidasan University (BDU)",
    subEntityCode: "BDU",
    source: "BDU",
    matches: (name) => {
      const n = (name || "").toLowerCase();
      return n.includes("bdu") || n.includes("bharathidasan") || n.includes("bharatidasan");
    },
  },
  CUONLINE: {
    displayName: "Chandigarh University",
    subEntityCode: "CUONLINE",
    source: "CUONLINE",
    matches: (name) => {
      const n = (name || "").toLowerCase();
      return n.includes("chandigarh") || n.includes("cu online") || n.includes("cuonline");
    },
  },
  DYPATIL: {
    displayName: "DY Patil University",
    subEntityCode: "DYPATIL",
    source: "DYPATIL",
    matches: (name) => {
      const n = (name || "").toLowerCase();
      return n.includes("dy patil") || n.includes("dypatil") || n.includes("dyp");
    },
  },
  KUK: {
    displayName: "Kurukshetra University",
    subEntityCode: "KUK",
    source: "KUK",
    matches: (name) => {
      const n = (name || "").toLowerCase();
      return n.includes("kurukshetra") || n.includes("kuk");
    },
  },
  OPJINDAL: {
    displayName: "OP Jindal Global University",
    subEntityCode: "OPJINDAL",
    source: "OPJINDAL",
    matches: (name) => {
      const n = (name || "").toLowerCase();
      return n.includes("jindal") || n.includes("opjindal") || n.includes("op jindal") || n.includes("jgu");
    },
  },
  VISTAS: {
    displayName: "Vistas University",
    subEntityCode: "VISTAS",
    source: "VISTAS",
    matches: (name) => {
      const n = (name || "").toLowerCase();
      return n.includes("vistas") || n.includes("vels");
    },
  },
};

/**
 * Match a university name to its OneCRM configuration.
 * @param {string} universityName
 * @returns {object|null}
 */
export function getOneCrmUniversityConfig(universityName) {
  if (!universityName) return null;
  const n = String(universityName).trim().toLowerCase();
  for (const config of Object.values(ONECRM_UNIVERSITIES)) {
    if (config.matches(n)) {
      return config;
    }
  }
  return null;
}

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
 * Get OneCRM credentials from process.env or fallback env files.
 */
export function getOneCrmCredentials() {
  let apiUrl = process.env.ONECRM_API_URL || "https://erp-system.talentedge.dev/api/v1/leads/drop";
  let clientId = process.env.ONECRM_CLIENT_ID || "WEBSITE";
  let token = cleanKey(process.env.ONECRM_TOKEN);
  let media = process.env.ONECRM_MEDIA || "Direct";
  let campaign = process.env.ONECRM_CAMPAIGN || "Whatsapp";

  // If token is missing, attempt to read directly from .env files
  if (!token) {
    const envFiles = [".env.production", ".env.local", ".env"];
    for (const file of envFiles) {
      try {
        const envPath = path.join(process.cwd(), file);
        if (fs.existsSync(envPath)) {
          const raw = fs.readFileSync(envPath, "utf-8");
          for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (trimmed.startsWith("ONECRM_TOKEN=")) {
              token = cleanKey(trimmed.replace("ONECRM_TOKEN=", ""));
            }
            if (trimmed.startsWith("ONECRM_API_URL=")) {
              apiUrl = cleanKey(trimmed.replace("ONECRM_API_URL=", ""));
            }
            if (trimmed.startsWith("ONECRM_CLIENT_ID=")) {
              clientId = cleanKey(trimmed.replace("ONECRM_CLIENT_ID=", ""));
            }
            if (trimmed.startsWith("ONECRM_MEDIA=")) {
              media = cleanKey(trimmed.replace("ONECRM_MEDIA=", ""));
            }
            if (trimmed.startsWith("ONECRM_CAMPAIGN=")) {
              campaign = cleanKey(trimmed.replace("ONECRM_CAMPAIGN=", ""));
            }
          }
          if (token) break;
        }
      } catch (e) {
        console.warn(`[OneCRM Env Read Warning for ${file}]:`, e.message);
      }
    }
  }

  // Fallback to verified QA dev token from onecrmleadapi.pdf documentation
  if (!token) {
    token = "6c5b4441b2c13156a87cbd9uvbsd87vgsd8vsiduv35148760b5711cff0b";
  }

  return { apiUrl, clientId, token, media, campaign };
}

/**
 * Push a lead to OneCRM ERP endpoint.
 *
 * @param {object} lead - Lead object from database
 * @param {object} uniConfig - University configuration
 * @returns {Promise<{ success: boolean, isDuplicate?: boolean, leadType?: string, message?: string, error?: string, data?: any }>}
 */
export async function pushLeadToOneCrm(lead, uniConfig) {
  const { apiUrl, clientId, token, media, campaign } = getOneCrmCredentials();

  // Name splitting
  const nameParts = (lead.student_name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || lead.student_name?.trim() || "Lead";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Phone clean: get last 10 digits or cleaned digits
  const rawDigits = (lead.phone || "").replace(/[^0-9]/g, "");
  const mobileNumber = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

  const email = (lead.email || "").trim();
  const course = (lead.course_name || "").trim();

  const payload = {
    subEntityCode: uniConfig.subEntityCode,
    source: uniConfig.source,
    media: media,
    campaign: campaign,
    firstName: firstName,
    email: email,
    mobileNumber: mobileNumber,
  };

  if (lastName) {
    payload.lastName = lastName;
  }
  if (course) {
    payload.courseNameOrCode = course;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Accept": "*/*",
      "Content-Type": "application/json",
      "X-Client-Id": clientId,
      "X-Token": token,
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let result = null;
  try {
    result = JSON.parse(rawText);
  } catch (err) {
    console.warn("[OneCRM JSON Parse Warning]:", err.message, rawText);
  }

  if (response.ok && result?.status === "SUCCESS") {
    const isNewLead = result.data?.isNewLead === true;
    const isReEnquiry = result.data?.isReEnquiry === true || isNewLead === false;

    if (isReEnquiry) {
      return {
        success: true,
        isDuplicate: true,
        leadType: "Duplicate",
        message: `Lead already exists in ${uniConfig.displayName} CRM! Type updated to Duplicate.`,
        data: result.data,
      };
    }

    return {
      success: true,
      isDuplicate: false,
      leadType: "Primary",
      message: `Lead successfully pushed to ${uniConfig.displayName} CRM! Type updated to Primary.`,
      data: result.data,
    };
  }

  // Handle errors
  const errorMessage =
    result?.message ||
    (typeof result?.data === "string" ? result.data : null) ||
    `Failed to push lead to ${uniConfig.displayName} CRM (Status: ${response.status})`;

  return {
    success: false,
    error: errorMessage,
    status: response.status,
    data: result,
  };
}
