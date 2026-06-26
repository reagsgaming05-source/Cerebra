"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Sparkles,
    title: "Transforme tes slides en parcours d'apprentissage",
    description:
      "Dépose un PowerPoint, Cerebra génère tout ce qu'il faut pour que tu maîtrises ton cours de 0 à 100%.",
  },
  {
    icon: BookOpen,
    title: "Trois outils, un seul upload",
    description:
      "Résumé structuré, flashcards, quiz et parcours gamifié, créés automatiquement par l'IA à partir de tes slides.",
  },
  {
    icon: GraduationCap,
    title: "Prêt à commencer ?",
    description:
      "Importe ton premier cours et lance-toi. Tu pourras tout réviser en quelques minutes.",
  },
] as const;

/** Écran d'onboarding plein écran, affiché au premier lancement uniquement. */
export function Onboarding({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const Current = STEPS[step].icon;

  return (
    <div
      role="dialog"
      aria-label="Bienvenue sur Cerebra"
      className="fixed inset-0 z-50 flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-end px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          aria-label="Passer l'introduction"
          className="min-h-11 text-muted-foreground"
        >
          Passer <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Current className="h-10 w-10" />
        </div>
        <h2 className="max-w-md text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          {STEPS[step].title}
        </h2>
        <p className="mt-3 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
          {STEPS[step].description}
        </p>
      </div>

      <div
        className="flex flex-col gap-4 px-6 pb-8"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
      >
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              aria-label={`Étape ${i + 1}`}
              onClick={() => setStep(i)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2"
            >
              <span
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="min-h-11"
            aria-label="Étape précédente"
          >
            <ArrowLeft className="h-4 w-4" /> Précédent
          </Button>

          {last ? (
            <Button onClick={onStart} size="lg" className="min-h-11 flex-1">
              Importer mon premier cours <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              size="lg"
              className="min-h-11 flex-1"
            >
              Suivant <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}