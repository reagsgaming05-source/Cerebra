import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  try {
    const { avatar } = await req.json();
    if (!avatar || typeof avatar !== "string") {
      return NextResponse.json({ error: "URL d'avatar invalide" }, { status: 400 });
    }

    const db = getDb();
    await db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatar, session.user.id);

    return NextResponse.json({ success: true, avatar });
  } catch (e) {
    console.error("[profile/avatar] error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
