import { NextResponse } from "next/server";
import { generateQuiz, generateQuizFromFlashcards } from "@/lib/ai";
import type { Difficulty, Flashcard, Slide, Summary } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { slides, flashcards, summary, config } = (await req.json()) as {
      slides: Slide[];
      flashcards?: Flashcard[];
      summary?: Summary;
      config: { count: number; difficulty: Difficulty };
    };
    if (!config?.count || !config?.difficulty) {
      return NextResponse.json(
        { error: "Configuration du quiz incomplète." },
        { status: 400 },
      );
    }
    // Priorité aux slides ; si absents, on utilise les flashcards seules.
    if (Array.isArray(slides) && slides.length > 0) {
      const questions = await generateQuiz(slides, config, summary);
      return NextResponse.json({ questions });
    }
    if (Array.isArray(flashcards) && flashcards.length >= 3) {
      const questions = await generateQuizFromFlashcards(flashcards, config);
      return NextResponse.json({ questions });
    }
    return NextResponse.json(
      { error: "Pas assez de contenu pour générer un quiz. Il faut des slides ou au moins 3 flashcards." },
      { status: 400 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: `Échec de la génération: ${(e as Error).message}` },
      { status: 500 },
    );
  }
}