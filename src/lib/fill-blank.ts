import type { Course, FillBlankItem } from "./types";
import { normalize } from "./search";

/** Nombre maximal d'items par session de Texte à trous. */
export const FILL_BLANK_MAX = 8;
/** Nombre minimum d'items requis pour lancer une session. */
export const FILL_BLANK_MIN = 3;

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Coupe un bloc de texte en phrases (fr/com). */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?;:])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 18 && s.length <= 240);
}

/** Termes candidats : rectos de flashcards courts et sans ponctuation de fin. */
function candidateTerms(course: Course): string[] {
  const terms = (course.flashcards ?? [])
    .map((c) => c.front.trim())
    .filter((t) => {
      if (t.length < 3 || t.length > 28) return false;
      if (/[?!:;.]$/.test(t)) return false;
      // On évite les questions/debuts de phrase longs : 1 à 4 mots.
      return t.split(/\s+/).length <= 4;
    });
  // Dédoublonne en gardant l'ordre.
  return terms.filter((t, i, arr) => arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i);
}

interface Token {
  raw: string;
  start: number;
  end: number;
  norm: string;
}

/** Découpe une phrase en tokens (runs de non-whitespace) avec leurs offsets. */
function tokenize(sentence: string): Token[] {
  const tokens: Token[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sentence)) !== null) {
    const raw = m[0];
    tokens.push({ raw, start: m.index, end: m.index + raw.length, norm: normalize(raw) });
  }
  return tokens;
}

const LEAD_PUNCT = /^[^\p{L}\p{N}]+/u;
const TRAIL_PUNCT = /[^\p{L}\p{N}]+$/u;

interface BlankMatch {
  start: number; // offset original du début du blanc (après ponctuation initiale)
  end: number; // offset original de fin du blanc (avant ponctuation finale)
  text: string; // texte d'origine du terme tel qu'il apparaît dans la phrase
}

/**
 * Cherche le terme (normalisé) comme une suite de tokens consécutifs, insensible
 * à la casse/aux accents. Gère la ponctuation collée au terme (guillemets, virgule).
 * Renvoie null si non trouvé.
 */
function findBlank(sentence: string, term: string): BlankMatch | null {
  const tokens = tokenize(sentence);
  const termWords = normalize(term).split(" ").filter(Boolean);
  if (termWords.length === 0) return null;
  for (let i = 0; i + termWords.length <= tokens.length; i++) {
    let ok = true;
    for (let j = 0; j < termWords.length; j++) {
      if (tokens[i + j].norm !== termWords[j]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    const first = tokens[i];
    const last = tokens[i + termWords.length - 1];
    const lead = first.raw.match(LEAD_PUNCT)?.[0].length ?? 0;
    const trail = last.raw.match(TRAIL_PUNCT)?.[0].length ?? 0;
    const start = first.start + lead;
    const end = last.end - trail;
    if (end <= start) continue;
    return { start, end, text: sentence.slice(start, end) };
  }
  return null;
}

/**
 * Construit les items de Texte à trous à partir du résumé (et des slides en
 * complément). Aucun appel réseau : tout est dérivé du contenu déjà présent,
 * donc ça fonctionne hors-ligne, sans clé API.
 */
export function buildFillBlankItems(course: Course): FillBlankItem[] {
  const corpus: string[] = [];
  if (course.summary) {
    if (course.summary.intro?.trim()) corpus.push(course.summary.intro);
    for (const s of course.summary.sections) {
      if (s.content?.trim()) corpus.push(s.content);
    }
    for (const k of course.summary.keyPoints) {
      if (k?.trim()) corpus.push(k);
    }
  }
  // Complément : bullets de slides (utile si pas de résumé ou peu de phrases).
  for (const s of course.slides) {
    for (const b of s.bullets) if (b?.trim()) corpus.push(b);
  }

  const sentences = shuffle(splitSentences(corpus.join(" \n")));
  const terms = shuffle(candidateTerms(course));

  const items: FillBlankItem[] = [];
  const usedSentences = new Set<string>();

  for (const term of terms) {
    if (items.length >= FILL_BLANK_MAX) break;
    const match = sentences.find((sent) => {
      if (usedSentences.has(sent)) return false;
      return findBlank(sent, term) !== null;
    });
    if (!match) continue;
    const blank = findBlank(match, term);
    if (!blank) continue;
    usedSentences.add(match);
    items.push({
      id: uid("fb"),
      before: match.slice(0, blank.start).trim(),
      after: match.slice(blank.end).trim(),
      answer: blank.text,
      length: blank.text.length,
    });
  }

  return items;
}