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
    const friends = await db.prepare(`
      SELECT u.id, u.name, u.email, u.avatar, u.friend_code, f.created_at as added_at
      FROM friends f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(session.user.id);

    return NextResponse.json({ friends });
  } catch (e) {
    console.error("[friends/list] error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
