import { NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai";
import type { Slide } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { slides } = (await req.json()) as { slides: Slide[] };
    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides manquants." }, { status: 400 });
    }
    const summary = await generateSummary(slides);
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json(
      { error: `Échec de la génération: ${(e as Error).message}` },
      { status: 500 },
    );
  }
}