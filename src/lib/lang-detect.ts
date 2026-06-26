/**
 * Détection simple de la langue d'un texte (FR/EN/autre).
 * Utilise une approche par mots fréquents — pas de dépendance externe.
 */

// Mots fréquents français (top ~40)
const FR_WORDS = new Set([
  "le", "la", "les", "des", "de", "du", "un", "une", "et", "est",
  "sont", "dans", "pour", "sur", "par", "avec", "pas", "que", "qui",
  "donc", "mais", "ou", "où", "nous", "vous", "ils", "elles", "ce",
  "cette", "ces", "son", "sa", "ses", "leur", "leurs", "aux", "en",
  "au", "ne", "plus", "tout", "tous", "comme", "être", "avoir",
  "fait", "peut", "entre", "sans", "chez", "après", "avant",
]);

// Mots fréquents anglais (top ~40)
const EN_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can",
  "had", "her", "was", "one", "our", "out", "has", "have", "been",
  "some", "them", "than", "that", "this", "what", "when", "which",
  "will", "with", "would", "about", "into", "over", "also", "its",
  "just", "more", "than", "then", "very", "each", "how", "other",
  "their", "there", "these", "they", "well", "your",
]);

export type DetectedLang = "fr" | "en" | "other";

/**
 * Détecte la langue d'un texte en comparant la proportion de mots
 * fréquents français vs anglais. Retourne "fr", "en", ou "other".
 */
export function detectLang(text: string): DetectedLang {
  const words = text
    .toLowerCase()
    .replace(/[^a-zà-ÿ\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  if (words.length < 3) return "other";

  let frScore = 0;
  let enScore = 0;

  for (const w of words) {
    if (FR_WORDS.has(w)) frScore++;
    if (EN_WORDS.has(w)) enScore++;
  }

  if (frScore > enScore && frScore / words.length > 0.05) return "fr";
  if (enScore > frScore && enScore / words.length > 0.05) return "en";
  return "other";
}

/**
 * Détecte la langue d'un cours à partir de ses slides.
 */
export function detectCourseLang(
  slides: { title: string; bullets: string[] }[],
): DetectedLang {
  const text = slides
    .map((s) => [s.title, ...s.bullets].join(" "))
    .join(" ")
    .trim();
  return detectLang(text);
}
