/**
 * Standardized API response helpers.
 * Keeps all route.js files lean — just call ok() or err().
 */
import { NextResponse } from "next/server";

/**
 * 200 / 201 success response
 * @param {any} data
 * @param {number} [status=200]
 */
export function ok(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Error response
 * @param {string} message
 * @param {number} [status=400]
 */
export function err(message, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/** 401 Unauthorized */
export function unauthorized() {
  return err("Unauthorized", 401);
}

/** 403 Forbidden */
export function forbidden() {
  return err("Forbidden", 403);
}

/** 404 Not Found */
export function notFound(entity = "Resource") {
  return err(`${entity} not found`, 404);
}

/** 500 Internal Server Error */
export function serverError(e) {
  console.error("[API Error]", e);
  return err("Internal server error", 500);
}
