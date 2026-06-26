"use client";

import { BarChart3, BookMarked, Layers, ListChecks, Map } from "lucide-react";

type TabId = "path" | "summary" | "flashcards" | "quiz" | "glossary" | "stats";

const ITEMS: { id: TabId; label: string; icon: typeof Map }[] = [
  { id: "path", label: "Parcours", icon: Map },
  { id: "summary", label: "Résumé", icon: Layers },
  { id: "flashcards", label: "Cartes", icon: Layers },
  { id: "quiz", label: "Quiz", icon: ListChecks },
  { id: "glossary", label: "Glossaire", icon: BookMarked },
  { id: "stats", label: "Stats", icon: BarChart3 },
];

/**
 * Barre de navigation mobile fixe en bas, 5 onglets.
 * Reflète l'onglet actif (couleur clay). Cachée sur sm+.
 */
export function BottomNav({
  active,
  onTabChange,
}: {
  active: TabId;
  onTabChange: (t: TabId) => void;
}) {
  return (
    <nav
      aria-label="Navigation des onglets du cours"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[var(--line)] bg-[var(--surface)] sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch px-1">
        {ITEMS.map((it) => {
          const isActive = active === it.id;
          const Icon = it.icon;
          return (
            <li key={it.id} className="flex-1">
              <button
                onClick={() => onTabChange(it.id)}
                aria-current={isActive ? "page" : undefined}
                data-press
                className="flex min-h-[52px] w-full flex-col items-center gap-[3px] py-[7px]"
                style={{ color: isActive ? "var(--clay)" : "var(--muted)" }}
              >
                <Icon className="h-[21px] w-[21px]" />
                <span className="text-[10.5px] font-bold">{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}