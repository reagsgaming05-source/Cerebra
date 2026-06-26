"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { genId } from "@/lib/store";
import type { Course, Flashcard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ManualFlashcardForm({
  course,
  updateCourse,
}: {
  course: Course;
  updateCourse: (patch: Partial<Course>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  function reset() {
    setFront("");
    setBack("");
    setOpen(false);
  }

  function addCard() {
    if (front.trim().length === 0 || back.trim().length === 0) return;
    const card: Flashcard = { id: genId("fc"), front: front.trim(), back: back.trim() };
    updateCourse({ flashcards: [...(course.flashcards ?? []), card] });
    toast.success("Carte ajoutée");
    reset();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        data-press
        className="cb-pill mb-4 flex items-center gap-1.5 py-1.5 px-3 text-[13px]"
      >
        <Plus className="h-4 w-4" /> Ajouter une carte
      </button>
    );
  }

  const disabled = front.trim().length === 0 || back.trim().length === 0;

  return (
    <div className="mb-4 space-y-3 rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="cb-mono text-[9.5px] font-medium uppercase tracking-[2px] text-[var(--clay)]">
        Recto
      </div>
      <Input
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="Question ou terme"
        aria-label="Recto de la carte"
        className="h-11 rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface-2)]"
      />
      <div className="cb-mono text-[9.5px] font-medium uppercase tracking-[2px] text-[var(--sage)]">
        Verso
      </div>
      <Textarea
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Réponse ou définition"
        aria-label="Verso de la carte"
        className="min-h-20 rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface-2)]"
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={reset}>
          Annuler
        </Button>
        <button
          onClick={addCard}
          disabled={disabled}
          data-press
          className="flex items-center gap-1.5 rounded-[12px] border-2 border-[var(--ink)] bg-[var(--sage)] px-4 py-2 font-heading text-sm font-bold text-white disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>
    </div>
  );
}