"use client";

import { useMemo } from "react";
import { useCourses } from "./store";

export interface Level {
  level: number;
  title: string;
  minXp: number;
  icon: string;
}

export const LEVELS: Level[] = [
  { level: 1, title: "Débutant", minXp: 0, icon: "🌱" },
  { level: 2, title: "Apprenti", minXp: 50, icon: "🌿" },
  { level: 3, title: "Étudiant", minXp: 150, icon: "📘" },
  { level: 4, title: "Lecteur", minXp: 300, icon: "📚" },
  { level: 5, title: "Sage", minXp: 500, icon: "🦉" },
  { level: 6, title: "Expert", minXp: 800, icon: "⭐" },
  { level: 7, title: "Maître", minXp: 1200, icon: "🏆" },
  { level: 8, title: "Génie", minXp: 1800, icon: "👑" },
  { level: 9, title: "Légende", minXp: 2500, icon: "💎" },
  { level: 10, title: "Cerebra", minXp: 4000, icon: "🧠" },
];

export function computeLevel(totalXp: number): Level {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXp >= lvl.minXp) current = lvl;
  }
  return current;
}

export function nextLevel(totalXp: number): Level | null {
  for (const lvl of LEVELS) {
    if (totalXp < lvl.minXp) return lvl;
  }
  return null;
}

export function levelProgress(totalXp: number): { current: Level; next: Level | null; pct: number } {
  const current = computeLevel(totalXp);
  const next = nextLevel(totalXp);
  if (!next) return { current, next: null, pct: 100 };
  const range = next.minXp - current.minXp;
  const progress = totalXp - current.minXp;
  const pct = range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 100;
  return { current, next, pct };
}

export function useLevel() {
  const { courses } = useCourses();

  return useMemo(() => {
    const totalXp = courses.reduce((s, c) => s + c.xp, 0);
    return { totalXp, ...levelProgress(totalXp) };
  }, [courses]);
}
