import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import * as otplib from "otplib";
import QRCode from "qrcode";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  try {
    const db = getDb();
    const user = await db.prepare("SELECT * FROM users WHERE id = ?").get(session.user.id) as any;
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

    const { action, code } = await req.json();

    if (action === "generate") {
      // Générer un secret TOTP
      const secret = otplib.generateSecret();
      const otpauth = otplib.generateURI({ strategy: "totp", issuer: "Cerebra", label: user.email, secret });
      const qrCode = await QRCode.toDataURL(otpauth);

      // Sauvegarder le secret temporairement
      await db.prepare("UPDATE users SET totp_secret = ? WHERE id = ?").run(secret, session.user.id);

      return NextResponse.json({ secret, qrCode });
    }

    if (action === "verify") {
      if (!code) return NextResponse.json({ error: "Code requis." }, { status: 400 });
      const user = await db.prepare("SELECT totp_secret FROM users WHERE id = ?").get(session.user.id) as any;
      if (!user?.totp_secret) return NextResponse.json({ error: "Secret manquant." }, { status: 400 });

      const isValid = otplib.verify({ token: code, secret: user.totp_secret });
      if (!isValid) return NextResponse.json({ error: "Code invalide." }, { status: 400 });

      // Activer le 2FA
      await db.prepare("UPDATE users SET totp_enabled = 1 WHERE id = ?").run(session.user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "disable") {
      await db.prepare("UPDATE users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?").run(session.user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: `Erreur: ${(e as Error).message}` }, { status: 500 });
  }
}
