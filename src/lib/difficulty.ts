"use client";

import { useMemo } from "react";
import type { Course } from "./types";

export interface DifficultyEstimate {
  /** "facile" | "moyen" | "difficile" | "exigeant" */
  level: "facile" | "moyen" | "difficile" | "exigeant";
  /** Score 0-100 */
  score: number;
  /** Temps estimé en minutes */
  estimatedMinutes: number;
  /** Nombre de slides */
  slideCount: number;
  /** Densité moyenne de contenu par slide */
  avgDensity: number;
}

/**
 * Calcule un score de difficulté et un temps de révision estimé
 * à partir des slides d'un cours. Pure heuristique, zéro IA.
 */
export function estimateDifficulty(course: Course): DifficultyEstimate {
  const slides = course.slides ?? [];
  const slideCount = slides.length;

  if (slideCount === 0) {
    return { level: "facile", score: 0, estimatedMinutes: 5, slideCount: 0, avgDensity: 0 };
  }

  // Densité : nombre total de mots / nombre de slides
  let totalWords = 0;
  for (const s of slides) {
    const titleWords = s.title ? s.title.split(/\s+/).filter(Boolean).length : 0;
    const bulletWords = s.bullets
      ? s.bullets.reduce((sum, b) => sum + b.split(/\s+/).filter(Boolean).length, 0)
      : 0;
    totalWords += titleWords + bulletWords;
  }
  const avgDensity = totalWords / slideCount;

  // Score de difficulté : combinaison de la densité et du nombre de slides
  // Plafond à 100, chaque facteur contribue à 50% max
  const densityScore = Math.min(50, (avgDensity / 40) * 50);
  const countScore = Math.min(50, (slideCount / 30) * 50);
  const score = Math.round(densityScore + countScore);

  // Niveau
  let level: DifficultyEstimate["level"] = "facile";
  if (score >= 70) level = "exigeant";
  else if (score >= 50) level = "difficile";
  else if (score >= 30) level = "moyen";

  // Temps estimé : ~2 min par slide en moyenne, avec un minimum de 5 min
  const estimatedMinutes = Math.max(5, Math.round(slideCount * 2));

  return { level, score, estimatedMinutes, slideCount, avgDensity: Math.round(avgDensity) };
}

const LEVEL_COLORS: Record<DifficultyEstimate["level"], { bg: string; text: string; label: string }> = {
  facile: { bg: "rgba(78,140,87,.12)", text: "var(--sage)", label: "Facile" },
  moyen: { bg: "rgba(229,165,44,.12)", text: "var(--gold)", label: "Moyen" },
  difficile: { bg: "rgba(204,107,67,.12)", text: "var(--clay)", label: "Difficile" },
  exigeant: { bg: "rgba(190,58,43,.12)", text: "var(--crimson)", label: "Exigeant" },
};

export function getDifficultyColor(level: DifficultyEstimate["level"]) {
  return LEVEL_COLORS[level];
}

/**
 * Hook qui expose la difficulté estimée d'un cours.
 */
export function useDifficulty(course: Course) {
  return useMemo(() => estimateDifficulty(course), [course]);
}
