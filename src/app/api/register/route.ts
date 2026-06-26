import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Mot de passe trop court (min 6 caractères)." }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }

    const id = uuid();
    const password_hash = await bcrypt.hash(password, 12);
    await db.prepare("INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)").run(
      id, email, password_hash, name || email.split("@")[0]
    );

    return NextResponse.json({ success: true, userId: id });
  } catch (e) {
    return NextResponse.json({ error: `Erreur: ${(e as Error).message}` }, { status: 500 });
  }
}
