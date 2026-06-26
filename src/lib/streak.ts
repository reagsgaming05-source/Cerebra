"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "study-app:study-days:v1";
const EVENT = "study-app:study-days-changed";

/** Clé de jour local au format YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readDays(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeDays(days: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(days));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Enregistre le jour courant comme jour d'étude (dédupliqué). */
export function recordStudyDay() {
  if (typeof window === "undefined") return;
  const days = readDays();
  const today = dayKey();
  if (days.includes(today)) return;
  writeDays([...days, today]);
}

/**
 * Calcule le streak : nombre de jours consécutifs se terminant aujourd'hui
 * ou hier. Si le dernier jour étudié est avant hier, retourne 0.
 */
export function computeStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const cursor = new Date();
  if (!set.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Hook exposant le streak courant et un booléen "étudié aujourd'hui". */
export function useStreak(): { streak: number; studiedToday: boolean; ready: boolean } {
  const [days, setDays] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDays(readDays());
    setReady(true);
    const onChange = () => setDays(readDays());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const streak = computeStreak(days);
  const studiedToday = ready && days.includes(dayKey());
  return { streak, studiedToday, ready };
}