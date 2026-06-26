import { NextResponse } from "next/server";
import { parseDocx } from "@/lib/docx";
import type { Slide } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const GENERIC_TITLES = /^(Introduction|Section|Document)$/i;

function deriveTitle(slides: Slide[], filename: string): string {
  if (slides.length > 0 && slides[0].title && !GENERIC_TITLES.test(slides[0].title.trim())) {
    const t = slides[0].title.trim();
    if (t.length > 0 && t.length < 80) return t;
  }
  return filename.replace(/\.docx$/i, "").replace(/[_-]+/g, " ").trim() || "Nouveau cours";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const filename = (form.get("filename") as string) || "document.docx";
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }
    if (!/\.docx$/i.test(filename)) {
      return NextResponse.json(
        { error: "Le fichier doit être au format .docx" },
        { status: 400 },
      );
    }
    const buffer = await file.arrayBuffer();
    const slides = await parseDocx(buffer);
    if (slides.length === 0) {
      return NextResponse.json(
        { error: "Aucun texte exploitable trouvé dans ce document." },
        { status: 422 },
      );
    }
    return NextResponse.json({ slides, title: deriveTitle(slides, filename) });
  } catch (e) {
    return NextResponse.json(
      { error: `Échec du parsing: ${(e as Error).message}` },
      { status: 500 },
    );
  }
}