import { NextResponse } from "next/server";
import { gradeAnswer } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { expected, given } = (await req.json()) as {
      expected: string;
      given: string;
    };
    if (typeof expected !== "string" || expected.trim().length === 0) {
      return NextResponse.json({ error: "Réponse attendue manquante." }, { status: 400 });
    }
    if (typeof given !== "string" || given.trim().length === 0) {
      return NextResponse.json({ error: "Réponse manquante." }, { status: 400 });
    }
    const result = await gradeAnswer(expected.trim(), given.trim());
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: `Échec de la correction: ${(e as Error).message}` },
      { status: 500 },
    );
  }
}