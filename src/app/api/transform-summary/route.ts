import { NextResponse } from "next/server";
import { simplifySummary, deepenSummary, generateExamples, translateSummary } from "@/lib/ai";
import type { Summary } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { action, summary, targetLang } = (await req.json()) as {
      action: "simplify" | "deepen" | "examples" | "translate";
      summary: Summary;
      targetLang?: "fr" | "en";
    };
    if (!summary) {
      return NextResponse.json({ error: "Résumé manquant." }, { status: 400 });
    }
    let result = "";
    switch (action) {
      case "simplify": result = await simplifySummary(summary); break;
      case "deepen": result = await deepenSummary(summary); break;
      case "examples": result = await generateExamples(summary); break;
      case "translate": result = await translateSummary(summary, targetLang ?? "en"); break;
      default: return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
    }
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json({ error: `Échec: ${(e as Error).message}` }, { status: 500 });
  }
}
