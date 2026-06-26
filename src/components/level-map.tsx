"use client";

import { Check, FileText, Layers, ListChecks, Lock, Network, Play, Shuffle, SpellCheck, TextCursorInput, Zap } from "lucide-react";
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

const STAMP_STYLE: Record<NodeType, React.CSSProperties> = {
  summary: { background: "var(--surface-2)", color: "var(--ink-2)" },
  flashcards: { background: "rgba(78,140,87,.16)", color: "var(--sage)" },
  quiz: { background: "var(--clay)", color: "#FBF6EC" },
  matching: { background: "rgba(43,108,104,.14)", color: "var(--petrol)" },
  speed: { background: "var(--gold)", color: "var(--ink)" },
  anagram: { background: "rgba(190,58,43,.14)", color: "var(--crimson)" },
  "concept-map": { background: "var(--petrol)", color: "#FBF6EC" },
  "fill-blank": { background: "rgba(229,165,44,.16)", color: "var(--gold)" },
  "true-false": { background: "rgba(78,140,87,.16)", color: "var(--sage)" },
};

/** Spline de Catmull-Rom → Bézier : trace une courbe lisse passant par tous les points. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/**
 * Carte de niveaux façon jeu mobile : un chemin sinueux (zigzag lissé) qui serpente
 * sur la carte, avec un point par niveau. Le tronçon déjà validé est coloré, le reste
 * est en pointillés. Le niveau courant pulse, les verrouillés sont grisés.
 */
export function LevelMap({
  nodes,
  onOpen,
}: {
  nodes: LearningNode[];
  onOpen: (node: LearningNode) => void;
}) {
  const ordered = [...nodes].sort((a, b) => a.order - b.order);
  const n = ordered.length;
  const currentId = ordered.find((x) => x.unlocked && !x.completed)?.id;

  // Géométrie de la carte (viewBox). Les positions en % sont dérivées de ces coords.
  const W = 300;
  const padX = 64;
  const topPad = 70;
  const bottomPad = 72;
  const yStep = n > 1 ? 116 : 0;
  const H = topPad + (n > 1 ? (n - 1) * yStep : 0) + bottomPad;

  const pts = ordered.map((node, i) => {
    const y = topPad + i * yStep;
    // sinusoïde lente : le chemin serpente de gauche à droite.
    const t = n > 1 ? (i / (n - 1)) * Math.PI * 2.1 : 0;
    const x = W / 2 + (W / 2 - padX) * Math.sin(t);
    return { node, x, y };
  });

  const allCoords = pts.map((p) => ({ x: p.x, y: p.y }));
  const completedCount = ordered.filter((x) => x.completed).length;
  const doneCoords = allCoords.slice(0, Math.max(1, completedCount));
  const fullD = smoothPath(allCoords);
  const doneD = completedCount > 0 ? smoothPath(doneCoords) : "";

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full h-auto"
        aria-hidden="true"
      >
        {/* Décor : halos derrière la carte */}
        <circle cx={W * 0.18} cy={topPad - 10} r={34} fill="rgba(204,107,67,.07)" />
        <circle cx={W * 0.84} cy={H * 0.55} r={46} fill="rgba(43,108,104,.07)" />
        <circle cx={W * 0.2} cy={H * 0.82} r={30} fill="rgba(229,165,44,.08)" />

        {/* Route de fond (chemin complet) */}
        <path
          d={fullD}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={22}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ligne pointillée sur la partie non encore validée */}
        <path
          d={fullD}
          fill="none"
          stroke="var(--line)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
        {/* Tronçon validé par-dessus, coloré */}
        {doneD && (
          <path
            d={doneD}
            fill="none"
            stroke="var(--sage)"
            strokeWidth={22}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Ligne centrale pointillée blanche sur le tronçon validé (effet route) */}
        {doneD && (
          <path
            d={doneD}
            fill="none"
            stroke="rgba(255,255,255,.55)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="2 10"
          />
        )}

        {/* Drapeau de départ */}
        <g transform={`translate(${allCoords[0].x}, ${topPad - 44})`}>
          <line x1="0" y1="0" x2="0" y2="26" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M0 2 L20 8 L0 16 Z" fill="var(--sage)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
        {/* Trophée d'arrivée */}
        <g transform={`translate(${allCoords[n - 1].x}, ${H - 40})`}>
          <path d="M-11 0 L11 0 L8 15 L-8 15 Z" fill="var(--gold)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="-4" y="15" width="8" height="4" fill="var(--gold)" stroke="var(--ink)" strokeWidth="1.5" />
          <rect x="-10" y="21" width="20" height="3" rx="1.5" fill="var(--ink)" />
        </g>
      </svg>

      {/* Boutons-niveaux en overlay HTML (positionnés en %) */}
      <div className="absolute inset-0">
        {pts.map((p, i) => {
          const node = p.node;
          const isLocked = !node.unlocked;
          const isDone = node.completed;
          const isCurrent = node.id === currentId && !isDone;
          const Icon = ICONS[node.type] ?? FileText;
          const stamp = STAMP_STYLE[node.type];
          const left = `${(p.x / W) * 100}%`;
          const top = `${(p.y / H) * 100}%`;

          return (
            <div
              key={node.id}
              className="absolute flex flex-col items-center"
              style={{ left, top, transform: "translate(-50%, -50%)" }}
            >
              {isCurrent && (
                <span
                  className="animate-cb-pulse absolute inset-[-6px] rounded-full"
                  style={{ boxShadow: "0 0 0 3px var(--clay)" }}
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                disabled={isLocked}
                onClick={() => !isLocked && onOpen(node)}
                aria-label={node.title}
                className="relative flex h-[56px] w-[56px] items-center justify-center rounded-full border-[3px] border-[var(--ink)] shadow-[3px_3px_0_var(--ink)]"
                style={{
                  background: isDone
                    ? "var(--sage)"
                    : isLocked
                      ? "var(--surface-2)"
                      : "var(--surface)",
                  color: isLocked ? "var(--muted)" : isDone ? "#fff" : "var(--ink)",
                  cursor: isLocked ? "not-allowed" : "pointer",
                }}
              >
                {isDone ? (
                  <Check className="h-7 w-7" strokeWidth={3} />
                ) : isLocked ? (
                  <Lock className="h-6 w-6" strokeWidth={2.2} />
                ) : isCurrent ? (
                  <Play className="h-6 w-6 fill-current" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
                {/* Numéro de niveau */}
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--bg)] font-heading text-[11px] font-extrabold text-[var(--ink)]"
                >
                  {i + 1}
                </span>
              </button>

              {/* Stamp libellé */}
              <span
                className="cb-mono mt-2 rounded-[5px] px-[7px] py-[2px] text-[9px] font-medium uppercase tracking-[1px]"
                style={{
                  ...stamp,
                  opacity: isLocked ? 0.55 : 1,
                  transform: `rotate(${i % 2 === 0 ? "-2deg" : "2deg"})`,
                }}
              >
                {NODE_LABEL[node.type] ?? node.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}