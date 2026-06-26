import JSZip from "jszip";
import type { Slide } from "./types";

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

interface Para {
  text: string;
  heading: boolean;
}

/** Extrait les paragraphes <w:p> de document.xml avec leur texte et un flag titre. */
function extractParas(xml: string): Para[] {
  const paras: Para[] = [];
  const pRe = /<w:p[ >]([\s\S]*?)<\/w:p>/g;
  let m: RegExpExecArray | null;
  while ((m = pRe.exec(xml)) !== null) {
    const block = m[1];
    const heading = /<w:pStyle[^>]*w:val="[^"]*(?:Heading|Titre|Title)/i.test(block);
    const tRe = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let t: RegExpExecArray | null;
    let text = "";
    while ((t = tRe.exec(block)) !== null) {
      text += decodeXml(t[1]);
    }
    text = text.replace(/\s+/g, " ").trim();
    if (text) paras.push({ text, heading });
  }
  return paras;
}

/** Parse un buffer .docx et renvoie la liste structurée des sections (une par titre). */
export async function parseDocx(buffer: ArrayBuffer): Promise<Slide[]> {
  const zip = await JSZip.loadAsync(buffer);
  const file = zip.file("word/document.xml");
  if (!file) {
    throw new Error("Document .docx invalide (word/document.xml manquant).");
  }
  const xml = await file.async("string");
  const paras = extractParas(xml);
  if (paras.length === 0) return [];

  const hasHeadings = paras.some((p) => p.heading);

  if (!hasHeadings) {
    const title = paras[0].text.slice(0, 120) || "Document";
    const bullets = paras.slice(1).map((p) => p.text);
    return [{ index: 1, title, bullets }];
  }

  const slides: Slide[] = [];
  let current: Slide | null = null;
  for (const p of paras) {
    if (p.heading) {
      if (current) slides.push(current);
      current = { index: 0, title: p.text.slice(0, 120) || "Section", bullets: [] };
    } else if (current) {
      current.bullets.push(p.text);
    } else {
      current = { index: 0, title: "Introduction", bullets: [p.text] };
    }
  }
  if (current) slides.push(current);
  return slides
    .filter((s) => s.title || s.bullets.length > 0)
    .map((s, i) => ({ ...s, index: i + 1 }));
}