import JSZip from "jszip";
import type { Slide } from "./types";

/** Extrait les runs de texte <a:t> d'un bloc XML. */
function extractRuns(xml: string): string[] {
  const runs: string[] = [];
  const re = /<a:t>([\s\S]*?)<\/a:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    runs.push(decodeXml(m[1]).trim());
  }
  return runs.filter(Boolean);
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Découpe un slide XML en shapes <p:sp> et identifie titre vs bullets. */
function parseSlideXml(xml: string): { title: string; bullets: string[] } {
  let title = "";
  const bullets: string[] = [];

  const shapeRe = /<p:sp>([\s\S]*?)<\/p:sp>/g;
  let shape: RegExpExecArray | null;
  while ((shape = shapeRe.exec(xml)) !== null) {
    const block = shape[1];
    const isTitle = /<p:ph[^>]*type="(title|ctrTitle)"/.test(block);
    // chaque paragraphe <a:p> est un bullet / une ligne
    const pRe = /<a:p>([\s\S]*?)<\/a:p>/g;
    let p: RegExpExecArray | null;
    while ((p = pRe.exec(block)) !== null) {
      const line = extractRuns(p[1]).join(" ").replace(/\s+/g, " ").trim();
      if (!line) continue;
      if (isTitle && !title) title = line;
      else bullets.push(line);
    }
  }

  // fallback: si aucun titre détecté, prendre la première ligne
  if (!title && bullets.length > 0) {
    title = bullets.shift()!;
  }
  return { title, bullets };
}

function slideNumber(name: string): number {
  const m = name.match(/slide(\d+)\.xml$/i);
  return m ? parseInt(m[1], 10) : 0;
}

/** Parse un buffer .pptx et renvoie la liste structurée des slides. */
export async function parsePptx(buffer: ArrayBuffer): Promise<Slide[]> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/i.test(f))
    .sort((a, b) => slideNumber(a) - slideNumber(b));

  const slides: Slide[] = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async("string");
    const { title, bullets } = parseSlideXml(xml);
    slides.push({
      index: i + 1,
      title: title || `Slide ${i + 1}`,
      bullets,
    });
  }
  return slides;
}

export function slidesToText(slides: Slide[]): string {
  return slides
    .map((s) => `## ${s.title}\n${s.bullets.map((b) => `- ${b}`).join("\n")}`)
    .join("\n\n");
}