import type { Flashcard } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Intervalle (en jours) avant la prochaine révision, indexé par boîte Leitner (1..5). */
export const LEITNER_INTERVAL_DAYS = [1, 3, 7, 14, 30];

/** Met à jour la boîte Leitner et la date de prochaine révision d'une carte. */
export function reviewCard(card: Flashcard, correct: boolean, now = Date.now()): Flashcard {
  const box = correct ? Math.min((card.box ?? 1) + 1, 5) : 1;
  const days = LEITNER_INTERVAL_DAYS[box - 1];
  return { ...card, box, dueDate: now + days * DAY_MS };
}

/** Vrai si la carte est due (jamais révisée, ou date de révision atteinte). */
export function isDue(card: Flashcard, now = Date.now()): boolean {
  return card.dueDate == null || card.dueDate <= now;
}

/** Filtre les cartes dues parmi un deck. */
export function dueCards(cards: Flashcard[], now = Date.now()): Flashcard[] {
  return cards.filter((c) => isDue(c, now));
}
