/**
 * centers.service.js — Business logic for center management.
 */
import * as usersRepo from "@/repositories/users.repo";
import { hashPassword } from "@/services/auth.service";

/** Get all centers with subcenter counts */
export async function getAllCenters() {
  return usersRepo.findAllCenters();
}

/** Get all subcenters (optionally by center) */
export async function getAllSubcenters(centerIdFilter = null) {
  return usersRepo.findAllSubcenters(centerIdFilter);
}

/**
 * Create a new center account.
 * Hashes the password before storing.
 */
export async function createCenter({ name, email, password, phone, organization_name, address }) {
  const passwordHash = await hashPassword(password);
  return usersRepo.createUser({
    name, email, passwordHash, role: "center",
    phone, organization_name, address, parent_center_id: null,
  });
}

/**
 * Create a new subcenter account under a center.
 */
export async function createSubcenter({ name, email, password, phone, organization_name, parentCenterId }) {
  const passwordHash = await hashPassword(password);
  return usersRepo.createUser({
    name, email, passwordHash, role: "subcenter",
    phone, organization_name, address: null, parent_center_id: parentCenterId,
  });
}

/** Update center/subcenter details */
export async function updateUser(id, data) {
  return usersRepo.updateUser(id, data);
}

/** Delete a center (hard delete — cascades) */
export async function deleteCenter(id) {
  return usersRepo.deleteUser(id);
}

/** Get center by ID */
export async function getCenterById(id) {
  return usersRepo.findById(id);
}
