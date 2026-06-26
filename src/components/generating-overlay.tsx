"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

interface Props {
  /** vrai pendant la génération ; le panneau reste visible un court instant après. */
  open: boolean;
  label: string;
  /** étapes affichées tour à tour sous le titre. */
  steps?: string[];
}

const DEFAULT_STEPS = [
  "Analyse des slides",
  "Repérage des thèmes",
  "Rédaction de l'introduction",
  "Structuration des sections",
  "Extraction des points clés",
];

/**
 * Petit panneau flottant (bas d'écran) qui montre une progression animée
 * pendant une génération IA. La requête API étant monobloc (pas de vrai %),
 * la barre avance en douceur vers ~92% puis fait un flash à 100% à la fin.
 */
export function GeneratingOverlay({ open, label, steps = DEFAULT_STEPS }: Props) {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const wasOpenRef = useRef(false);

  // Ouverture : on affiche et on remet à zéro.
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      setVisible(true);
      setProgress(6);
      setStepIdx(0);
    }
  }, [open]);

  // Moteur de progression tant que `open` est vrai.
  useEffect(() => {
    if (!open) return;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / 9000); // plafond vers ~9s
      const eased = 92 * (1 - Math.pow(1 - t, 2.6));
      setProgress(eased);
      setStepIdx(Math.min(steps.length - 1, Math.floor((eased / 92) * steps.length)));
    }, 120);
    return () => clearInterval(id);
  }, [open, steps.length]);

  // Fermeture : flash à 100% puis masquage.
  useEffect(() => {
    if (open || !wasOpenRef.current) return;
    setProgress(100);
    setStepIdx(steps.length - 1);
    const id = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(id);
  }, [open, steps.length]);

  if (!visible) return null;

  const pct = Math.round(progress);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(18px,env(safe-area-inset-bottom))]"
      role="status"
      aria-live="polite"
    >
      <div className="animate-cb-sheet w-full max-w-sm rounded-[22px] border-[2.5px] border-[var(--ink)] bg-[var(--surface)] p-5 shadow-[6px_6px_0_var(--ink)]">
        <div className="flex items-center gap-3">
          <div className="animate-cb-pulse flex h-11 w-11 flex-none items-center justify-center rounded-[14px] border-2 border-[var(--ink)] bg-[var(--clay)] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate font-heading text-base font-bold leading-tight">{label}</p>
            <p className="m-0 truncate text-[12.5px] text-[var(--muted-ink)]">{steps[stepIdx]}…</p>
          </div>
          <span className="cb-mono tabular-nums text-sm font-bold text-[var(--clay)]">{pct}%</span>
        </div>

        <div className="mt-4 h-[11px] w-full overflow-hidden rounded-full border-2 border-[var(--ink)] bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--clay)] transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="cb-mono mt-3 text-center text-[10.5px] font-medium uppercase tracking-[2px] text-[var(--muted-ink)]">
          L&apos;IA rédige ton cours
        </p>
      </div>
    </div>
  );
}