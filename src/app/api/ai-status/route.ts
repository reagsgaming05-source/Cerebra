import { NextResponse } from "next/server";
import { checkGemini } from "@/lib/ai";

export const runtime = "nodejs";

// GET /api/ai-status : indique si Gemini est branché et répond.
export async function GET() {
  const status = await checkGemini();
  return NextResponse.json(status, { status: status.ok || !status.configured ? 200 : 502 });
}
