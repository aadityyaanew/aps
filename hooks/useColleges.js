/**
 * useColleges.js — SWR hook for admin university/college management.
 */
"use client";
import useSWR, { mutate as globalMutate } from "swr";
import { useCallback } from "react";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((r) => r.data);

export function useColleges() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/universities", fetcher, {
    revalidateOnFocus: false,
  });

  const createCollege = useCallback(async (data) => {
    const res = await fetch("/api/admin/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to create college");
    await mutate();
    globalMutate("/api/shared/universities");
    return json.data;
  }, [mutate]);

  const updateCollege = useCallback(async (id, data) => {
    const res = await fetch(`/api/admin/universities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update college");
    await mutate();
    globalMutate("/api/shared/universities");
  }, [mutate]);

  const deleteCollege = useCallback(async (id) => {
    const res = await fetch(`/api/admin/universities/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete college");
    await mutate();
    globalMutate("/api/shared/universities");
  }, [mutate]);

  return {
    colleges: data ?? [],
    isLoading,
    isError: !!error,
    createCollege,
    updateCollege,
    deleteCollege,
    refresh: mutate,
  };
}

export function useCollegeCourses(collegeId) {
  const { data, error, isLoading, mutate } = useSWR(
    collegeId ? `/api/admin/universities/${collegeId}/courses` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const createCourse = useCallback(async (courseData) => {
    const res = await fetch(`/api/admin/universities/${collegeId}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to add course");
    await mutate();
    return json.data;
  }, [collegeId, mutate]);

  const updateCourse = useCallback(async (courseId, courseData) => {
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update course");
    await mutate();
  }, [mutate]);

  const deleteCourse = useCallback(async (courseId) => {
    const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to delete course");
    await mutate();
  }, [mutate]);

  return {
    courses: data ?? [],
    isLoading,
    isError: !!error,
    createCourse,
    updateCourse,
    deleteCourse,
    refresh: mutate,
  };
}
