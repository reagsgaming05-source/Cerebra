"use client";

import { Check, FileText, Layers, ListChecks, Lock, Network, Play, Shuffle, SpellCheck, TextCursorInput, X, Zap } from "lucide-react";
import type { LearningNode, NodeType } from "@/lib/types";
import { NODE_LABEL } from "@/lib/utils";

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

/** Style du stamp mono incliné par type de noeud (cf. maquette renderVals TYPE_STAMP). */
const STAMP_STYLE: Record<NodeType, React.CSSProperties> = {
  summary: { background: "transparent", color: "var(--ink-2)", border: "1.5px solid var(--ink-2)" },
  flashcards: { background: "rgba(78,140,87,.14)", color: "var(--sage)", border: "1.5px solid transparent" },
  quiz: { background: "var(--clay)", color: "#FBF6EC", border: "1.5px solid var(--clay-deep)" },
  matching: { background: "rgba(43,108,104,.14)", color: "var(--petrol)", border: "1.5px solid transparent" },
  speed: { background: "var(--gold)", color: "var(--ink)", border: "1.5px solid var(--gold)" },
  anagram: { background: "rgba(190,58,43,.14)", color: "var(--crimson)", border: "1.5px solid transparent" },
  "concept-map": { background: "var(--petrol)", color: "#FBF6EC", border: "1.5px solid var(--petrol)" },
  "fill-blank": { background: "rgba(229,165,44,.16)", color: "var(--gold)", border: "1.5px solid transparent" },
  "true-false": { background: "rgba(78,140,87,.14)", color: "var(--sage)", border: "1.5px solid transparent" },
};

export function LearningPath({
  nodes,
  onOpen,
}: {
  nodes: LearningNode[];
  onOpen: (node: LearningNode) => void;
}) {
  const ordered = [...nodes].sort((a, b) => a.order - b.order);
  const firstUnlockedIncomplete = ordered.find((n) => n.unlocked && !n.completed);

  return (
    <div className="flex flex-col">
      {ordered.map((node, i) => {
        const isCurrent = node.id === firstUnlockedIncomplete?.id && !node.completed;
        const isLocked = !node.unlocked;
        const isDone = node.completed;
        const isLast = i === ordered.length - 1;
        const rot = i % 2 === 0 ? "-1.4deg" : "1.1deg";
        const stamp = STAMP_STYLE[node.type];
        const cardBd = isCurrent ? "var(--clay)" : "var(--line)";
        const titleColor = isLocked ? "var(--muted)" : "var(--ink)";
        const lineColor = isDone ? "var(--sage)" : "var(--line)";
        const label = NODE_LABEL[node.type] ?? node.type;
        const stampStyle: React.CSSProperties = isLocked
          ? { ...stamp, opacity: 0.5 }
          : stamp;

        return (
          <div key={node.id} className="flex gap-[15px]">
            {/* Colonne gauche : rond + ligne */}
            <div className="flex w-[44px] flex-none flex-col items-center">
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onOpen(node)}
                aria-label={node.title}
                className={`flex h-[44px] w-[44px] items-center justify-center rounded-full border-[2.5px] ${isCurrent ? "animate-cb-pulse" : ""}`}
                style={{
                  background: isDone
                    ? "var(--sage)"
                    : isCurrent
                      ? "var(--clay)"
                      : "var(--surface)",
                  borderColor: isLocked ? "var(--line)" : "var(--ink)",
                  color: isLocked ? "var(--muted)" : "#fff",
                  cursor: isLocked ? "not-allowed" : "pointer",
                }}
              >
                {isDone ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : isCurrent ? (
                  <Play className="h-[19px] w-[19px] fill-current" />
                ) : (
                  <Lock className="h-[17px] w-[17px]" strokeWidth={2.2} />
                )}
              </button>
              {!isLast && (
                <div
                  className="my-[3px] min-h-[18px] w-[3px] flex-1 rounded-[2px]"
                  style={{ background: lineColor }}
                />
              )}
            </div>

            {/* Carte noeud */}
            <button
              type="button"
              disabled={isLocked}
              onClick={() => onOpen(node)}
              className="cb-card-line mb-[6px] flex-1 rounded-[7px_16px_16px_7px] p-[13px_15px] text-left"
              style={{
                borderColor: cardBd,
                opacity: isLocked ? 0.7 : 1,
                cursor: isLocked ? "not-allowed" : "pointer",
              }}
            >
              <div
                className="cb-mono mb-[7px] inline-block rounded-[5px] px-[7px] py-[2px] text-[9.5px] font-medium uppercase tracking-[1px]"
                style={{ ...stampStyle, transform: `rotate(${rot})` }}
              >
                {label}
              </div>
              <div
                className="font-heading text-[16px] font-bold leading-[1.15]"
                style={{ color: titleColor }}
              >
                {node.title}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}