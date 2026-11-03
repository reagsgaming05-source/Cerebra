"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Course } from "../types";
import { buildNodes } from "../store";
import type { CatalogLevel, CatalogSubject, CatalogUnit, LevelId } from "./types";
import { cycle1, cycle2 } from "./primaire";
import { cycle3 } from "./cycle3";
import { sec2 } from "./sec2";
import { uni } from "./uni";

export * from "./types";

/** Tous les niveaux, de l'école obligatoire à l'université. */
export const LEVELS: CatalogLevel[] = [cycle1, cycle2, cycle3, sec2, uni];

export function getLevel(id: string | null | undefined): CatalogLevel | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function findUnit(
  unitId: string,
): { level: CatalogLevel; subject: CatalogSubject; unit: CatalogUnit } | undefined {
  for (const level of LEVELS) {
    for (const subject of level.subjects) {
      const unit = subject.units.find((u) => u.id === unitId);
      if (unit) return { level, subject, unit };
    }
  }
  return undefined;
}

/** Id de cours stable pour une unité du catalogue. */
export function courseIdForUnit(unitId: string): string {
  return `cat_${unitId}`;
}

/** Transforme une unité du catalogue en cours jouable (parcours, cartes, quiz). */
export function buildCourseFromUnit(
  level: CatalogLevel,
  subject: CatalogSubject,
  unit: CatalogUnit,
): Course {
  const slides = unit.slides.map((s, i) => ({ index: i + 1, title: s.title, bullets: s.bullets }));
  const plainText = slides.map((s) => [s.title, ...s.bullets].join("\n")).join("\n\n");
  return {
    id: courseIdForUnit(unit.id),
    title: unit.title,
    createdAt: Date.now(),
    slides,
    summary: {
      plainText,
      intro: unit.description,
      sections: unit.slides.map((s) => ({ heading: s.title, content: s.bullets.join(" ") })),
      keyPoints: unit.keyPoints,
    },
    flashcards: unit.flashcards.map((c, i) => ({
      id: `fc_cat_${unit.id}_${i}`,
      front: c.front,
      back: c.back,
    })),
    quizBank: unit.quiz.map((q, i) => ({ id: `q_cat_${unit.id}_${i}`, ...q })),
    quizRuns: 0,
    nodes: buildNodes(),
    progress: 0,
    xp: 0,
    tags: [level.short, subject.name],
    catalog: { levelId: level.id, subjectId: subject.id, unitId: unit.id },
  };
}

/** Pourcentage minimum de l'unité précédente pour débloquer la suivante. */
export const UNLOCK_THRESHOLD = 50;

const LEVEL_KEY = "cerebra:school-level";

const LEVEL_EVENT = "cerebra:school-level-changed";

// Repli en mémoire si le stockage du navigateur est indisponible.
let memoryLevel: LevelId | null = null;

function readLevel(): LevelId | null {
  try {
    const v = window.localStorage.getItem(LEVEL_KEY);
    return getLevel(v) ? (v as LevelId) : memoryLevel;
  } catch {
    return memoryLevel;
  }
}

function subscribeLevel(cb: () => void) {
  window.addEventListener(LEVEL_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(LEVEL_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Niveau scolaire choisi par l'élève (mémorisé dans le navigateur). */
export function useSchoolLevel() {
  const levelId = useSyncExternalStore(subscribeLevel, readLevel, () => null);
  const ready = useSyncExternalStore(subscribeLevel, () => true, () => false);

  const choose = useCallback((id: LevelId) => {
    memoryLevel = id;
    try {
      window.localStorage.setItem(LEVEL_KEY, id);
    } catch {
      /* stockage indisponible */
    }
    window.dispatchEvent(new Event(LEVEL_EVENT));
  }, []);

  return { levelId, level: getLevel(levelId), ready, choose };
}
