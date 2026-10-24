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

  const createSubcenter = useCallback(async (subcenterData) => {
    const res = await fetch("/api/center/subcenters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subcenterData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to create subcenter");
    await mutate();
    return json.data;
  }, [mutate]);

  return {
    subcenters:      data ?? [],
    isLoading,
    isError:         !!error,
    createSubcenter,
    refresh:         mutate,
  };
}
