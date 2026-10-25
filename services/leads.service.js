/**
 * leads.service.js — Business logic for lead management.
 * Enforces rules for Lead Type, Status, and ADM Status.
 */
import * as leadsRepo from "@/repositories/leads.repo";
import { LEAD_STATUS, ADM_STATUS, LEAD_TYPE } from "@/config/lead-status";

/**
 * Add a new lead.
 *
 * Duplicate Lead Detection Rules:
 * 1. Duplicate Lead Criteria: A lead is marked as a duplicate ONLY when all three fields
 *    match an existing lead simultaneously:
 *    - Mobile Number (phone)
 *    - Email ID (email)
 *    - University (universityId)
 *
 * 2. Partial Matches: If only the mobile number and email ID match, or any other combination
 *    of two fields matches, the system must treat the entry as a Normal Lead, not a duplicate.
 *
 * 3. New Lead Status: Every newly added lead that does not meet all three duplicate criteria
 *    must be saved as a normal lead with the initial status set to "Under Review".
 *
 * 4. Validation Rule: Mark a lead as Duplicate only if Mobile Number, Email ID, and University
 *    all match an existing lead simultaneously. Otherwise, accept it as a normal lead and assign
 *    the status "Under Review".
 */
export async function addLead(data) {
  const { phone, email, universityId, leadType: customType, status: customStatus } = data;

  // Check duplicate against all 3 criteria simultaneously
  const duplicate = await leadsRepo.findDuplicate({
    phone,
    email,
    universityId,
  });

  let computedType;
  if (duplicate) {
    computedType = "Duplicate";
  } else {
    // Normal lead initial status / lead_type: Under Review
    computedType = customType || "Under Review";
  }

  const id = await leadsRepo.createLead({
    ...data,
    leadType: computedType,
    status: customStatus || "New Lead",
    admStatus: data.admStatus || "Pending",
  });

  return {
    id,
    leadType: computedType,
    isDuplicate: computedType === "Duplicate",
    toString() { return String(id); },
    valueOf() { return id; },
  };
}

/** Get leads for admin — all leads with optional filters */
export async function getAllLeads(filters) {
  return leadsRepo.findAll(filters);
}

/** Get leads for a specific center */
export async function getCenterLeads(centerId, filters) {
  return leadsRepo.findByCenter(centerId, filters);
}

/** Get leads for a specific subcenter */
export async function getSubcenterLeads(subcenterId, filters) {
  return leadsRepo.findBySubcenter(subcenterId, filters);
}

/** Update lead status (Only edited by Super Admin) */
export async function updateLeadStatus(leadId, status) {
  if (!LEAD_STATUS[status]) {
    throw new Error(`Invalid status: ${status}`);
  }
  return leadsRepo.updateStatus(leadId, status);
}

/** Update ADM status (Only edited by Super Admin) */
export async function updateAdmStatus(leadId, admStatus) {
  if (!ADM_STATUS[admStatus]) {
    throw new Error(`Invalid ADM status: ${admStatus}`);
  }
  return leadsRepo.updateAdmStatus(leadId, admStatus);
}

/** Update lead type (e.g. by automation push or backend) */
export async function updateLeadType(leadId, leadType) {
  if (!LEAD_TYPE[leadType]) {
    throw new Error(`Invalid lead type: ${leadType}`);
  }
  return leadsRepo.updateLeadType(leadId, leadType);
}

/** Update full lead details */
export async function updateLead(leadId, data) {
  return leadsRepo.updateLead(leadId, data);
}

/** Delete lead */
export async function deleteLead(leadId) {
  return leadsRepo.deleteLead(leadId);
}

/** Get dashboard stats */
export async function getDashboardStats(centerId = null) {
  return leadsRepo.countStats(centerId);
}
