"use client";

import { useEffect, useState } from "react";
import { dayKey } from "./streak";
import { useDailyGoal } from "./settings";

const KEY = "study-app:daily-count:v1";
const EVENT = "study-app:daily-count-changed";

type CountMap = Record<string, number>;

function readCounts(): CountMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as CountMap) : {};
  } catch {
    return {};
  }
}

function writeCounts(map: CountMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Incrémente le compteur d'activités complétées du jour courant. */
export function recordCompletion() {
  if (typeof window === "undefined") return;
  const map = readCounts();
  const today = dayKey();
  map[today] = (map[today] ?? 0) + 1;
  writeCounts(map);
}

/** Hook de suivi de l'objectif quotidien : progresion du jour + objectif. */
export function useDailyProgress(): {
  today: number;
  goal: number;
  pct: number;
  reached: boolean;
  ready: boolean;
} {
  const [counts, setCounts] = useState<CountMap>({});
  const [ready, setReady] = useState(false);
  const { goal } = useDailyGoal();

  useEffect(() => {
    setCounts(readCounts());
    setReady(true);
    const onChange = () => setCounts(readCounts());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const today = ready ? (counts[dayKey()] ?? 0) : 0;
  const pct = goal > 0 ? Math.min(100, Math.round((today / goal) * 100)) : 0;
  const reached = ready && today >= goal && goal > 0;
  return { today, goal, pct, reached, ready };
}