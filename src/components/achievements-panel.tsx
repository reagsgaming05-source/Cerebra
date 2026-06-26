"use client";

import { useState } from "react";
import { Award, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { Achievement } from "@/lib/achievements";

interface AchievementsPanelProps {
  achievements: (Achievement & { unlocked: boolean; unlockedAt: number | null })[];
  unlockedCount: number;
  totalCount: number;
}

export function AchievementsPanel({
  achievements,
  unlockedCount,
  totalCount,
}: AchievementsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <section className="mb-5 rounded-[22px] border-2 border-[var(--line)] bg-[var(--surface)] overflow-hidden">
      {/* Header cliquable */}
      <button
        type="button"
        onClick={() => setExpanded((s) => !s)}
        data-press
        className="flex w-full items-center gap-3 p-[15px] text-left"
      >
        <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[12px] border-2 border-[var(--gold)] bg-[rgba(229,165,44,.12)] text-[var(--gold)]">
          <Award className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="font-heading text-[15px] font-bold">Succès</span>
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-[var(--muted-ink)]">
              {unlockedCount} / {totalCount} débloqués
            </span>
            <span className="text-[12.5px] font-bold text-[var(--gold)]">{pct}%</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[var(--muted-ink)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--muted-ink)]" />
        )}
      </button>

      {/* Barre de progression */}
      <div className="mx-[15px] mb-2 h-[6px] overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className="h-full rounded-full bg-[var(--gold)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Liste déroulante */}
      {expanded && (
        <div className="flex flex-col gap-[6px] px-[15px] pb-[15px]">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex items-center gap-3 rounded-[14px] border-2 p-3 ${
                ach.unlocked
                  ? "border-[var(--sage)] bg-[rgba(78,140,87,.08)]"
                  : "border-[var(--line)] bg-[var(--bg)] opacity-60"
              }`}
            >
              <span className="flex h-[36px] w-[36px] flex-none items-center justify-center rounded-[10px] border-2 border-[var(--line)] bg-[var(--surface)] text-lg">
                {ach.icon}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-bold leading-[1.2] text-[var(--ink)]">
                  {ach.title}
                </span>
                <span className="text-[12px] text-[var(--muted-ink)]">
                  {ach.unlocked ? ach.description : "🔒 Encore verrouillé"}
                </span>
              </div>
              {ach.unlocked && (
                <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-[var(--sage)] text-white">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
