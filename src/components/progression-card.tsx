"use client";

import { Check, FileText, Layers, ListChecks, Lock, Network, Play, Shuffle, SpellCheck, TextCursorInput, Zap } from "lucide-react";
import type { Course, LearningNode, NodeType } from "@/lib/types";
import { courseAccent, NODE_LABEL } from "@/lib/utils";

const ICONS: Record<NodeType, React.ComponentType<{ className?: string }>> = {
  summary: FileText,
  flashcards: Layers,
  quiz: ListChecks,
  matching: Shuffle,
  speed: Zap,
  anagram: SpellCheck,
  "concept-map": Network,
  "fill-blank": TextCursorInput,
  "true-false": Check,
};

/** Phrase d'encouragement qui évolue avec le % de progression. */
function motivation(progress: number): string {
  if (progress >= 100) return "Cours maîtrisé de bout en bout, bravo !";
  if (progress === 0) return "Commence par la leçon pour poser les bases.";
  if (progress <= 25) return "Bon départ, continue à débloquer les étapes.";
  if (progress <= 50) return "Tu prends le rythme, garde le cap.";
  if (progress <= 75) return "Plus de la moitié est derrière toi, continue.";
  return "Tu y es presque, finis les dernières étapes.";
}

/** Statut affiché pour un noeud. */
function statusOf(node: LearningNode, currentId: string | undefined) {
  if (node.completed) return { label: "Validé", color: "var(--sage)" };
  if (!node.unlocked) return { label: "Verrouillé", color: "var(--muted)" };
  if (node.id === currentId) return { label: "À faire", color: "var(--clay)" };
  return { label: "Disponible", color: "var(--petrol)" };
}

/**
 * Carte de suivi d'un cours : grande jauge 0→100% de "connaissance" + le détail
 * de chaque étape (résumé, cartes, quiz, jeux, défi) avec son statut et son score.
 */
export function ProgressionCard({ course }: { course: Course }) {
  const accent = courseAccent(course.id);
  const ordered = [...course.nodes].sort((a, b) => a.order - b.order);
  const current = ordered.find((n) => n.unlocked && !n.completed);
  const progress = course.progress;
  const done = ordered.filter((n) => n.completed).length;

  const ringC = 2 * Math.PI * 30;
  const ringOffset = ringC * (1 - Math.min(100, progress) / 100);

  return (
    <div className="animate-cb-float rounded-[22px] border-[2.5px] border-[var(--ink)] bg-[var(--surface)] p-5 shadow-[5px_5px_0_var(--ink)]">
      {/* En-tête : jauge + titre */}
      <div className="flex items-center gap-4">
        <div className="relative h-[76px] w-[76px] flex-none">
          <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="38" cy="38" r="30" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
            <circle
              cx="38"
              cy="38"
              r="30"
              fill="none"
              stroke={accent.hex}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={ringC}
              strokeDashoffset={ringOffset}
              style={{ transition: "stroke-dashoffset .7s var(--ease-out)" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-heading text-[18px] font-extrabold tracking-[-0.5px] text-[var(--ink)]">
            {progress}%
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <span className="cb-mono mb-1.5 inline-block -rotate-[1.4deg] rounded-[5px] px-[7px] py-[3px] text-[9.5px] font-medium uppercase tracking-[1.4px]" style={{ background: accent.tint, color: accent.hex }}>
            Suivi du cours
          </span>
          <h2 className="m-0 font-heading text-[19px] font-extrabold leading-[1.1] tracking-[-0.3px] text-[var(--ink)]">
            {progress === 100 ? "Connaissance maîtrisée" : "De 0 à 100% de connaissance"}
          </h2>
          <p className="m-0 mt-1 text-[13px] leading-[1.4] text-[var(--ink-2)]">
            {motivation(progress)}
          </p>
        </div>
      </div>

      {/* Compteur d'étapes */}
      <div className="mt-4 flex items-center justify-between rounded-[14px] border-2 border-[var(--line)] bg-[var(--bg)] px-4 py-[10px] text-[13px]">
        <span className="font-semibold text-[var(--ink-2)]">
          Étapes validées
        </span>
        <span className="font-heading font-extrabold text-[var(--ink)]">
          {done} <span className="text-[var(--muted-ink)]">/ {ordered.length}</span>
        </span>
      </div>

      {/* Détail par activité */}
      <div className="mt-3 flex flex-col gap-[9px]">
        {ordered.map((n) => {
          const Icon = ICONS[n.type] ?? FileText;
          const status = statusOf(n, current?.id);
          const isLocked = !n.unlocked;
          const isDone = n.completed;
          const attempts = n.attempts ?? 0;
          const label = NODE_LABEL[n.type] ?? n.type;

          return (
            <div
              key={n.id}
              className="flex items-center gap-3 rounded-[14px] border-2 px-[13px] py-[11px]"
              style={{
                borderColor: isDone ? "var(--sage)" : isLocked ? "var(--line)" : "var(--line)",
                background: isDone ? "rgba(78,140,87,.10)" : "var(--bg)",
                opacity: isLocked ? 0.7 : 1,
              }}
            >
              <span
                className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] border-2 border-[var(--ink)]"
                style={{
                  background: isDone ? "var(--sage)" : isLocked ? "var(--surface-2)" : accent.tint,
                  color: isDone ? "#fff" : isLocked ? "var(--muted)" : accent.hex,
                }}
              >
                {isDone ? (
                  <Check className="h-[19px] w-[19px]" strokeWidth={2.8} />
                ) : isLocked ? (
                  <Lock className="h-[16px] w-[16px]" strokeWidth={2.2} />
                ) : n.id === current?.id ? (
                  <Play className="h-[16px] w-[16px] fill-current" />
                ) : (
                  <Icon className="h-[19px] w-[19px]" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate font-heading text-[14.5px] font-bold leading-tight text-[var(--ink)]">
                  {n.title}
                </div>
                <div className="cb-mono text-[9.5px] font-medium uppercase tracking-[1px] text-[var(--muted-ink)]">
                  {label}
                  {attempts > 0 && <> · meilleur {n.bestScore}%</>}
                </div>
              </div>

              <span
                className="flex-none rounded-full border-[1.5px] px-[9px] py-[3px] text-[10.5px] font-bold"
                style={{ borderColor: status.color, color: status.color }}
              >
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}