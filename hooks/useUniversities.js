/**
 * useUniversities.js — SWR hook for universities and courses dropdowns.
 */
"use client";
import useSWR, { mutate as globalMutate } from "swr";
import { useCallback } from "react";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((r) => r.data);

export function useUniversities() {
  const { data, isLoading, error, mutate } = useSWR("/api/shared/universities", fetcher, {
    revalidateOnFocus: true,
  });

  const addUniversity = useCallback(async ({ name, location, website, courseName, duration, fees }) => {
    const res = await fetch("/api/shared/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, website, courseName, duration, fees }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to add university");
    await mutate();
    globalMutate("/api/admin/universities");
    if (json.data?.id) {
      globalMutate(`/api/shared/courses?universityId=${json.data.id}`);
    }
    return json.data;
  }, [mutate]);

  return {
    universities: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
    addUniversity,
  };
}

export function useCourses(universityId) {
  const key = universityId ? `/api/shared/courses?universityId=${universityId}` : null;
  const { data, isLoading, error, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
  });

  const addCourse = useCallback(async ({ name, duration, fees }) => {
    if (!universityId) throw new Error("Please select a university first");
    const res = await fetch("/api/shared/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universityId, name, duration, fees }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to add course");
    await mutate();
    globalMutate("/api/admin/universities");
    globalMutate(`/api/admin/universities/${universityId}/courses`);
    return json.data;
  }, [universityId, mutate]);

  return {
    courses: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
    addCourse,
  };
}
