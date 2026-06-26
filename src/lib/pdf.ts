import { PDFParse } from "pdf-parse";
import type { Slide } from "./types";

/** Convertit le texte brut d'une page PDF en un Slide (titre = 1ère ligne, bullets = suivantes). */
function pageToSlide(num: number, raw: string): Slide {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let title = "";
  const bullets: string[] = [];
  for (const line of lines) {
    if (!title && line.length <= 120) title = line;
    else bullets.push(line);
  }
  if (!title) title = `Page ${num}`;
  return { index: num, title, bullets };
}

/** Parse un buffer .pdf et renvoie la liste structurée des pages ayant du texte. */
export async function parsePdf(buffer: ArrayBuffer): Promise<Slide[]> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const pages = [...result.pages]
      .sort((a, b) => a.num - b.num)
      .filter((p) => p.text.trim().length > 0);
    return pages.map((p, i) => pageToSlide(i + 1, p.text));
  } finally {
    await parser.destroy();
  }
}