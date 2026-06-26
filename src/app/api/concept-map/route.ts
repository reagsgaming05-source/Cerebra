import { NextResponse } from "next/server";
import { generateConceptMap } from "@/lib/ai";
import type { Slide, Summary } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { slides, summary } = (await req.json()) as {
      slides: Slide[];
      summary?: Summary;
    };
    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides manquants." }, { status: 400 });
    }
    const graph = await generateConceptMap(slides, summary);
    return NextResponse.json({ graph });
  } catch (e) {
    return NextResponse.json(
      { error: `Échec de la génération: ${(e as Error).message}` },
      { status: 500 },
    );
  }
}