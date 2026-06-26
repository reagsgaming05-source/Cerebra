import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { v4 as uuid } from "uuid";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        totpCode: { label: "Code 2FA", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const db = getDb();
        const user = await db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
        if (!user || !user.password_hash) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        // Si 2FA activé, on vérifie le code TOTP
        if (user.totp_enabled) {
          const totpCode = credentials?.totpCode as string;
          if (!totpCode) {
            throw new Error("TOTP_REQUIRED");
          }
          const otplib = await import("otplib");
          const isValid = otplib.verify({ token: totpCode, secret: user.totp_secret });
          if (!isValid) return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID!,
      clientSecret: process.env.AUTH_APPLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" || account?.provider === "apple") {
          const db = getDb();
          const providerField = account.provider === "google" ? "google_id" : "apple_id";
          const existing = await db.prepare(`SELECT * FROM users WHERE ${providerField} = ?`).get(user.id) as any;
          if (!existing) {
            const id = uuid();
            let friendCode: string;
            do {
              friendCode = String(Math.floor(100000 + Math.random() * 900000));
            } while (await db.prepare("SELECT id FROM users WHERE friend_code = ?").get(friendCode));
            await db.prepare(
              `INSERT INTO users (id, email, name, ${providerField}, friend_code) VALUES (?, ?, ?, ?, ?)`
            ).run(id, user.email, user.name, user.id, friendCode);
            user.id = id;
          } else {
            user.id = existing.id;
          }
        }
        return true;
      } catch (e) {
        console.error("[auth] signIn error:", e);
        return true; // Ne pas bloquer la connexion même si la DB a un souci
      }
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
