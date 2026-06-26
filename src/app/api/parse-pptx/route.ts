import { NextResponse } from "next/server";
import { parsePptx } from "@/lib/pptx";
import type { Slide } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function deriveTitle(slides: Slide[], filename: string): string {
  if (slides.length > 0 && slides[0].title) {
    const t = slides[0].title.trim();
    if (t.length > 0 && t.length < 80) return t;
  }
  return filename.replace(/\.pptx$/i, "").replace(/[_-]+/g, " ").trim() || "Nouveau cours";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const filename = (form.get("filename") as string) || "cours.pptx";
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }
    if (!/\.pptx$/i.test(filename)) {
      return NextResponse.json(
        { error: "Le fichier doit être au format .pptx" },
        { status: 400 },
      );
    }
    const buffer = await file.arrayBuffer();
    const slides = await parsePptx(buffer);
    if (slides.length === 0) {
      return NextResponse.json(
        { error: "Aucun slide exploitable trouvé dans ce fichier." },
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