/**
 * useSubcenters.js — SWR hook for subcenter management.
 * Works for both admin view and center's own subcenters.
 */
"use client";
import useSWR from "swr";
import { useCallback } from "react";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((r) => r.data);

/**
 * @param {"admin"|"center"} role
 * @param {string} [centerId] - for admin filtering by center
 */
export function useSubcenters(role, centerId = null) {
  const url = role === "admin"
    ? `/api/admin/subcenters${centerId ? `?centerId=${centerId}` : ""}`
    : "/api/center/subcenters";

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  const apiBase = role === "admin" ? "/api/admin/subcenters" : "/api/center/subcenters";

  const createSubcenter = useCallback(async (subcenterData) => {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subcenterData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to create associate");
    await mutate();
    return json.data;
  }, [apiBase, mutate]);

  const updateSubcenter = useCallback(async (id, data) => {
    const res = await fetch(`${apiBase}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update associate");
    await mutate();
    return json.data;
  }, [apiBase, mutate]);

  const toggleSubcenterActive = useCallback(async (id, isActive) => {
    const res = await fetch(`${apiBase}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update associate status");
    await mutate();
    return json.data;
  }, [apiBase, mutate]);

  const deleteSubcenter = useCallback(async (id) => {
    if (role !== "admin") return;
    const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete associate");
    await mutate();
  }, [apiBase, mutate, role]);

  return {
    subcenters:            data ?? [],
    isLoading,
    isError:               !!error,
    createSubcenter,
    updateSubcenter,
    toggleSubcenterActive,
    deleteSubcenter,
    refresh:               mutate,
  };
}
