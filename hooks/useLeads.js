/**
 * useLeads.js — SWR hook for fetching and mutating leads.
 * Used in center and subcenter panels.
 */
"use client";
import useSWR from "swr";
import { useCallback } from "react";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((r) => r.data);

/**
 * @param {"admin"|"center"|"subcenter"} role
 * @param {object} [filters]
 */
export function useLeads(role, filters = {}) {
  const params = new URLSearchParams();
  if (filters.status)   params.set("status",   filters.status);
  if (filters.centerId) params.set("centerId", filters.centerId);
  params.set("limit",  String(filters.limit  ?? 50));
  params.set("offset", String(filters.offset ?? 0));

  const BASE_URL = {
    admin:     "/api/admin/leads",
    center:    "/api/center/leads",
    subcenter: "/api/subcenter/leads",
  }[role];

  const { data, error, isLoading, mutate } = useSWR(
    `${BASE_URL}?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const addLead = useCallback(async (leadData) => {
    const POST_URL = role === "subcenter" ? "/api/subcenter/leads" : "/api/center/leads";
    const res = await fetch(POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to add lead");
    await mutate();
    return json.data;
  }, [role, mutate]);

  const updateLeadStatus = useCallback(async (leadId, status) => {
    const res = await fetch(`/api/center/leads/${leadId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    await mutate();
  }, [mutate]);

  return {
    leads:            data ?? [],
    isLoading,
    isError:          !!error,
    addLead,
    updateLeadStatus,
    refresh:          mutate,
  };
}
