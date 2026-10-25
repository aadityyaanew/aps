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

/** Update center details and credentials */
export async function updateCenter(id, data) {
  let passwordHash = undefined;
  if (data.password && data.password.trim()) {
    if (data.password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    passwordHash = await hashPassword(data.password.trim());
  }

  if (data.billing_access !== undefined) {
    await usersRepo.setUnitBillingAccess(id, Boolean(data.billing_access));
  }

  if (data.billing_password && data.billing_password.trim()) {
    if (data.billing_password.trim().length < 4) {
      throw new Error("Billing password must be at least 4 characters long.");
    }
    const billingHash = await hashPassword(data.billing_password.trim());
    await usersRepo.setUnitBillingPassword(id, billingHash);
  }

  return usersRepo.updateUserDetails(id, {
    name:              data.name,
    email:             data.email,
    phone:             data.phone,
    organization_name: data.organization_name,
    address:           data.address,
    is_active:         data.is_active,
    passwordHash,
  });
}

/** Update subcenter details and credentials */
export async function updateSubcenter(id, data) {
  let passwordHash = undefined;
  if (data.password && data.password.trim()) {
    if (data.password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    passwordHash = await hashPassword(data.password.trim());
  }

  return usersRepo.updateUserDetails(id, {
    name:              data.name,
    email:             data.email,
    phone:             data.phone,
    organization_name: data.organization_name,
    parent_center_id:  data.parent_center_id ?? data.parentCenterId,
    is_active:         data.is_active,
    passwordHash,
  });
}

/** Toggle user active status (deactivate / activate) */
export async function toggleUserActive(id, isActive) {
  return usersRepo.setUserActive(id, isActive);
}

/** Update center/subcenter details (legacy wrapper) */
export async function updateUser(id, data) {
  return updateCenter(id, data);
}

/** Delete a center (hard delete — cascades) */
export async function deleteCenter(id) {
  return usersRepo.deleteUser(id);
}

/** Get center by ID */
export async function getCenterById(id) {
  return usersRepo.findById(id);
}

/** Get subcenter by ID */
export async function getSubcenterById(id) {
  return usersRepo.findById(id);
}
