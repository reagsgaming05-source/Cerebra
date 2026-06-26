import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

    const db = getDb();
    const friend = await db.prepare("SELECT id, name, email, avatar FROM users WHERE friend_code = ?").get(code) as any;
    if (!friend) {
      return NextResponse.json({ error: "Aucun utilisateur avec ce code" }, { status: 404 });
    }

    if (friend.id === session.user.id) {
      return NextResponse.json({ error: "Tu ne peux pas t'ajouter toi-même" }, { status: 400 });
    }

    // Vérifier si déjà ami
    const existing = await db.prepare("SELECT id FROM friends WHERE user_id = ? AND friend_id = ?").get(session.user.id, friend.id);
    if (existing) {
      return NextResponse.json({ error: "Déjà dans ta liste d'amis" }, { status: 409 });
    }

    await db.prepare("INSERT INTO friends (user_id, friend_id) VALUES (?, ?)").run(session.user.id, friend.id);
    await db.prepare("INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)").run(friend.id, session.user.id);

    return NextResponse.json({ success: true, friend: { id: friend.id, name: friend.name, email: friend.email, avatar: friend.avatar } });
  } catch (e) {
    console.error("[friends/add] error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
