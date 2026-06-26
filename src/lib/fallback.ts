import type {
  Difficulty,
  Flashcard,
  QuizQuestion,
  Slide,
  Summary,
} from "./types";
import { slidesToText } from "./pptx";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Met en forme un fragment en phrase propre (capitalisation + ponctuation finale). */
function cleanSentence(text: string): string {
  let s = text.trim().replace(/\s+/g, " ");
  if (!s) return s;
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?;:]$/.test(s)) s += ".";
  return s;
}

/** Transforme une liste de bullets en un paragraphe lisible, dédoublonné. */
function bulletsToParagraph(bullets: string[]): string {
  const parts = bullets
    .map((b) => b.trim())
    .filter(Boolean)
    .filter((b, i, arr) => arr.findIndex((x) => x.toLowerCase() === b.toLowerCase()) === i);
  if (parts.length === 0) return "";
  const isSentence = (s: string) => /[.!?]$/.test(s.trim());
  if (parts.every(isSentence)) {
    return parts.map(cleanSentence).join(" ");
  }
  // fragments : on assemble en une seule phrase séparée par des virgules
  return cleanSentence(parts.join(", "));
}

/** Résumé déterministe construit à partir des slides (utilisé sans clé API). */
export function fallbackSummary(slides: Slide[]): Summary {
  const contentSlides = slides.filter(
    (s) => s.title.trim() || s.bullets.some((b) => b.trim()),
  );

  const sections = contentSlides.slice(0, 30).map((s) => {
    const heading = s.title.trim() || `Partie ${s.index}`;
    const content = bulletsToParagraph(s.bullets) || heading;
    return { heading, content };
  });

  // intro synthétisée à partir des titres de slides
  const titles = contentSlides
    .map((s) => s.title.trim())
    .filter((t) => t.length > 0 && !/^\d+$/.test(t));
  let intro = "";
  if (titles.length > 0) {
    const themes = titles.slice(0, 5).join(", ");
    intro = cleanSentence(
      `Ce cours traite de ${themes.toLowerCase()}. Il couvre ${contentSlides.length} partie(s) : retrouve ci-dessous les notions essentielles organisées par thème, puis les points clés à retenir`,
    );
  }

  const keyPoints = slides
    .flatMap((s) => s.bullets)
    .map((b) => b.trim())
    .filter((b) => b.length > 8)
    .filter(
      (b, i, arr) => arr.findIndex((x) => x.toLowerCase() === b.toLowerCase()) === i,
    )
    .map(cleanSentence)
    .slice(0, 10);

  return {
    plainText: slidesToText(slides),
    intro,
    sections,
    keyPoints,
  };
}

/** Cartes : terme → définition quand on trouve un ":", sinon titre → bullets. */
export function fallbackFlashcards(slides: Slide[]): Flashcard[] {
  const cards: Flashcard[] = [];
  for (const s of slides) {
    for (const b of s.bullets) {
      const idx = b.indexOf(":");
      if (idx > 0) {
        cards.push({
          id: uid("fc"),
          front: b.slice(0, idx).trim(),
          back: b.slice(idx + 1).trim(),
        });
      }
    }
    if (cards.length < s.index * 3) {
      cards.push({
        id: uid("fc"),
        front: `Que dit le slide "${s.title}" ?`,
        back: s.bullets.join(" ") || s.title,
      });
    }
  }
  return cards.slice(0, 40);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** QCM générés à partir des titres de slides et de leurs bullets. */
export function fallbackQuiz(
  slides: Slide[],
  config: { count: number; difficulty: Difficulty },
): QuizQuestion[] {
  const titles = slides.map((s) => s.title).filter((t) => t.length > 0);
  const questions: QuizQuestion[] = [];
  const pool = shuffle(slides);

  for (const s of pool) {
    if (questions.length >= config.count) break;
    const bullet = s.bullets[0] ?? s.title;
    const correct = s.title;
    const distractors = shuffle(titles.filter((t) => t !== correct)).slice(
      0,
      config.difficulty === "easy" ? 2 : 3,
    );
    if (distractors.length < 2) continue;
    const options = shuffle([correct, ...distractors]);
    questions.push({
      id: uid("q"),
      question:
        config.difficulty === "hard"
          ? `Quel concept correspond à cette définition : « ${bullet} » ?`
          : `De quel sujet traite cette idée : « ${bullet} » ?`,
      options,
      answerIndex: options.indexOf(correct),
      explanation: `Il s'agit du slide « ${correct} ».`,
    });
  }
  return questions;
}