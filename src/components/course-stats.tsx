"use client";

import type { Course } from "@/lib/types";
import { formatRelativeDate } from "@/lib/format";

/** Panneau de statistiques d'un cours : tuiles, dernière étude, détail par activité. */
export function CourseStats({ course }: { course: Course }) {
  const totalAttempts = course.nodes.reduce((s, n) => s + (n.attempts ?? 0), 0);

  return (
    <div className="animate-cb-float space-y-[14px]">
      {/* 3 tuiles */}
      <div className="flex gap-[11px]">
        <Tile value={String(totalAttempts)} label="Tentatives" color="var(--clay)" />
        <Tile value={String(course.xp)} label="XP gagnés" color="var(--gold)" />
        <Tile value={`${course.progress}%`} label="Complété" color="var(--sage)" />
      </div>

      {/* Dernière étude */}
      <div className="rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] px-4">
        <div className="flex items-center justify-between py-[11px] text-sm">
          <span className="text-[var(--muted-ink)]">Dernière étude</span>
          <span className="font-bold text-[var(--ink)]">{formatRelativeDate(course.lastStudiedAt)}</span>
        </div>
      </div>

      {/* Liste par activité */}
      <div className="overflow-hidden rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)]">
        {course.nodes.map((n, i) => {
          const attempts = n.attempts ?? 0;
          const scoreColor = attempts > 0 ? "var(--sage)" : "var(--muted)";
          return (
            <div
              key={n.id}
              className="flex items-center justify-between border-b-[1.5px] border-[var(--line)] px-4 py-[13px] last:border-b-0"
            >
              <span className="text-[14.5px] font-semibold text-[var(--ink)]">{n.title}</span>
              <span className="text-[13px] font-bold" style={{ color: scoreColor }}>
                {attempts > 0 ? `${n.bestScore}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tile({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex-1 rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] p-[14px] text-center">
      <div className="font-heading text-2xl font-extrabold" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-xs font-semibold text-[var(--muted-ink)]">{label}</div>
    </div>
  );
}