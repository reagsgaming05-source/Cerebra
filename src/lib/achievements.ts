"use client";

import { useEffect, useState } from "react";
import type { Course } from "./types";
import { useStreak } from "./streak";
import { useCourses } from "./store";

const KEY = "study-app:achievements:v1";
const EVENT = "study-app:achievements-changed";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  /** Fonction qui détermine si le déblocage est possible. Reçoit les données actuelles. */
  check: (data: AchievementData) => boolean;
}

export interface AchievementData {
  courses: Course[];
  streak: number;
  totalXp: number;
  completedCourses: number;
  bestQuizScore: number;
}

export interface AchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_course",
    title: "Premier cours",
    description: "Importer ou créer ton premier cours",
    icon: "📚",
    check: (d) => d.courses.length >= 1,
  },
  {
    id: "first_activity",
    title: "Premier pas",
    description: "Compléter ta première activité",
    icon: "👣",
    check: (d) => d.totalXp > 0,
  },
  {
    id: "course_complete",
    title: "Cours maîtrisé",
    description: "Atteindre 100% sur un cours",
    icon: "🎯",
    check: (d) => d.completedCourses >= 1,
  },
  {
    id: "streak_7",
    title: "Régulier",
    description: "Étudier 7 jours d'affilée",
    icon: "🔥",
    check: (d) => d.streak >= 7,
  },
  {
    id: "streak_30",
    title: "Habitude",
    description: "Étudier 30 jours d'affilée",
    icon: "💪",
    check: (d) => d.streak >= 30,
  },
  {
    id: "xp_100",
    title: "Apprenti",
    description: "Cumuler 100 XP au total",
    icon: "⭐",
    check: (d) => d.totalXp >= 100,
  },
  {
    id: "xp_500",
    title: "Scholar",
    description: "Cumuler 500 XP au total",
    icon: "🏆",
    check: (d) => d.totalXp >= 500,
  },
  {
    id: "xp_1000",
    title: "Érudit",
    description: "Cumuler 1 000 XP au total",
    icon: "👑",
    check: (d) => d.totalXp >= 1000,
  },
  {
    id: "quiz_perfect",
    title: "Sans faute",
    description: "Obtenir 100% à un quiz",
    icon: "🧠",
    check: (d) => d.bestQuizScore >= 100,
  },
  {
    id: "collector_5",
    title: "Collectionneur",
    description: "Avoir 5 cours ou plus",
    icon: "📖",
    check: (d) => d.courses.length >= 5,
  },
  {
    id: "collector_10",
    title: "Bibliophile",
    description: "Avoir 10 cours ou plus",
    icon: "📚",
    check: (d) => d.courses.length >= 10,
  },
];

function readState(): AchievementState[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AchievementState[];
  } catch {
    return [];
  }
}

function writeState(state: AchievementState[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * Vérifie quels achievements sont débloqués et enregistre les nouveaux.
 * Retourne la liste des achievements fraîchement débloqués (pour notification).
 */
export function checkAchievements(data: AchievementData): AchievementState[] {
  const current = readState();
  const unlockedIds = new Set(current.filter((a) => a.unlocked).map((a) => a.id));
  const now = Date.now();
  const newOnes: AchievementState[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlockedIds.has(ach.id)) continue;
    if (ach.check(data)) {
      const entry: AchievementState = { id: ach.id, unlocked: true, unlockedAt: now };
      newOnes.push(entry);
    }
  }

  if (newOnes.length > 0) {
    writeState([...current, ...newOnes]);
  }

  return newOnes;
}

/** Hook exposant les achievements et leur état. */
export function useAchievements() {
  const { courses } = useCourses();
  const { streak } = useStreak();
  const [state, setState] = useState<AchievementState[]>([]);
  const [ready, setReady] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<Achievement[]>([]);

  // Chargement initial + écoute des changements
  useEffect(() => {
    setState(readState());
    setReady(true);
    const onChange = () => setState(readState());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // Vérification à chaque changement de données
  useEffect(() => {
    if (!ready) return;
    const totalXp = courses.reduce((s, c) => s + c.xp, 0);
    const completedCourses = courses.filter((c) => c.progress >= 100).length;
    const bestQuizScore = Math.max(
      0,
      ...courses.flatMap((c) =>
        c.nodes.filter((n) => n.type === "quiz").map((n) => n.bestScore),
      ),
    );
    const data: AchievementData = { courses, streak, totalXp, completedCourses, bestQuizScore };
    const newStates = checkAchievements(data);
    if (newStates.length > 0) {
      const newAchs = newStates
        .map((ns) => ACHIEVEMENTS.find((a) => a.id === ns.id))
        .filter(Boolean) as Achievement[];
      setJustUnlocked(newAchs);
      setState(readState());
      // Efface la notification après 5s
      const t = setTimeout(() => setJustUnlocked([]), 5000);
      return () => clearTimeout(t);
    }
  }, [courses, streak, ready]);

  const enriched = ACHIEVEMENTS.map((ach) => {
    const st = state.find((s) => s.id === ach.id);
    return { ...ach, unlocked: st?.unlocked ?? false, unlockedAt: st?.unlockedAt ?? null };
  });

  const unlockedCount = enriched.filter((a) => a.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  return { achievements: enriched, unlockedCount, totalCount, justUnlocked, ready };
}
