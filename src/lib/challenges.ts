"use client";

import { useEffect, useState } from "react";
import { useStreak } from "./streak";
import { useCourses } from "./store";

const KEY = "study-app:challenges:v1";
const EVENT = "study-app:challenges-changed";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (data: ChallengeData) => boolean;
  xp: number;
}

export interface ChallengeState {
  id: string;
  completed: boolean;
  completedAt: number | null;
}

export interface ChallengeData {
  streak: number;
  coursesCount: number;
  completedCourses: number;
  totalXp: number;
  quizPerfect: boolean;
}

const CHALLENGES: Challenge[] = [
  { id: "ch_streak_3", title: "3 jours", description: "Étudier 3 jours d'affilée", icon: "🔥", xp: 15, check: (d) => d.streak >= 3 },
  { id: "ch_streak_7", title: "Semaine complète", description: "Étudier 7 jours d'affilée", icon: "🔥", xp: 30, check: (d) => d.streak >= 7 },
  { id: "ch_courses_3", title: "Explorateur", description: "Avoir 3 cours", icon: "📚", xp: 10, check: (d) => d.coursesCount >= 3 },
  { id: "ch_courses_5", title: "Collectionneur", description: "Avoir 5 cours", icon: "📚", xp: 20, check: (d) => d.coursesCount >= 5 },
  { id: "ch_xp_100", title: "100 XP", description: "Cumuler 100 XP", icon: "⭐", xp: 25, check: (d) => d.totalXp >= 100 },
  { id: "ch_xp_500", title: "500 XP", description: "Cumuler 500 XP", icon: "⭐", xp: 50, check: (d) => d.totalXp >= 500 },
  { id: "ch_complete_1", title: "Premier 100%", description: "Compléter un cours à 100%", icon: "🎯", xp: 30, check: (d) => d.completedCourses >= 1 },
  { id: "ch_complete_3", title: "Triplé", description: "Compléter 3 cours à 100%", icon: "🎯", xp: 60, check: (d) => d.completedCourses >= 3 },
];

function readState(): ChallengeState[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function writeState(state: ChallengeState[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useChallenges() {
  const { courses } = useCourses();
  const { streak } = useStreak();
  const [state, setState] = useState<ChallengeState[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(readState());
    setReady(true);
    const onChange = () => setState(readState());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener("storage", onChange); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data: ChallengeData = {
      streak, coursesCount: courses.length,
      completedCourses: courses.filter((c) => c.progress >= 100).length,
      totalXp: courses.reduce((s, c) => s + c.xp, 0),
      quizPerfect: courses.some((c) => c.nodes.some((n) => n.type === "quiz" && n.bestScore >= 100)),
    };
    const current = readState();
    const completedIds = new Set(current.filter((c) => c.completed).map((c) => c.id));
    const now = Date.now();
    let changed = false;
    for (const ch of CHALLENGES) {
      if (completedIds.has(ch.id)) continue;
      if (ch.check(data)) {
        current.push({ id: ch.id, completed: true, completedAt: now });
        changed = true;
      }
    }
    if (changed) writeState(current);
    setState(readState());
  }, [courses, streak, ready]);

  const enriched = CHALLENGES.map((ch) => ({
    ...ch,
    completed: state.find((s) => s.id === ch.id)?.completed ?? false,
    completedAt: state.find((s) => s.id === ch.id)?.completedAt ?? null,
  }));

  return { challenges: enriched, completedCount: enriched.filter((c) => c.completed).length, totalCount: CHALLENGES.length };
}
