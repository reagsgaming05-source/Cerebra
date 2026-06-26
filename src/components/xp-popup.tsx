"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface XpPopup {
  id: number;
  xp: number;
  x: number;
  y: number;
}

let popupId = 0;
let addPopup: ((popup: XpPopup) => void) | null = null;

/**
 * Affiche une animation flottante "+X XP" à la position donnée.
 * Appelable depuis n'importe où (pattern singleton).
 */
export function showXpGain(xp: number, x: number, y: number) {
  addPopup?.({ id: ++popupId, xp, x, y });
}

export function XpPopups() {
  const [popups, setPopups] = useState<XpPopup[]>([]);

  useEffect(() => {
    addPopup = (popup: XpPopup) => {
      setPopups((prev) => [...prev, popup]);
      // Auto-retrait après l'animation
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== popup.id));
      }, 1400);
    };
    return () => { addPopup = null; };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {popups.map((p) => (
        <div
          key={p.id}
          className="absolute animate-cb-pop font-heading text-lg font-extrabold text-[var(--gold)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
          style={{
            left: p.x,
            top: p.y,
            animation: "xpFloat 1.2s ease-out forwards",
          }}
        >
          <style>{`@keyframes xpFloat{0%{opacity:1;transform:translateY(0) scale(1)}60%{opacity:1;transform:translateY(-40px) scale(1.2)}100%{opacity:0;transform:translateY(-70px) scale(0.8)}}`}</style>
          <Sparkles className="mr-1 inline h-4 w-4" strokeWidth={2.5} />
          +{p.xp} XP
        </div>
      ))}
    </div>
  );
}
