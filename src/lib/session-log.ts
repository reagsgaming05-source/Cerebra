"use client";

import { useEffect, useState } from "react";

const KEY = "study-app:session-log:v1";
const EVENT = "study-app:session-log-changed";
const MAX_ENTRIES = 200;

export interface SessionEntry {
  ts: number;
  type: "activity" | "course_complete" | "achievement";
  label: string;
  detail: string;
}

function read(): SessionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionEntry[]) : [];
  } catch { return []; }
}

function write(entries: SessionEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function logSession(entry: Omit<SessionEntry, "ts">) {
  const all = read();
  all.unshift({ ...entry, ts: Date.now() });
  write(all);
}

export function useSessionLog() {
  const [entries, setEntries] = useState<SessionEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEntries(read());
    setReady(true);
    const onChange = () => setEntries(read());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return { entries, ready };
}
