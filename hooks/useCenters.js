/**
 * useCenters.js — SWR hook for admin center management.
 */
"use client";
import useSWR from "swr";
import { useCallback } from "react";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((r) => r.data);

export function useCenters() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/centers", fetcher, {
    revalidateOnFocus: false,
  });

  const createCenter = useCallback(async (centerData) => {
    const res = await fetch("/api/admin/centers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(centerData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to create center");
    await mutate();
    return json.data;
  }, [mutate]);

  const updateCenter = useCallback(async (id, data) => {
    const res = await fetch(`/api/admin/centers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update center");
    await mutate();
  }, [mutate]);

  const deleteCenter = useCallback(async (id) => {
    const res = await fetch(`/api/admin/centers/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete center");
    await mutate();
  }, [mutate]);

  return {
    centers:      data ?? [],
    isLoading,
    isError:      !!error,
    createCenter,
    updateCenter,
    deleteCenter,
    refresh:      mutate,
  };
}
