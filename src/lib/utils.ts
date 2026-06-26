import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Palette signature Cerebra (clay). Un cours n'a pas de matière/couleur dans le
 * modèle de données, on dérive donc un accent déterministe depuis son id.
 */
export const COURSE_ACCENTS = [
  { hex: "#4E8B57", tint: "rgba(78,140,87,.13)" }, // sage
  { hex: "#CC6B43", tint: "rgba(204,107,67,.13)" }, // clay
  { hex: "#2B6C68", tint: "rgba(43,108,104,.13)" }, // petrol
  { hex: "#E5A52C", tint: "rgba(229,165,44,.13)" }, // gold
  { hex: "#BE3A2B", tint: "rgba(190,58,43,.13)" }, // crimson
] as const;

export function courseAccent(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COURSE_ACCENTS[h % COURSE_ACCENTS.length];
}

/** Map un type de noeud du parcours vers un libellé + teinte de stamp (maquette). */
export const NODE_LABEL: Record<string, string> = {
  summary: "Leçon",
  flashcards: "Cartes",
  quiz: "Quiz",
  matching: "Jeu",
  speed: "Défi",
  anagram: "Mots",
  "concept-map": "Schéma",
  "fill-blank": "Trous",
  "true-false": "V/F",
};
