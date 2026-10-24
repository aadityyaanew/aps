/**
 * useUniversities.js — SWR hook for universities and courses dropdowns.
 */
"use client";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((r) => r.data);

export function useUniversities() {
  const { data, isLoading, error } = useSWR("/api/shared/universities", fetcher, {
    revalidateOnFocus: false,
  });
  return { universities: data ?? [], isLoading, isError: !!error };
}

export function useCourses(universityId) {
  const { data, isLoading, error } = useSWR(
    universityId ? `/api/shared/courses?universityId=${universityId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { courses: data ?? [], isLoading, isError: !!error };
}
