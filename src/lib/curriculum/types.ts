// Catalogue de contenus scolaires suisses (école obligatoire → université).
// Chaque unité devient un Course classique (parcours, flashcards, quiz…) quand
// l'élève la commence, avec du contenu rédigé à la main plutôt que généré.

export interface CatalogSlide {
  title: string;
  bullets: string[];
}

export interface CatalogCard {
  front: string;
  back: string;
}

export interface CatalogQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface CatalogUnit {
  id: string;
  title: string;
  emoji: string;
  description: string;
  /** objectifs d'apprentissage (style PER) */
  goals: string[];
  slides: CatalogSlide[];
  keyPoints: string[];
  flashcards: CatalogCard[];
  quiz: CatalogQuestion[];
}

export interface CatalogSubject {
  id: string;
  name: string;
  emoji: string;
  /** couleur d'accent (hex) */
  color: string;
  units: CatalogUnit[];
}

export type LevelId = "cycle1" | "cycle2" | "cycle3" | "sec2" | "uni";

export interface CatalogLevel {
  id: LevelId;
  name: string;
  /** libellé court, aussi utilisé comme tag de cours */
  short: string;
  grades: string;
  ages: string;
  description: string;
  emoji: string;
  subjects: CatalogSubject[];
}
