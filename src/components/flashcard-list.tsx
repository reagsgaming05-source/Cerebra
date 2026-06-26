"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Course, Flashcard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function FlashcardRow({
  card,
  onSave,
  onDelete,
}: {
  card: Flashcard;
  onSave: (front: string, back: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);

  if (editing) {
    const disabled = front.trim().length === 0 || back.trim().length === 0;
    return (
      <div className="space-y-2 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] p-3">
        <div className="cb-mono text-[9.5px] font-medium uppercase tracking-[2px] text-[var(--clay)]">
          Recto
        </div>
        <Input
          value={front}
          onChange={(e) => setFront(e.target.value)}
          aria-label="Recto de la carte"
          className="h-10 rounded-[10px] border-2 border-[var(--line)] bg-[var(--surface-2)]"
        />
        <div className="cb-mono text-[9.5px] font-medium uppercase tracking-[2px] text-[var(--sage)]">
          Verso
        </div>
        <Textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          aria-label="Verso de la carte"
          className="min-h-16 rounded-[10px] border-2 border-[var(--line)] bg-[var(--surface-2)]"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFront(card.front);
              setBack(card.back);
              setEditing(false);
            }}
          >
            Annuler
          </Button>
          <button
            onClick={() => {
              onSave(front.trim(), back.trim());
              setEditing(false);
            }}
            disabled={disabled}
            data-press
            className="rounded-[10px] border-2 border-[var(--ink)] bg-[var(--sage)] px-3 py-1.5 font-heading text-sm font-bold text-white disabled:opacity-60"
          >
            Enregistrer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] p-3">
      <div className="min-w-0 flex-1 space-y-0.5 text-sm">
        <p className="truncate font-heading font-bold text-[var(--ink)]">{card.front}</p>
        <p className="truncate text-[var(--muted-ink)]">{card.back}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Éditer la carte"
          className="h-8 w-8 text-[var(--muted-ink)] hover:text-[var(--clay)]"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                aria-label="Supprimer la carte"
                className="h-8 w-8 text-[var(--muted-ink)] hover:text-[var(--crimson)]"
              />
            }
          >
            <Trash2 className="h-4 w-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette carte ?</AlertDialogTitle>
              <AlertDialogDescription>
                « {card.front} » sera retirée définitivement du deck.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson)]/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function FlashcardList({
  course,
  updateCourse,
}: {
  course: Course;
  updateCourse: (patch: Partial<Course>) => void;
}) {
  const [open, setOpen] = useState(false);
  const cards = course.flashcards ?? [];

  if (cards.length === 0) return null;

  function saveCard(id: string, front: string, back: string) {
    updateCourse({
      flashcards: cards.map((c) => (c.id === id ? { ...c, front, back } : c)),
    });
    toast.success("Carte modifiée");
  }

  function deleteCard(id: string) {
    updateCourse({ flashcards: cards.filter((c) => c.id !== id) });
    toast.success("Carte supprimée");
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        data-press
        className="cb-pill flex items-center gap-1.5 py-1.5 px-3 text-[13px]"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Voir mes {cards.length} carte{cards.length > 1 ? "s" : ""}
      </button>
      {open && (
        <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
          {cards.map((card) => (
            <FlashcardRow
              key={card.id}
              card={card}
              onSave={(front, back) => saveCard(card.id, front, back)}
              onDelete={() => deleteCard(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}