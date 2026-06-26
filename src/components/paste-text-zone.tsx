"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCourses, genId, buildNodes, recomputeProgress } from "@/lib/store";
import { parsePastedText } from "@/lib/paste-text";
import type { Course } from "@/lib/types";

const GENERIC_TITLES = /^Partie \d+$/;

function deriveTitle(title: string, slides: ReturnType<typeof parsePastedText>): string {
  const t = title.trim();
  if (t) return t;
  const first = slides[0]?.title?.trim();
  if (first && !GENERIC_TITLES.test(first)) return first;
  return "Nouveau cours";
}

export function PasteTextZone() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const router = useRouter();
  const { upsert } = useCourses();

  function createCourse() {
    const slides = parsePastedText(text);
    if (slides.length === 0) return;

    const nodes = buildNodes();
    const { progress, xp } = recomputeProgress(nodes);
    const course: Course = {
      id: genId("course"),
      title: deriveTitle(title, slides),
      createdAt: Date.now(),
      slides,
      quizRuns: 0,
      nodes,
      progress,
      xp,
    };
    upsert(course);
    toast.success("Cours créé", {
      description: `${slides.length} partie${slides.length > 1 ? "s" : ""} extraite${slides.length > 1 ? "s" : ""}.`,
    });
    router.push(`/course/${course.id}`);
  }

  if (!open) {
    return (
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-2 py-2 text-sm font-bold text-[var(--clay-deep)] underline underline-offset-[3px]"
        >
          Ou cole du texte
        </button>
      </div>
    );
  }

  const empty = text.trim().length === 0;
  const disabled = empty;

  return (
    <div className="mt-3 rounded-[18px] border-2 border-[var(--line)] bg-[var(--surface)] p-[15px] text-left">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre (optionnel)"
        aria-label="Titre du cours"
        className="mb-2 w-full rounded-[11px] border-2 border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="Colle tes notes ici…"
        rows={4}
        aria-label="Texte du cours"
        className="w-full resize-none rounded-[11px] border-2 bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none"
        style={{ borderColor: touched && empty ? "var(--crimson)" : "var(--line)" }}
      />
      {touched && empty && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--crimson)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          Colle au moins quelques lignes de notes.
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-none rounded-[12px] border-2 border-[var(--line)] bg-transparent px-4 py-2.5 text-sm font-bold text-[var(--muted-ink)]"
        >
          Fermer
        </button>
        <button
          type="button"
          data-press
          onClick={createCourse}
          disabled={disabled}
          className="flex-1 rounded-[12px] border-2 border-[var(--ink)] py-2.5 font-heading text-sm font-bold transition-colors disabled:opacity-100"
          style={{
            background: disabled ? "var(--surface-2)" : "var(--ink)",
            color: disabled ? "var(--muted)" : "var(--bg)",
          }}
        >
          Générer le cours
        </button>
      </div>
    </div>
  );
}