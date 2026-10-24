/**
 * useDashboardStats.js — Fetch stats for dashboard panels.
 */
"use client";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((r) => r.data);

export function useDashboardStats(role) {
  const url = {
    admin:     "/api/admin/leads?limit=0",
    center:    "/api/center/leads?limit=0",
    subcenter: "/api/subcenter/leads?limit=0",
  }[role];

  // Stats endpoint — returns countStats aggregate
  const statsUrl = role === "admin" ? "/api/admin/stats"
    : role === "center" ? "/api/center/stats"
    : "/api/subcenter/stats";

  const { data, isLoading, error, mutate } = useSWR(statsUrl, fetcher, {
    revalidateOnFocus: false,
    refreshInterval:   30000, // refresh every 30s
  });

  return {
    stats:     data ?? {},
    isLoading,
    isError:   !!error,
    refresh:   mutate,
  };
}
