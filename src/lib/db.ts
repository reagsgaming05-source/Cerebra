import { createClient } from "@libsql/client";
import Database from "better-sqlite3";
import path from "path";

let initialized = false;

async function initSchema(db: any, isTurso: boolean) {
  if (initialized) return;
  initialized = true;
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT,
      google_id TEXT UNIQUE,
      apple_id TEXT UNIQUE,
      totp_secret TEXT,
      totp_enabled INTEGER DEFAULT 0,
      avatar TEXT,
      friend_code TEXT UNIQUE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    );
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(user_id, friend_id)
    );
  `;
  if (isTurso) {
    await db.execute(sql);
  } else {
    db.exec(sql);
  }
}

// Détection automatique : Turso si les vars sont présentes, sinon SQLite local
const useTurso = !!process.env.TURSO_DB_URL;

let tursoClient: any = null;
let sqliteDb: any = null;

export function getDb() {
  if (useTurso) {
    if (!tursoClient) {
      tursoClient = createClient({
        url: process.env.TURSO_DB_URL!,
        authToken: process.env.TURSO_DB_TOKEN,
      });
    }
    return {
      prepare: (sql: string) => ({
        get: async (...params: any[]) => {
          await initSchema(tursoClient, true);
          const result = await tursoClient.execute({ sql, args: params.length ? params : undefined });
          return (result.rows[0] as any) || null;
        },
        run: async (...params: any[]) => {
          await initSchema(tursoClient, true);
          await tursoClient.execute({ sql, args: params.length ? params : undefined });
        },
        all: async (...params: any[]) => {
          await initSchema(tursoClient, true);
          const result = await tursoClient.execute({ sql, args: params.length ? params : undefined });
          return result.rows as any[];
        },
      }),
      exec: async (sql: string) => {
        await initSchema(tursoClient, true);
        await tursoClient.execute(sql);
      },
    };
  }

  // Mode local (SQLite)
  if (!sqliteDb) {
    sqliteDb = new Database(path.join(process.cwd(), "cerebra.db"));
    sqliteDb.pragma("journal_mode = WAL");
    initSchema(sqliteDb, false);
  }
  return {
    prepare: (sql: string) => ({
      get: async (...params: any[]) => {
        return sqliteDb.prepare(sql).get(...params) || null;
      },
      run: async (...params: any[]) => {
        sqliteDb.prepare(sql).run(...params);
      },
      all: async (...params: any[]) => {
        return sqliteDb.prepare(sql).all(...params);
      },
    }),
    exec: async (sql: string) => {
      sqliteDb.exec(sql);
    },
  };
}
