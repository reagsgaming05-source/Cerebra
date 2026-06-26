"use client";

import { useMemo, useState } from "react";
import { BookOpen, Loader2, Search, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import type { Course } from "@/lib/types";
import { normalize } from "@/lib/search";
import { EmptyState } from "@/components/empty-state";

interface GlossaryProps {
  course: Course;
}

export function Glossary({ course }: GlossaryProps) {
  const [query, setQuery] = useState("");
  const [explaining, setExplaining] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const entries = useMemo(() => {
    const cards = course.flashcards ?? [];
    return cards.map((c) => ({
      id: c.id,
      term: c.front,
      definition: c.back,
    }));
  }, [course.flashcards]);

  const filtered = useMemo(() => {
    if (!query.trim()) return entries;
    const q = normalize(query);
    return entries.filter(
      (e) =>
        normalize(e.term).includes(q) ||
        normalize(e.definition).includes(q),
    );
  }, [entries, query]);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Aucun terme dans le glossaire"
        description="Génère d'abord les flashcards du cours pour remplir le glossaire automatiquement."
      />
    );
  }

  return (
    <div className="animate-cb-float space-y-4">
      {/* Search */}
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="flex h-11 items-center gap-2.5 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] px-3"
      >
        <Search className="h-[17px] w-[17px] text-[var(--muted-ink)]" strokeWidth={2.2} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un terme…"
          aria-label="Rechercher dans le glossaire"
          className="h-full flex-1 border-none bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--muted-ink)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Vider la recherche"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted-ink)] hover:text-[var(--ink)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {/* Count */}
      <p className="text-xs font-semibold text-[var(--muted-ink)]">
        {filtered.length} terme{filtered.length > 1 ? "s" : ""}
        {query && ` pour « ${query} »`}
      </p>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <p className="font-heading text-base font-bold">Aucun résultat</p>
          <p className="text-sm text-[var(--muted-ink)]">
            Aucun terme ne correspond à « {query} ».
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] p-[15px]"
            >
              <dt className="mb-1.5 font-heading text-[15px] font-bold text-[var(--clay)]">
                {entry.term}
              </dt>
              <dd className="m-0 text-[14px] leading-[1.55] text-[var(--ink-2)]">
                {entry.definition}
              </dd>
              <button
                type="button"
                onClick={async () => {
                  if (explaining === entry.term) {
                    setExplaining(null);
                    setExplanation(null);
                    return;
                  }
                  setExplaining(entry.term);
                  setExplanation(null);
                  const t = toast.loading(`Explication de « ${entry.term} »…`);
                  try {
                    const res = await fetch("/api/explain-concept", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        concept: entry.term,
                        slides: course.slides,
                        summary: course.summary,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setExplanation(data.explanation);
                    toast.success("Explication prête", { id: t });
                  } catch (e) {
                    toast.error("Échec", { description: (e as Error).message, id: t });
                    setExplaining(null);
                  }
                }}
                data-press
                className="cb-pill mt-2.5 flex items-center gap-1.5 px-2.5 py-1 text-[11.5px]"
              >
                {explaining === entry.term ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 text-[var(--clay)]" />
                )}
                {explaining === entry.term ? "Génération…" : "Expliquer ce concept"}
              </button>
              {explaining === entry.term && explanation && (
                <div className="mt-2.5 rounded-[12px] border-2 border-[var(--clay)] bg-[rgba(204,107,67,.08)] p-3 text-[13px] leading-[1.5] text-[var(--ink)]">
                  {explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
