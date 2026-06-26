import { NextResponse } from "next/server";
import { parsePdf } from "@/lib/pdf";
import type { Slide } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function deriveTitle(slides: Slide[], filename: string): string {
  if (slides.length > 0 && slides[0].title) {
    const t = slides[0].title.trim();
    if (t.length > 0 && t.length < 80 && !/^Page \d+$/.test(t)) return t;
  }
  return filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim() || "Nouveau cours";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const filename = (form.get("filename") as string) || "document.pdf";
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }
    if (!/\.pdf$/i.test(filename)) {
      return NextResponse.json(
        { error: "Le fichier doit être au format .pdf" },
        { status: 400 },
      );
    }
    const buffer = await file.arrayBuffer();
    const slides = await parsePdf(buffer);
    if (slides.length === 0) {
      return NextResponse.json(
        { error: "Aucun texte exploitable trouvé dans ce PDF." },
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