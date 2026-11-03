// Modèle de données partagé entre client et serveur.

export interface Slide {
  index: number;
  title: string;
  bullets: string[];
  notes?: string;
}

export interface SummarySection {
  heading: string;
  content: string;
}

export interface Summary {
  /** texte brut des slides, utilisé pour la recherche (pas affiché) */
  plainText: string;
  /** paragraphe d'introduction synthétisant le cours (vue d'ensemble) */
  intro?: string;
  sections: SummarySection[];
  keyPoints: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  /** boîte Leitner 1..5 (répétition espacée), absente si jamais révisée */
  box?: number;
  /** timestamp de prochaine révision due (répétition espacée) */
  dueDate?: number;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizConfig {
  count: number;
  difficulty: Difficulty;
}

export type NodeType =
  | "summary"
  | "flashcards"
  | "quiz"
  | "matching"
  | "speed"
  | "anagram"
  | "concept-map"
  | "fill-blank"
  | "true-false";

/** Un item de "Texte à trous" : une phrase tirée du résumé avec un terme masqué. */
export interface FillBlankItem {
  id: string;
  /** texte avant le blanc */
  before: string;
  /** texte après le blanc */
  after: string;
  /** terme attendu (casing d'origine dans la phrase) */
  answer: string;
  /** nombre de lettres du terme (pour tailler le blanc) */
  length: number;
}

export interface LearningNode {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  xp: number;
  order: number;
  /** vrai quand le noeud précédent est complété (ou pour le premier) */
  unlocked: boolean;
  /** vrai quand l'activité a été réussie au moins une fois */
  completed: boolean;
  /** meilleur score 0..100 enregistré sur ce noeud */
  bestScore: number;
  /** nombre de fois que l'activité a été tentée */
  attempts?: number;
}

export interface Course {
  id: string;
  title: string;
  createdAt: number;
  slides: Slide[];
  summary?: Summary;
  flashcards?: Flashcard[];
  /** nombre de quiz générés */
  quizRuns: number;
  nodes: LearningNode[];
  /** progression globale 0..100 dérivée des noeuds */
  progress: number;
  /** xp cumulés */
  xp: number;
  /** vrai si le cours est épinglé en tête de liste */
  pinned?: boolean;
  /** timestamp de la dernière étude (complétion d'une activité) */
  lastStudiedAt?: number;
  /** Tags / catégories personnalisées */
  tags?: string[];
  /** Archivé (soft delete) */
  archived?: boolean;
  /** Questions de quiz rédigées à la main (cours du catalogue) : pas de génération IA */
  quizBank?: QuizQuestion[];
  /** Référence à l'unité du catalogue suisse dont ce cours est issu */
  catalog?: { levelId: string; subjectId: string; unitId: string };
}