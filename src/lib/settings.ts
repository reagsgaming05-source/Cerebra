"use client";

import { useEffect, useState } from "react";
import type { SortKey } from "./search";

const KEY = "study-app:daily-goal:v1";
export const DEFAULT_DAILY_GOAL = 20;
const MIN = 1;
const MAX = 200;

const SORT_KEY = "study-app:sort:v1";
export const DEFAULT_SORT: SortKey = "recent";
const VALID_SORTS: SortKey[] = ["recent", "progress", "xp", "title"];

function clamp(n: number): number {
  if (Number.isNaN(n)) return DEFAULT_DAILY_GOAL;
  return Math.min(MAX, Math.max(MIN, Math.round(n)));
}

/** Objectif quotidien (activités par jour) stocké en localStorage. */
export function useDailyGoal() {
  const [goal, setGoal] = useState<number>(DEFAULT_DAILY_GOAL);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = window.localStorage.getItem(KEY);
    if (raw != null) setGoal(clamp(parseInt(raw, 10)));
  }, []);

  const save = (value: number) => {
    const v = clamp(value);
    setGoal(v);
    try {
      window.localStorage.setItem(KEY, String(v));
    } catch {
      /* ignore */
    }
    return v;
  };

  return { goal, save, mounted };
}

/** Tri des cours choisi par l'utilisateur, persisté en localStorage. */
export function useSort() {
  const [sort, setSortState] = useState<SortKey>(DEFAULT_SORT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = window.localStorage.getItem(SORT_KEY) as SortKey | null;
    if (raw && VALID_SORTS.includes(raw)) setSortState(raw);
  }, []);

  const setSort = (s: SortKey) => {
    setSortState(s);
    try {
      window.localStorage.setItem(SORT_KEY, s);
    } catch {
      /* ignore */
    }
  };

  return { sort, setSort, mounted };
}