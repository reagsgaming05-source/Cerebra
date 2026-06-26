import { NextResponse } from "next/server";
import { explainConcept } from "@/lib/ai";
import type { Slide, Summary } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { concept, slides, summary } = (await req.json()) as {
      concept: string;
      slides: Slide[];
      summary?: Summary;
    };
    if (!concept || typeof concept !== "string" || concept.trim().length === 0) {
      return NextResponse.json({ error: "Concept manquant." }, { status: 400 });
    }
    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides manquants." }, { status: 400 });
    }
    const explanation = await explainConcept(concept.trim(), slides, summary);
    return NextResponse.json({ explanation });
  } catch (e) {
    return NextResponse.json(
      { error: `Échec: ${(e as Error).message}` },
      { status: 500 },
    );
  }
}
