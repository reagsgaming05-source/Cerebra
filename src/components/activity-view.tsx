"use client";

import type { Course, LearningNode } from "@/lib/types";
import {
  AnagramActivity,
  FillBlankActivity,
  FlashcardActivity,
  MatchingActivity,
  QuizActivity,
  SpeedActivity,
  SummaryActivity,
  TrueFalseActivity,
} from "@/components/activities";

interface Props {
  course: Course;
  node: LearningNode;
  updateCourse: (patch: Partial<Course>) => void;
  onComplete: (score: number) => void;
}

/** Sélecteur d'activité partagé entre les onglets du cours et la page dédiée. */
export function ActivityView({ course, node, updateCourse, onComplete }: Props) {
  const props = { course, node, updateCourse, onComplete };
  switch (node.type) {
    case "summary":
      return <SummaryActivity {...props} />;
    case "flashcards":
      return <FlashcardActivity {...props} />;
    case "quiz":
      return <QuizActivity {...props} />;
    case "matching":
      return <MatchingActivity {...props} />;
    case "speed":
      return <SpeedActivity {...props} />;
    case "anagram":
      return <AnagramActivity {...props} />;
    case "fill-blank":
      return <FillBlankActivity {...props} />;
    case "true-false":
      return <TrueFalseActivity {...props} />;
    // TODO: ConceptMapActivity — composant front manquant (backend generateConceptMap déjà présent).
    case "concept-map":
      return null;
    default:
      return null;
  }
}