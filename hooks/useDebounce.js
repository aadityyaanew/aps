/**
 * useDebounce.js — Debounce a value by N milliseconds.
 */
"use client";
import { useState, useEffect } from "react";

/**
 * @param {any} value
 * @param {number} [delay=400]
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
