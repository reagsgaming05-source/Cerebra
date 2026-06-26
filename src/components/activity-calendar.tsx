"use client";

import { useMemo } from "react";
import { useStreak } from "@/lib/streak";

const DAY_MS = 86400000;
const CELL_SIZE = 12;
const CELL_GAP = 2;
const WEEKS = 20;

export function ActivityCalendar() {
  const { streak, studiedToday, ready } = useStreak();

  const cells = useMemo(() => {
    if (!ready) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    const days: { date: Date; active: boolean }[] = [];
    // Récupère les jours étudiés depuis le streak
    const studiedDays = new Set<string>();
    try {
      const raw = window.localStorage.getItem("study-app:study-days:v1");
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        parsed.forEach((d: string) => studiedDays.add(d));
      }
    } catch { /* ignore */ }

    for (let i = WEEKS * 7 - 1; i >= 0; i--) {
      const ts = todayTs - i * DAY_MS;
      const d = new Date(ts);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ date: d, active: studiedDays.has(key) });
    }
    return days;
  }, [ready, studiedToday]);

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="mb-[22px] rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-heading text-sm font-bold">Activité (20 semaines)</span>
        <span className="text-[11px] text-[var(--muted-ink)]">Streak: {streak}j</span>
      </div>
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {week.map((cell, di) => (
              <div
                key={di}
                className="rounded-[2px]"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: cell.active ? "var(--clay)" : "var(--surface-2)",
                  opacity: cell.active ? 1 : 0.5,
                }}
                title={cell.date.toLocaleDateString("fr-CH")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
