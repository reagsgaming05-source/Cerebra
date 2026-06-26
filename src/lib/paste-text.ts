import type { Slide } from "./types";

/** Convertit un bloc de texte (lignes consécutives) en Slide, même heuristique que pdf.ts. */
function blockToSlide(num: number, raw: string): Slide {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let title = "";
  const bullets: string[] = [];
  for (const line of lines) {
    if (!title) {
      title = line.slice(0, 120);
      if (line.length > 120) bullets.push(line);
    } else {
      bullets.push(line);
    }
  }
  return { index: num, title: title || `Partie ${num}`, bullets };
}

/** Découpe un texte collé en slides : un bloc séparé par ligne(s) vide(s) = un slide. */
export function parsePastedText(raw: string): Slide[] {
  const blocks = raw
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks.map((b, i) => blockToSlide(i + 1, b));
}
