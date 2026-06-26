import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  try {
    const db = getDb();
    const user = await db.prepare("SELECT id, email, name, avatar, friend_code, created_at FROM users WHERE id = ?").get(session.user.id) as any;
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (e) {
    console.error("[profile/data] error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
