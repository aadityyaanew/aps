/**
 * leads.service.js — Business logic for lead management.
 * Enforces rules like duplicate detection, status transitions.
 */
import * as leadsRepo from "@/repositories/leads.repo";

/**
 * Add a new lead, with duplicate detection.
 * Returns { lead } on success or { error } string on duplicate.
 */
export async function addLead(data) {
  const { phone, centerId } = data;

  const duplicate = await leadsRepo.findDuplicate(phone, centerId);
  if (duplicate) {
    // Mark as secondary instead of rejecting
    return leadsRepo.createLead({ ...data, leadType: "secondary" });
  }
  return leadsRepo.createLead({ ...data, leadType: "primary" });
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

/** Update lead status (with basic validation) */
export async function updateLeadStatus(leadId, status) {
  const valid = ["new", "contacted", "application_submitted", "admitted", "rejected"];
  if (!valid.includes(status)) throw new Error("Invalid status");
  return leadsRepo.updateStatus(leadId, status);
}

/** Update ADM status */
export async function updateAdmStatus(leadId, admStatus) {
  const valid = ["pending", "approved", "rejected"];
  if (!valid.includes(admStatus)) throw new Error("Invalid ADM status");
  return leadsRepo.updateAdmStatus(leadId, admStatus);
}

/** Update full lead details */
export async function updateLead(leadId, data) {
  return leadsRepo.updateLead(leadId, data);
}

/** Get dashboard stats (total, primary, secondary, admitted, rejected) */
export async function getDashboardStats(centerId = null) {
  return leadsRepo.countStats(centerId);
}
