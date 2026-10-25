/**
 * leads.service.js — Business logic for lead management.
 * Enforces rules for Lead Type, Status, and ADM Status.
 */
import * as leadsRepo from "@/repositories/leads.repo";
import { LEAD_STATUS, ADM_STATUS, LEAD_TYPE } from "@/config/lead-status";

/**
 * Add a new lead.
 * Type rule:
 * - Default should be "Under Review"
 * - If lead already exists (duplicate phone in same center/system) -> "Duplicate"
 * - If missing university or API error -> "Under Review"
 * - If lead is pushed with valid university -> "Primary" (or can be updated by automation/backend)
 */
export async function addLead(data) {
  const { phone, centerId, universityId, leadType: customType } = data;

  let computedType = customType || "Under Review";

  // Check duplicate
  const duplicate = await leadsRepo.findDuplicate(phone, centerId);
  const validUniId = universityId ? parseInt(universityId, 10) : null;

  if (duplicate) {
    computedType = "Duplicate";
  } else if (!customType) {
    computedType = "Under Review";
  }

  return leadsRepo.createLead({
    ...data,
    leadType: computedType,
    status: "New Lead",
    admStatus: "Pending",
  });
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
