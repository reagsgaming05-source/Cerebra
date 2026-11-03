"use client";

/* eslint-disable react-hooks/set-state-in-effect --
   Les effets de ce fichier font de la synchro d'état délibérée :
   - figer le snapshot des cartes une fois le chargement terminé (Flashcards),
   - réinitialiser l'état du mot courant quand `idx` change (Mélange-mots),
   - initialiser `loading` depuis `course.flashcards`.
   Refactorer chaque cas en état dérivé/remontage par `key` toucherait 5 composants
   de jeu avec un risque réel de régression. La règle est donc désactivée pour ce
   fichier, les patterns sont intentionnels et maîtrisés. */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Layers,
  Lightbulb,
  Loader2,
  RotateCcw,
  Sparkles,
  SpellCheck,
  TextCursorInput,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Course, Difficulty, Flashcard, LearningNode, QuizQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { EmptyState } from "@/components/empty-state";
import { GeneratingOverlay } from "@/components/generating-overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { haptic } from "@/lib/haptics";
import { normalize } from "@/lib/search";
import { dueCards, reviewCard } from "@/lib/srs";
import { cn, courseAccent } from "@/lib/utils";
import { buildFillBlankItems, FILL_BLANK_MAX, FILL_BLANK_MIN } from "@/lib/fill-blank";

interface ActProps {
  course: Course;
  node: LearningNode;
  updateCourse: (patch: Partial<Course>) => void;
  onComplete: (score: number) => void;
}

/* ----------------------------- Résumé ----------------------------- */

export function SummaryActivity({ course, updateCourse, onComplete }: ActProps) {
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<"paragraph" | "bullets" | "table">("paragraph");
  const [transformLoading, setTransformLoading] = useState<string | null>(null);
  const [transformResult, setTransformResult] = useState<string | null>(null);
  const accent = courseAccent(course.id).hex;

  if (course.slides.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Aucune slide à résumer"
        description="Le cours ne contient pas de texte exploitable. Réimporte un PowerPoint avec du contenu."
      />
    );
  }

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: course.slides }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateCourse({ summary: data.summary });
      toast.success("Résumé prêt");
    } catch (e) {
      toast.error("Échec", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  if (!course.summary) {
    return (
      <>
      <div className="animate-cb-float flex flex-col items-center gap-5 py-10 text-center">
        <div
          className="flex h-[84px] w-[84px] items-center justify-center rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--clay)] text-white shadow-[5px_5px_0_var(--ink)]"
          data-press
        >
          <Sparkles className="h-10 w-10" />
        </div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">Résumé du cours</h2>
        <p className="max-w-sm text-[15px] leading-relaxed text-[var(--muted-ink)]">
          Génère un résumé structuré et les points clés de ton cours à partir
          des {course.slides.length} slides.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          data-press
          className="cb-btn-primary px-8 py-[15px] text-base disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          Générer le résumé
        </button>
      </div>
      <GeneratingOverlay open={loading} label="Génération du résumé" />
      </>
    );
  }

  return (
    <>
    <div className="animate-cb-float flex flex-col gap-[14px]">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {([
            { key: "paragraph" as const, label: "Paragraphe" },
            { key: "bullets" as const, label: "Points clés" },
            { key: "table" as const, label: "Tableau" },
          ]).map((s) => (
            <button
              key={s.key}
              onClick={() => setStyle(s.key)}
              data-press
              data-active={style === s.key}
              className="cb-pill px-2.5 py-1 text-[11.5px]"
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          data-press
          className="cb-pill flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-60"
          title="Regénérer le résumé"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" />
          )}
          Regénérer
        </button>
      </div>

      {/* Transformations IA du résumé */}
      {course.summary && (
        <div className="flex flex-wrap gap-1.5">
          {[
            { action: "simplify", label: "Simplifier", icon: "📖" },
            { action: "deepen", label: "Approfondir", icon: "🔬" },
            { action: "examples", label: "Exemples", icon: "💡" },
            { action: "translate", label: "EN", icon: "🌐" },
          ].map((t) => (
            <button
              key={t.action}
              onClick={async () => {
                setTransformLoading(t.action);
                setTransformResult(null);
                try {
                  const res = await fetch("/api/transform-summary", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: t.action, summary: course.summary, targetLang: "en" }),
                  });
                  const data = await res.json();
                  if (res.ok) setTransformResult(data.result);
                  else throw new Error(data.error);
                } catch (e) {
                  toast.error("Échec", { description: (e as Error).message });
                } finally { setTransformLoading(null); }
              }}
              disabled={transformLoading !== null}
              data-press
              className="cb-pill flex items-center gap-1 px-2.5 py-1 text-[11px] disabled:opacity-50"
            >
              {transformLoading === t.action ? <Loader2 className="h-3 w-3 animate-spin" /> : t.icon}
              {t.label}
            </button>
          ))}
        </div>
      )}
      {transformResult && (
        <div className="rounded-[16px] border-2 border-[var(--clay)] bg-[rgba(204,107,67,.08)] p-[15px] text-[14px] leading-[1.55] text-[var(--ink)]">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="cb-mono text-[9px] font-bold uppercase tracking-[1px] text-[var(--clay)]">Résultat</span>
            <button onClick={() => setTransformResult(null)} className="text-[var(--muted-ink)]"><X className="h-3.5 w-3.5" /></button>
          </div>
          <p className="m-0 whitespace-pre-wrap">{transformResult}</p>
        </div>
      )}

      {style === "paragraph" && (
        <>
          {course.summary.intro && (
            <div className="rounded-[18px] border-2 border-[var(--line)] bg-[var(--surface)] p-[17px]">
              <p className="m-0 text-[15.5px] leading-[1.6] text-[var(--ink)]">
                {course.summary.intro}
              </p>
            </div>
          )}

          {course.summary.sections.map((s, i) => (
            <div
              key={i}
              className="rounded-[18px] border-2 border-[var(--line)] border-l-[6px] bg-[var(--surface)] p-[17px]"
              style={{ borderLeftColor: accent }}
            >
              <h3 className="m-0 mb-1.5 font-heading text-base font-bold">{s.heading}</h3>
              <p className="m-0 text-[14.5px] leading-[1.55] text-[var(--ink-2)]">{s.content}</p>
            </div>
          ))}

          {course.summary.keyPoints.length > 0 && (
            <div className="rounded-[18px] bg-[var(--ink)] p-[18px] text-[var(--bg)]">
              <h3 className="m-0 mb-3 flex items-center gap-[7px] font-heading text-base font-bold">
                <Lightbulb className="h-[17px] w-[17px] text-[var(--gold)]" /> Points clés
              </h3>
              <div className="flex flex-col gap-[9px]">
                {course.summary.keyPoints.map((k, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-[9px] text-[14.5px] leading-[1.4]"
                  >
                    <span className="font-extrabold text-[var(--gold)]">→</span>
                    <span>{k}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {style === "bullets" && (
        <div className="rounded-[18px] bg-[var(--ink)] p-[20px] text-[var(--bg)]">
          <h3 className="m-0 mb-4 flex items-center gap-[7px] font-heading text-lg font-bold">
            <Lightbulb className="h-[18px] w-[18px] text-[var(--gold)]" /> Points clés du cours
          </h3>
          <div className="flex flex-col gap-[10px]">
            {course.summary.keyPoints.map((k, i) => (
              <div key={i} className="flex items-start gap-[10px] text-[15px] leading-[1.45]">
                <span className="mt-[3px] flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-[var(--clay)] text-[11px] font-extrabold text-white">
                  {i + 1}
                </span>
                <span>{k}</span>
              </div>
            ))}
          </div>
          {course.summary.sections.length > 0 && (
            <div className="mt-5 border-t border-[rgba(255,255,255,.12)] pt-4">
              <h4 className="m-0 mb-3 font-heading text-sm font-bold text-[var(--muted)]">Sections</h4>
              <div className="flex flex-col gap-[7px]">
                {course.summary.sections.map((s, i) => (
                  <div key={i} className="flex items-start gap-[8px] text-[14px] leading-[1.4]">
                    <span className="font-extrabold text-[var(--gold)]">→</span>
                    <span><strong>{s.heading}</strong> : {s.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {style === "table" && (
        <div className="overflow-hidden rounded-[18px] border-2 border-[var(--line)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[var(--ink)] text-[var(--bg)]">
                <th className="p-[14px] font-heading text-sm font-bold">Concept</th>
                <th className="p-[14px] font-heading text-sm font-bold">Explication</th>
              </tr>
            </thead>
            <tbody>
              {course.summary.sections.map((s, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-[var(--surface)]" : "bg-[var(--surface-2)]"}
                >
                  <td className="p-[14px] text-[14px] font-bold text-[var(--ink)] align-top">
                    {s.heading}
                  </td>
                  <td className="p-[14px] text-[14px] leading-[1.5] text-[var(--ink-2)] align-top">
                    {s.content}
                  </td>
                </tr>
              ))}
              {course.summary.keyPoints.length > 0 && (
                <tr>
                  <td className="p-[14px] text-[14px] font-bold text-[var(--clay)] align-top">
                    Points clés
                  </td>
                  <td className="p-[14px] text-[14px] leading-[1.5] text-[var(--ink-2)] align-top">
                    <ul className="m-0 list-disc pl-4 space-y-1">
                      {course.summary.keyPoints.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={() => onComplete(100)}
        data-press
        className="cb-btn-primary mt-1 w-full py-[14px] text-[15px]"
      >
        <Check className="h-4 w-4" /> J&apos;ai lu, marquer comme terminé
      </button>
    </div>
    <GeneratingOverlay open={loading} label="Régénération du résumé" />
    </>
  );
}

/* --------------------------- Flashcards --------------------------- */

export function FlashcardActivity({ course, updateCourse, onComplete }: ActProps) {
  const [loading, setLoading] = useState(!course.flashcards);
  const [mode, setMode] = useState<"flip" | "type">("flip");
  const [dueOnly, setDueOnly] = useState(false);
  const [deck, setDeck] = useState<Flashcard[]>(() => course.flashcards ?? []);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [seen, setSeen] = useState(0);
  const [done, setDone] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typedResult, setTypedResult] = useState<"correct" | "incorrect" | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [grading, setGrading] = useState(false);
  const [typedFeedback, setTypedFeedback] = useState("");

  function resetProgress() {
    setIdx(0);
    setFlipped(false);
    setKnown(0);
    setSeen(0);
    setDone(false);
    setTypedAnswer("");
    setTypedResult(null);
    setTypedFeedback("");
  }

  function switchMode(next: "flip" | "type") {
    setMode(next);
    resetProgress();
  }

  function toggleDueOnly() {
    const next = !dueOnly;
    setDueOnly(next);
    setDeck(next ? dueCards(course.flashcards ?? []) : course.flashcards ?? []);
    resetProgress();
  }

  // Snapshot figé une fois les cartes disponibles : la session ne doit pas se
  // raccourcir sous les pieds de l'utilisateur quand reviewCard() met à jour les
  // dueDate des cartes déjà répondues pendant un parcours "cartes dues uniquement".
  useEffect(() => {
    if (!loading) setDeck(course.flashcards ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (course.flashcards) {
      setLoading(false);
      return;
    }
    (async () => {
      const t = toast.loading("Génération des flashcards…");
      try {
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: course.slides, summary: course.summary }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        updateCourse({ flashcards: data.flashcards });
        toast.success(`${data.flashcards.length} cartes prêtes`, { id: t });
      } catch (e) {
        toast.error("Échec", { description: (e as Error).message, id: t });
      } finally {
        setLoading(false);
      }
    })();
  }, [course.flashcards, course.slides, course.summary, updateCourse]);

  // Régénère les cartes IA depuis le résumé (les cartes ajoutées à la main,
  // dont l'id ne commence pas par "fc_ai_", sont préservées).
  async function regenerate() {
    setRegenerating(true);
    const t = toast.loading("Régénération des cartes depuis le résumé…");
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: course.slides, summary: course.summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const manual = (course.flashcards ?? []).filter(
        (c) => !c.id.startsWith("fc_ai_"),
      );
      const fresh = (data.flashcards as Flashcard[]) ?? [];
      updateCourse({ flashcards: [...manual, ...fresh] });
      resetProgress();
      toast.success(`${fresh.length} nouvelles cartes IA prêtes`, { id: t });
    } catch (e) {
      toast.error("Échec", { description: (e as Error).message, id: t });
    } finally {
      setRegenerating(false);
    }
  }

  const allCards = course.flashcards ?? [];
  const due = dueCards(allCards);

  function answer(knew: boolean) {
    const current = deck[idx];
    const updatedCard = reviewCard(current, knew);
    updateCourse({
      flashcards: allCards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    });

    const nextSeen = seen + 1;
    const nextKnown = known + (knew ? 1 : 0);
    setSeen(nextSeen);
    setKnown(nextKnown);
    haptic(knew ? "success" : "error");
    if (idx + 1 >= deck.length) {
      setDone(true);
      onComplete(Math.round((nextKnown / deck.length) * 100));
    } else {
      setIdx(idx + 1);
      setFlipped(false);
    }
  }

  if (loading || (deck.length === 0 && allCards.length > 0)) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-[230px] w-full rounded-[22px]" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <p className="text-center text-xs text-[var(--muted-ink)]">
          Génération des flashcards…
        </p>
      </div>
    );
  }

  if (allCards.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="Aucune carte générée"
        description="L'IA n'a pas pu extraire de flashcards de ce cours. Essaie de régénérer le résumé d'abord."
      />
    );
  }

  if (done) {
    return (
      <div className="animate-cb-pop flex flex-col items-center gap-2 px-4 py-8 text-center">
        <div className="mx-auto mb-[18px] flex h-[90px] w-[90px] items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--sage)] text-white shadow-[5px_5px_0_var(--ink)]">
          <Check className="h-[46px] w-[46px]" strokeWidth={2.6} />
        </div>
        <h2 className="m-0 mb-1.5 font-heading text-2xl font-extrabold">Session terminée !</h2>
        <p className="m-0 mb-[22px] text-[15px] text-[var(--muted-ink)]">
          Tu connais {known} carte{known > 1 ? "s" : ""} sur {deck.length}.
        </p>
        <button
          onClick={resetProgress}
          data-press
          className="cb-btn-primary px-7 py-[14px] text-[15px]"
          style={{ boxShadow: "4px 4px 0 var(--clay)" }}
        >
          <RotateCcw className="h-4 w-4" /> Recommencer
        </button>
      </div>
    );
  }

  const card = deck[idx];

  async function submitTyped() {
    if (typedAnswer.trim().length === 0 || typedResult || grading) return;
    // Chemin rapide : réponse exacte (normalisée) → correction instantanée, sans IA.
    if (normalize(typedAnswer) === normalize(card.back)) {
      setTypedResult("correct");
      setTypedFeedback("Réponse exacte.");
      haptic("success");
      return;
    }
    // Sinon : correction sémantique par l'IA (synonymes/paraphrases acceptés).
    setGrading(true);
    try {
      const res = await fetch("/api/grade-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expected: card.back, given: typedAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const ok = !!data.correct;
      setTypedResult(ok ? "correct" : "incorrect");
      setTypedFeedback(typeof data.feedback === "string" ? data.feedback : "");
      haptic(ok ? "success" : "error");
    } catch {
      setTypedResult("incorrect");
      setTypedFeedback(`Réponse attendue : ${card.back}`);
      haptic("error");
    } finally {
      setGrading(false);
    }
  }

  function nextTyped() {
    const correct = typedResult === "correct";
    setTypedAnswer("");
    setTypedResult(null);
    setTypedFeedback("");
    answer(correct);
  }

  return (
    <div className="animate-cb-float space-y-[14px]">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => switchMode("flip")}
          data-press
          data-active={mode === "flip"}
          className="cb-pill flex-1 py-2 text-[13.5px]"
        >
          Flip
        </button>
        <button
          onClick={() => switchMode("type")}
          data-press
          data-active={mode === "type"}
          className="cb-pill flex-1 py-2 text-[13.5px]"
        >
          Tape la réponse
        </button>
      </div>

      <button
        onClick={regenerate}
        disabled={regenerating}
        data-press
        className="flex w-full items-center justify-center gap-1.5 rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface)] py-2 text-[12.5px] font-bold text-[var(--muted-ink)] disabled:opacity-50"
      >
        <Sparkles className="h-3.5 w-3.5 text-[var(--clay)]" />
        {regenerating ? "Régénération…" : "Regénérer les cartes IA depuis le résumé"}
      </button>

      {due.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-[14px] border-2 border-[var(--line)] bg-[rgba(229,165,44,.10)] px-3 py-2 text-xs">
          <span className="font-semibold text-[var(--clay-deep)]">
            {due.length} carte{due.length > 1 ? "s" : ""} à réviser aujourd&apos;hui
          </span>
          <button
            onClick={toggleDueOnly}
            data-press
            className="font-bold text-[var(--clay)] underline-offset-2 hover:underline"
          >
            {dueOnly ? "Voir toutes" : "Réviser"}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-[13px] font-bold text-[var(--muted-ink)]">
        <span>
          Carte {idx + 1} / {deck.length}
        </span>
        <span className="text-[var(--sage)]">{known} connues</span>
      </div>

      {mode === "flip" ? (
        <>
          <button
            onClick={() => setFlipped((f) => !f)}
            key={`card-${idx}-${flipped ? "b" : "f"}`}
            data-press
            className="animate-cb-pop flex min-h-[230px] w-full flex-col items-center justify-center rounded-[22px] border-[2.5px] border-[var(--ink)] bg-[var(--surface)] p-7 text-center shadow-[5px_5px_0_var(--ink)]"
          >
            {flipped ? (
              <div>
                <div className="cb-mono mb-[14px] text-[9.5px] font-medium uppercase tracking-[2px] text-[var(--sage)]">
                  Verso
                </div>
                <p className="m-0 text-[18px] leading-[1.45] text-[var(--ink)]">{card.back}</p>
              </div>
            ) : (
              <div>
                <div className="cb-mono mb-[14px] text-[9.5px] font-medium uppercase tracking-[2px] text-[var(--clay)]">
                  Recto
                </div>
                <div className="font-heading text-[25px] font-bold leading-[1.2] text-[var(--ink)]">
                  {card.front}
                </div>
                <div className="mt-5 text-[13px] text-[var(--muted-ink)]">Touche pour révéler</div>
              </div>
            )}
          </button>

          {flipped ? (
            <div className="flex gap-[11px]">
              <button
                onClick={() => answer(false)}
                data-press
                className="flex-1 border-[2.5px] border-[var(--ink)] bg-[var(--surface)] py-[15px] font-heading text-[15px] font-bold text-[var(--ink)] rounded-[15px]"
              >
                À revoir
              </button>
              <button
                onClick={() => answer(true)}
                data-press
                className="flex-1 border-[2.5px] border-[var(--ink)] bg-[var(--sage)] py-[15px] font-heading text-[15px] font-bold text-white rounded-[15px] shadow-[3px_3px_0_var(--ink)]"
              >
                Je savais
              </button>
            </div>
          ) : (
            <button
              onClick={() => setFlipped(true)}
              data-press
              className="cb-btn-primary w-full py-[14px] text-[15px]"
            >
              Révéler la réponse <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </>
      ) : (
        <>
          <div className="flex min-h-[180px] w-full flex-col items-center justify-center gap-4 rounded-[22px] border-[2.5px] border-[var(--ink)] bg-[var(--surface)] p-7 text-center shadow-[5px_5px_0_var(--ink)]">
            <div className="cb-mono text-[9.5px] font-medium uppercase tracking-[2px] text-[var(--clay)]">
              Recto
            </div>
            <p className="m-0 font-heading text-[22px] font-bold leading-[1.2] text-balance text-[var(--ink)]">
              {card.front}
            </p>
            {typedResult && (
              <p
                className={cn(
                  "text-sm font-semibold",
                  typedResult === "correct" ? "text-[var(--sage)]" : "text-[var(--crimson)]",
                )}
              >
                {typedFeedback ||
                  (typedResult === "correct"
                    ? "Correct !"
                    : `Réponse attendue : ${card.back}`)}
              </p>
            )}
            {grading && (
              <p className="text-sm font-semibold text-[var(--muted-ink)]">
                Correction en cours…
              </p>
            )}
          </div>
          <Input
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            disabled={!!typedResult || grading}
            placeholder="Tape ta réponse…"
            aria-label="Ta réponse"
            className="h-12 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] text-[15px]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (typedResult) nextTyped();
                else submitTyped();
              }
            }}
          />
          {typedResult ? (
            <button
              onClick={nextTyped}
              data-press
              className="cb-btn-primary w-full py-[14px] text-[15px]"
            >
              {idx + 1 >= deck.length ? "Terminer" : "Carte suivante"} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submitTyped}
              disabled={typedAnswer.trim().length === 0 || grading}
              data-press
              className="cb-btn-primary w-full py-[14px] text-[15px] disabled:opacity-60"
            >
              {grading ? "Correction…" : "Valider"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------- Quiz ----------------------------- */

const TIMER_OPTIONS = [
  { value: 15, label: "15s" },
  { value: 20, label: "20s" },
  { value: 30, label: "30s" },
  { value: 45, label: "45s" },
  { value: 0, label: "Sans limite" },
] as const;
const DEFAULT_TIMER = 20;

const GLOBAL_TIMER_OPTIONS = [
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
  { value: 180, label: "3 min" },
  { value: 300, label: "5 min" },
  { value: 0, label: "Sans limite" },
] as const;
const DEFAULT_GLOBAL_TIMER = 120;

const SPEED_MODES = [
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
  { value: 90, label: "90s" },
] as const;
const DEFAULT_SPEED = 30;

const MATCHING_LEVELS = [
  { value: 4, label: "Facile" },
  { value: 6, label: "Moyen" },
  { value: 8, label: "Difficile" },
] as const;
const DEFAULT_PAIRS = 6;

export function QuizActivity({ course, updateCourse, onComplete, node }: ActProps) {
  const forced = node.order >= 5 ? "hard" : undefined;
  const [count, setCount] = useState(5);
  // Adaptation auto de la difficulté selon la perf passée
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    if (forced) return forced;
    const prevBest = Math.max(
      0,
      ...course.nodes.filter((n) => n.type === "quiz").map((n) => n.bestScore),
    );
    if (prevBest >= 80) return "hard";
    if (prevBest > 0 && prevBest < 50) return "easy";
    return "medium";
  });
  const [timerMode, setTimerMode] = useState<"per-question" | "global">("per-question");
  const [examMode, setExamMode] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  const answered = selected !== null;
  const hasTimer = timerSeconds > 0;

  // Timer per-question
  useEffect(() => {
    if (timerMode !== "per-question" || !questions || finished || answered || !hasTimer) return;
    if (timeLeft <= 0) {
      setSelected(-1);
      setAnswers((a) => { const next = [...a]; next[qi] = -1; return next; });
      haptic("error");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [questions, finished, answered, timeLeft, qi, hasTimer, timerMode]);

  // Timer global
  useEffect(() => {
    if (timerMode !== "global" || !questions || finished || !hasTimer) return;
    if (timeLeft <= 0) {
      setFinished(true);
      const score = Math.round((correct / (questions?.length ?? 1)) * 100);
      onComplete(score);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [questions, finished, timeLeft, hasTimer, timerMode, correct, onComplete]);

  // Raccourcis clavier : 1-4 pour les options, Entrée pour suivant
  useEffect(() => {
    if (!questions || finished) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "4" && !answered) {
        const idx = parseInt(e.key) - 1;
        const opt = document.querySelector(`[data-opt-idx="${idx}"]`);
        if (opt instanceof HTMLButtonElement) opt.click();
      }
      if (e.key === "Enter" && answered) {
        const nextBtn = document.querySelector('[data-next-btn]');
        if (nextBtn instanceof HTMLButtonElement) nextBtn.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [questions, finished, answered]);

  async function generate() {
    setTimeLeft(timerSeconds);
    // Cours du catalogue : questions rédigées à la main, tirées au hasard
    // (ordre des questions et des réponses mélangé à chaque partie).
    if (course.quizBank && course.quizBank.length > 0) {
      const picked = shuffle(course.quizBank)
        .slice(0, Math.min(count, course.quizBank.length))
        .map((q) => {
          const order = shuffle(q.options.map((_, i) => i));
          return {
            ...q,
            options: order.map((i) => q.options[i]),
            answerIndex: order.indexOf(q.answerIndex),
          };
        });
      setQuestions(picked);
      updateCourse({ quizRuns: course.quizRuns + 1 });
      return;
    }
    setLoading(true);
    const t = toast.loading("Génération du quiz…");
    try {
      const body: Record<string, unknown> = {
        config: { count, difficulty },
      };
      // Priorité slides ; fallback flashcards si pas de slides
      if (course.slides.length > 0) {
        body.slides = course.slides;
        body.summary = course.summary;
      } else if (course.flashcards && course.flashcards.length >= 3) {
        body.flashcards = course.flashcards;
      }
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      updateCourse({ quizRuns: course.quizRuns + 1 });
      toast.success(`${data.questions.length} questions prêtes`, { id: t });
    } catch (e) {
      toast.error("Échec", { description: (e as Error).message, id: t });
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (qi + 1 >= (questions?.length ?? 0)) {
      setFinished(true);
      const score = Math.round((correct / (questions?.length ?? 1)) * 100);
      onComplete(score);
    } else {
      setQi(qi + 1);
      setSelected(null);
      if (hasTimer && timerMode === "per-question") setTimeLeft(timerSeconds);
    }
  }

  if (!questions) {
    return (
      <div className="animate-cb-float space-y-6 py-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-heading text-sm font-bold">Nombre de questions</Label>
            <span className="cb-mono font-semibold text-[var(--clay)]">{count}</span>
          </div>
          <Slider
            value={[count]}
            min={3}
            max={
              course.quizBank?.length
                ? Math.max(3, course.quizBank.length)
                : Math.min(15, Math.max(3, course.slides.length))
            }
            step={1}
            onValueChange={(v) => setCount(Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-heading text-sm font-bold">Difficulté</Label>
          <RadioGroup
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}
            className="grid grid-cols-3 gap-2"
            disabled={!!forced}
          >
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <div
                key={d}
                className="flex items-center gap-2 rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface)] p-2.5 has-[:checked]:border-[var(--ink)] has-[:checked]:bg-[var(--surface-2)]"
              >
                <RadioGroupItem value={d} id={`d-${d}`} />
                <Label htmlFor={`d-${d}`} className="cursor-pointer text-sm font-semibold capitalize">
                  {d === "easy" ? "Facile" : d === "medium" ? "Moyen" : "Difficile"}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {forced && (
            <p className="text-xs text-[var(--muted-ink)]">Difficulté verrouillée sur Difficile.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="font-heading text-sm font-bold">Mode chrono</Label>
          <div className="flex gap-1.5">
            <button type="button" data-press data-active={timerMode === "per-question"} onClick={() => { setTimerMode("per-question"); setTimerSeconds(DEFAULT_TIMER); }} className="cb-pill flex-1 py-2 text-[12.5px]">Par question</button>
            <button type="button" data-press data-active={timerMode === "global"} onClick={() => { setTimerMode("global"); setTimerSeconds(DEFAULT_GLOBAL_TIMER); }} className="cb-pill flex-1 py-2 text-[12.5px]">Global</button>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5">
          <div>
            <div className="text-[13px] font-semibold">Mode examen blanc</div>
            <div className="text-[11px] text-[var(--muted-ink)]">Pas de feedback jusqu'à la fin</div>
          </div>
          <button role="switch" aria-checked={examMode} onClick={() => setExamMode((v) => !v)} className="relative h-6 w-[40px] shrink-0 rounded-full transition-colors" style={{ background: examMode ? "var(--crimson)" : "var(--surface-2)" }}>
            <span className="absolute top-0.5 h-5 w-5 rounded-full bg-[#FBF6EC] shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-all" style={{ left: examMode ? "17px" : "2px" }} />
          </button>
        </div>
        <div className="space-y-2">
          <Label className="font-heading text-sm font-bold">{timerMode === "global" ? "Temps total" : "Temps par question"}</Label>
          <div className="flex gap-1.5">
            {(timerMode === "global" ? GLOBAL_TIMER_OPTIONS : TIMER_OPTIONS).map((opt) => (
              <button
                key={opt.value}
                type="button"
                data-press
                data-active={timerSeconds === opt.value}
                onClick={() => setTimerSeconds(opt.value)}
                className="cb-pill flex-1 py-2 text-[12.5px]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          data-press
          className="cb-btn-primary w-full py-[14px] text-[15px] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Générer le quiz
        </button>
      </div>
    );
  }

  if (questions && questions.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Aucune question générée"
        description="L'IA n'a pas pu créer de quiz avec ce contenu. Essaie avec un autre cours ou régénère le résumé."
        action={
          <Button variant="outline" onClick={() => setQuestions(null)}>
            <RotateCcw className="h-4 w-4" /> Refaire un quiz
          </Button>
        }
      />
    );
  }

  if (finished) {
    const score = Math.round((correct / questions.length) * 100);
    const scoreTitle = score >= 80 ? "Excellent !" : score >= 50 ? "Bien joué !" : "Continue !";
    const misses = questions
      .map((q, i) => ({ q, i, selected: answers[i] }))
      .filter((m) => m.selected !== m.q.answerIndex);
    return (
      <div className="animate-cb-pop relative space-y-5 py-4 text-center">
        <style>{`@keyframes cbConfettiFall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(120px) rotate(40deg);opacity:0}}`}</style>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute left-[14%] top-0 h-[9px] w-[9px] rounded-[2px] bg-[var(--clay)]" style={{ animation: "cbConfettiFall 1.3s ease-in .0s infinite" }} />
          <span className="absolute left-[32%] top-0 h-2 w-2 rounded-full bg-[var(--gold)]" style={{ animation: "cbConfettiFall 1.5s ease-in .2s infinite" }} />
          <span className="absolute left-[52%] top-0 h-[10px] w-[10px] rounded-[2px] bg-[var(--sage)]" style={{ animation: "cbConfettiFall 1.2s ease-in .35s infinite" }} />
          <span className="absolute left-[70%] top-0 h-2 w-2 rounded-full bg-[var(--petrol)]" style={{ animation: "cbConfettiFall 1.6s ease-in .15s infinite" }} />
          <span className="absolute left-[86%] top-0 h-[9px] w-[9px] rounded-[2px] bg-[var(--clay-deep)]" style={{ animation: "cbConfettiFall 1.4s ease-in .45s infinite" }} />
        </div>
        <div className="relative mx-auto mb-[18px] flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--gold)] text-[var(--ink)] shadow-[5px_5px_0_var(--ink)]">
          <span className="font-heading text-[30px] font-extrabold">{score}%</span>
        </div>
        <h2 className="relative m-0 mb-1.5 font-heading text-[25px] font-extrabold">{scoreTitle}</h2>
        <p className="relative m-0 mb-5 text-[15px] text-[var(--muted-ink)]">
          {correct} bonne(s) réponse(s) sur {questions.length}.
        </p>

        <div className="relative flex flex-col items-center gap-3">
          {misses.length > 0 && (
            <button
              onClick={() => setShowReview((s) => !s)}
              data-press
              className="w-full rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] py-3 text-[14.5px] font-bold text-[var(--ink)]"
            >
              {showReview ? "Masquer mes erreurs" : `Voir mes erreurs (${misses.length})`}
            </button>
          )}
          {showReview && (
            <div className="flex w-full flex-col gap-[11px] text-left">
              {misses.map((m) => (
                <div
                  key={m.i}
                  className="rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] p-[14px]"
                >
                  <p className="m-0 mb-[9px] font-heading text-[14.5px] font-bold leading-[1.35]">
                    {m.q.question}
                  </p>
                  <div className="mb-[3px] text-[13.5px] text-[var(--crimson)]">
                    ✗ Ta réponse : {m.selected != null ? m.q.options[m.selected] : "—"}
                  </div>
                  <div className="text-[13.5px] font-semibold text-[var(--sage)]">
                    ✓ Bonne réponse : {m.q.options[m.q.answerIndex]}
                  </div>
                  {m.q.explanation && (
                    <p className="mt-2 text-[13px] leading-[1.5] text-[var(--muted-ink)]">
                      {m.q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => {
              setQuestions(null);
              setQi(0);
              setSelected(null);
              setCorrect(0);
              setFinished(false);
              setAnswers([]);
              setShowReview(false);
              setTimeLeft(timerSeconds);
            }}
            data-press
            className="cb-btn-primary w-full py-[14px] text-base"
          >
            <RotateCcw className="h-4 w-4" /> Nouveau quiz
          </button>
        </div>
      </div>
    );
  }

  const q = questions[qi];
  const isCorrect = answered && selected === q.answerIndex;
  return (
    <div className="animate-cb-float space-y-[18px]">
      <div className="flex items-center gap-[11px]">
        <Progress
          value={((qi + (answered ? 1 : 0)) / questions.length) * 100}
          className="h-[9px] flex-1 bg-[var(--surface-2)] [&>div]:bg-[var(--clay)]"
        />
        {hasTimer && (
          <span
            className={cn(
              "cb-mono flex items-center gap-1 text-xs font-bold",
              timeLeft <= 5 ? "text-[var(--crimson)]" : "text-[var(--muted-ink)]",
            )}
            title={timerMode === "global" ? "Temps restant total" : "Temps restant pour cette question"}
          >
            <Timer className="h-3.5 w-3.5" /> {timeLeft}s
            {timerMode === "global" && <span className="text-[9px] font-normal opacity-60">total</span>}
          </span>
        )}
        <span className="cb-mono text-xs font-medium tracking-[.5px] text-[var(--muted-ink)]">
          {qi + 1}/{questions.length}
        </span>
      </div>
      <h2 className="m-0 font-heading text-[21px] font-bold leading-[1.25] text-[var(--ink)]">
        {q.question}
      </h2>
      <div className="flex flex-col gap-[11px]">
        {q.options.map((opt, i) => {
          const isAnsCorrect = i === q.answerIndex;
          const isPicked = i === selected;
          let cls = "border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]";
          let badgeBg = "var(--surface-2)";
          let badgeFg = "var(--muted)";
          if (answered) {
            if (isAnsCorrect) {
              cls = "border-2 border-[var(--sage)] bg-[rgba(78,140,87,.14)] text-[var(--ink)]";
              badgeBg = "var(--sage)";
              badgeFg = "#fff";
            } else if (isPicked) {
              cls = "border-2 border-[var(--crimson)] bg-[rgba(190,58,43,.12)] text-[var(--ink)]";
              badgeBg = "var(--crimson)";
              badgeFg = "#fff";
            } else {
              cls = "border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--muted-ink)]";
            }
          }
          return (
            <button
              key={i}
              disabled={answered}
              data-press
              data-opt-idx={i}
              onClick={() => {
                setSelected(i);
                setAnswers((a) => {
                  const next = [...a];
                  next[qi] = i;
                  return next;
                });
                if (isAnsCorrect) { setCorrect((c) => c + 1); haptic("success"); } else { haptic("error"); }
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-[15px] p-[15px] text-left text-[15px] font-semibold break-words transition-colors",
                !answered && "hover:border-[var(--clay)]",
                cls,
              )}
            >
              <span
                className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[8px] text-[13px] font-extrabold"
                style={{ background: badgeBg, color: badgeFg }}
              >
                {["A", "B", "C", "D"][i]}
              </span>
              <span className="flex-1">{opt}</span>
              {answered && isAnsCorrect && <Check className="h-4 w-4 shrink-0" />}
              {answered && isPicked && !isAnsCorrect && <X className="h-4 w-4 shrink-0" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <>
          {!examMode && (
            <div
              className="animate-cb-pop rounded-[16px] border-2 p-[15px]"
              style={{
                background: isCorrect ? "rgba(78,140,87,.12)" : "rgba(190,58,43,.10)",
                borderColor: isCorrect ? "var(--sage)" : "var(--crimson)",
              }}
            >
              <div
                className="mb-[5px] font-heading text-base font-extrabold"
                style={{ color: isCorrect ? "var(--sage)" : "var(--crimson)" }}
              >
                {isCorrect ? "Correct !" : "Pas tout à fait"}
              </div>
              {q.explanation && (
                <p className="m-0 text-[14px] leading-[1.5] text-[var(--ink)]">{q.explanation}</p>
              )}
            </div>
          )}
          <button
            onClick={next}
            data-press
            data-next-btn
            className="cb-btn-primary w-full py-[15px] text-base"
          >
            {qi + 1 >= questions.length ? "Voir mon score" : "Question suivante"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

/* ----------------------------- Matching --------------------------- */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchingActivity({ course, updateCourse, onComplete }: ActProps) {
  const [loading, setLoading] = useState(!course.flashcards);
  const [pairCount, setPairCount] = useState(DEFAULT_PAIRS);
  const [started, setStarted] = useState(false);
  const [pickedTerm, setPickedTerm] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [shake, setShake] = useState(0);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (course.flashcards) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: course.slides, summary: course.summary }),
        });
        const data = await res.json();
        if (res.ok) updateCourse({ flashcards: data.flashcards });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [course.flashcards, course.slides, course.summary, updateCourse]);

  const pairs = useMemo(() => {
    const src = (course.flashcards ?? []).slice(0, pairCount);
    return src.map((c, i) => ({ idx: i, term: c.front, def: c.back }));
  }, [course.flashcards, pairCount]);

  const terms = useMemo(() => shuffle(pairs.map((p) => ({ id: p.idx, text: p.term }))), [pairs]);
  const defs = useMemo(() => shuffle(pairs.map((p) => ({ id: p.idx, text: p.def }))), [pairs]);

  function pickDef(defId: number) {
    if (pickedTerm === null) return;
    setTries((t) => t + 1);
    if (pickedTerm === defId) {
      const next = [...matched, defId];
      setMatched(next);
      setPickedTerm(null);
      haptic("success");
      if (next.length === pairs.length) {
        const totalTries = tries + 1;
        const score = Math.round((pairs.length / totalTries) * 100);
        onComplete(Math.min(100, Math.max(40, score)));
      }
    } else {
      // Mauvaise paire : on garde le terme et la définition affichés en rouge
      // + secoués ~700ms pour que l'erreur soit bien visible, puis on efface.
      setWrong([pickedTerm, defId]);
      setShake((x) => x + 1);
      haptic("error");
      setPickedTerm(null);
      setTimeout(() => setWrong(null), 700);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="mx-auto h-4 w-48" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[14px]" />
            ))}
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[14px]" />
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-[var(--muted-ink)]">Préparation des cartes…</p>
      </div>
    );
  }
  if (!started) {
    const available = (course.flashcards ?? []).length;
    const maxPairs = Math.min(8, available);
    return (
      <div className="animate-cb-float flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-[84px] w-[84px] items-center justify-center rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--sage)] text-white shadow-[5px_5px_0_var(--ink)]">
          <Layers className="h-10 w-10" />
        </div>
        <h2 className="font-heading text-2xl font-extrabold">Association</h2>
        <p className="max-w-sm text-[15px] leading-relaxed text-[var(--muted-ink)]">
          Relie chaque terme à sa définition. Choisis ton niveau de difficulté.
        </p>
        <div className="flex gap-1.5">
          {MATCHING_LEVELS.map((lvl) => {
            const disabled = lvl.value > available;
            return (
              <button
                key={lvl.value}
                type="button"
                data-press
                disabled={disabled}
                data-active={pairCount === lvl.value}
                onClick={() => setPairCount(lvl.value)}
                className="cb-pill px-4 py-2 text-[13.5px] disabled:opacity-40"
                title={disabled ? `Nécessite ${lvl.value} flashcards (${available} disponibles)` : undefined}
              >
                {lvl.label} ({lvl.value})
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setStarted(true)}
          disabled={available < 3}
          data-press
          className="cb-btn-primary px-8 py-[15px] text-base disabled:opacity-50"
        >
          <Layers className="h-4 w-4" /> Commencer
        </button>
        {available < 3 && (
          <p className="text-xs text-[var(--muted-ink)]">
            Il faut au moins 3 flashcards pour ce jeu. Génère d&apos;abord les cartes.
          </p>
        )}
      </div>
    );
  }

  if (pairs.length < 3) {
    return (
      <EmptyState
        icon={Layers}
        title="Pas assez de cartes"
        description="Il faut au moins 3 flashcards pour ce jeu. Génère d'abord les cartes de ce cours."
      />
    );
  }

  return (
    <div className="animate-cb-float space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[var(--muted-ink)]">
          Sélectionne un terme puis sa définition.
        </p>
        <button
          onClick={() => { setStarted(false); setPickedTerm(null); setMatched([]); setWrong(null); setTries(0); }}
          data-press
          className="cb-pill px-2.5 py-1 text-[11.5px]"
        >
          Changer
        </button>
      </div>
      {/* Desktop: two columns */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="cb-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--muted-ink)] px-1">Termes</p>
          {terms.map((t) => {
            const isMatched = matched.includes(t.id);
            const isPicked = pickedTerm === t.id;
            const isWrongTerm = wrong?.[0] === t.id;
            return (
              <button
                key={`${t.id}-${isWrongTerm ? shake : 0}`}
                disabled={isMatched}
                data-press
                onClick={() => setPickedTerm(t.id)}
                className={cn(
                  "min-h-11 w-full rounded-[14px] border-2 p-3 text-left text-sm break-words transition-colors",
                  isMatched && "border-[var(--sage)] bg-[rgba(78,140,87,.14)] opacity-60",
                  isPicked && "border-[var(--clay)] bg-[rgba(204,107,67,.12)] ring-2 ring-[var(--clay)]",
                  isWrongTerm && "animate-cb-shake border-[var(--crimson)] bg-[rgba(190,58,43,.14)] text-[var(--crimson)]",
                  !isMatched && !isPicked && !isWrongTerm && "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--clay)]",
                )}
              >
                {t.text}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="cb-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--muted-ink)] px-1">Définitions</p>
          {defs.map((d) => {
            const isMatched = matched.includes(d.id);
            const isWrong = wrong?.[1] === d.id;
            return (
              <button
                key={`${d.id}-${isWrong ? shake : 0}`}
                disabled={isMatched}
                data-press
                onClick={() => pickDef(d.id)}
                className={cn(
                  "min-h-11 w-full rounded-[14px] border-2 p-3 text-left text-sm break-words transition-colors",
                  isMatched && "border-[var(--sage)] bg-[rgba(78,140,87,.14)] opacity-60",
                  isWrong && "animate-cb-shake border-[var(--crimson)] bg-[rgba(190,58,43,.14)] text-[var(--crimson)]",
                  !isMatched && !isWrong && "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--clay)]",
                )}
              >
                {d.text}
              </button>
            );
          })}
        </div>
      </div>
      {/* Mobile: single column with two sections */}
      <div className="flex flex-col gap-4 sm:hidden">
        <div className="space-y-2">
          <p className="cb-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--muted-ink)] px-1">Termes — tape pour sélectionner</p>
          {terms.map((t) => {
            const isMatched = matched.includes(t.id);
            const isPicked = pickedTerm === t.id;
            const isWrongTerm = wrong?.[0] === t.id;
            return (
              <button
                key={`m-${t.id}-${isWrongTerm ? shake : 0}`}
                disabled={isMatched}
                data-press
                onClick={() => setPickedTerm(t.id)}
                className={cn(
                  "min-h-11 w-full rounded-[14px] border-2 p-3 text-left text-sm break-words transition-colors",
                  isMatched && "border-[var(--sage)] bg-[rgba(78,140,87,.14)] opacity-60",
                  isPicked && "border-[var(--clay)] bg-[rgba(204,107,67,.12)] ring-2 ring-[var(--clay)]",
                  isWrongTerm && "animate-cb-shake border-[var(--crimson)] bg-[rgba(190,58,43,.14)] text-[var(--crimson)]",
                  !isMatched && !isPicked && !isWrongTerm && "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--clay)]",
                )}
              >
                {t.text}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="cb-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--muted-ink)] px-1">Définitions — tape pour associer</p>
          {defs.map((d) => {
            const isMatched = matched.includes(d.id);
            const isWrong = wrong?.[1] === d.id;
            return (
              <button
                key={`m-${d.id}-${isWrong ? shake : 0}`}
                disabled={isMatched || pickedTerm === null}
                data-press
                onClick={() => pickDef(d.id)}
                className={cn(
                  "min-h-11 w-full rounded-[14px] border-2 p-3 text-left text-sm break-words transition-colors",
                  isMatched && "border-[var(--sage)] bg-[rgba(78,140,87,.14)] opacity-60",
                  isWrong && "animate-cb-shake border-[var(--crimson)] bg-[rgba(190,58,43,.14)] text-[var(--crimson)]",
                  !isMatched && !isWrong && pickedTerm === null && "border-[var(--line)] bg-[var(--surface)] opacity-50",
                  !isMatched && !isWrong && pickedTerm !== null && "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--clay)]",
                )}
              >
                {d.text}
              </button>
            );
          })}
        </div>
      </div>
      {wrong && (
        <p className="animate-cb-pop text-center text-[14px] font-bold text-[var(--crimson)]">
          Mauvaise paire, réessaie !
        </p>
      )}
      <div className="text-center text-xs font-semibold text-[var(--muted-ink)]">
        {matched.length} / {pairs.length} associés
      </div>
    </div>
  );
}

/* ------------------------------ Speed ----------------------------- */

export function SpeedActivity({ course, updateCourse, onComplete }: ActProps) {
  const [loading, setLoading] = useState(!course.flashcards);
  const [speedMode, setSpeedMode] = useState(DEFAULT_SPEED);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(speedMode);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (course.flashcards) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: course.slides, summary: course.summary }),
        });
        const data = await res.json();
        if (res.ok) updateCourse({ flashcards: data.flashcards });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [course.flashcards, course.slides, course.summary, updateCourse]);

  const cards = course.flashcards ?? [];

  useEffect(() => {
    if (!started || done) return;
    if (time <= 0) {
      setDone(true);
      const score = Math.min(100, Math.round((count / Math.max(cards.length, 1)) * 100));
      onComplete(score);
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, time, done, count, cards.length, onComplete]);

  function knew() {
    setCount((c) => c + 1);
    setFlipped(false);
    setIdx((i) => (i + 1) % Math.max(cards.length, 1));
    haptic("light");
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-[22px]" />
        <Skeleton className="h-12 w-full" />
        <p className="text-center text-xs text-[var(--muted-ink)]">Préparation…</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="animate-cb-float flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-[84px] w-[84px] items-center justify-center rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--gold)] text-[var(--ink)] shadow-[5px_5px_0_var(--ink)]">
          <Timer className="h-10 w-10" />
        </div>
        <h2 className="font-heading text-2xl font-extrabold">Défi vitesse</h2>
        <p className="max-w-sm text-[15px] leading-relaxed text-[var(--muted-ink)]">
          Révise un maximum de cartes avant la fin du chrono. Sois rapide !
        </p>
        <div className="flex gap-1.5">
          {SPEED_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              data-press
              data-active={speedMode === m.value}
              onClick={() => { setSpeedMode(m.value); setTime(m.value); }}
              className="cb-pill px-4 py-2 text-[13.5px]"
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setTime(speedMode); setStarted(true); }}
          data-press
          className="cb-btn-primary px-8 py-[15px] text-base"
        >
          <Timer className="h-4 w-4" /> Démarrer le défi
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="animate-cb-pop flex flex-col items-center gap-2 py-8 text-center">
        <div className="mx-auto mb-[18px] flex h-[90px] w-[90px] items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--gold)] text-[var(--ink)] shadow-[5px_5px_0_var(--ink)]">
          <span className="font-heading text-[30px] font-extrabold">{count}</span>
        </div>
        <h2 className="m-0 mb-1.5 font-heading text-2xl font-extrabold">Temps écoulé !</h2>
        <p className="m-0 mb-[22px] text-[15px] text-[var(--muted-ink)]">cartes révisées en {speedMode}s</p>
        <button
          onClick={() => { setStarted(false); setCount(0); setTime(speedMode); setDone(false); setIdx(0); setFlipped(false); }}
          data-press
          className="cb-btn-primary px-7 py-[14px] text-[15px]"
          style={{ boxShadow: "4px 4px 0 var(--clay)" }}
        >
          <RotateCcw className="h-4 w-4" /> Rejouer
        </button>
      </div>
    );
  }

  const card = cards[idx];
  return (
    <div className="animate-cb-float space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--muted-ink)]">Cartes : {count}</span>
        <span
          className={cn(
            "flex items-center gap-1 font-heading text-lg font-extrabold",
            time <= 5 ? "text-[var(--crimson)]" : "text-[var(--gold)]",
          )}
        >
          <Timer className="h-4 w-4" /> {time}s
        </span>
      </div>
      <button
        onClick={() => setFlipped((f) => !f)}
        key={`speed-${idx}-${flipped ? "b" : "f"}`}
        data-press
        className="animate-cb-pop flex min-h-[200px] w-full items-center justify-center rounded-[22px] border-[2.5px] border-[var(--ink)] bg-[var(--surface)] p-6 text-center shadow-[5px_5px_0_var(--ink)]"
      >
        <p className="m-0 font-heading text-lg font-bold leading-[1.25] text-balance text-[var(--ink)]">
          {flipped ? card?.back : card?.front}
        </p>
      </button>
      {flipped ? (
        <button
          onClick={knew}
          data-press
          className="w-full border-[2.5px] border-[var(--ink)] bg-[var(--sage)] py-[15px] font-heading text-[15px] font-bold text-white rounded-[15px] shadow-[3px_3px_0_var(--ink)]"
        >
          <Check className="h-4 w-4" /> Suivante
        </button>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          data-press
          className="cb-btn-primary w-full py-[14px] text-[15px]"
        >
          Révéler
        </button>
      )}
    </div>
  );
}

/* -------------------------- Mélange-mots -------------------------- */

const ANAGRAM_SECONDS = 32;
const ANAGRAM_MAX = 8;

interface Tile {
  id: string;
  ch: string;
}

function isLetter(ch: string): boolean {
  return /[A-Za-zÀ-ÿ]/.test(ch);
}

/** Cartes exploitables pour le jeu : terme court, sans ponctuation, ≥ 3 lettres. */
function usableAnagramCards(cards: Flashcard[]): Flashcard[] {
  return cards.filter((c) => {
    const t = c.front.trim();
    if (t.length < 3 || t.length > 22) return false;
    if (/[?!:;.,]/.test(t)) return false;
    return t.split("").filter(isLetter).length >= 3;
  });
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function AnagramActivity({ course, updateCourse, onComplete }: ActProps) {
  const [loading, setLoading] = useState(!course.flashcards);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState<Tile[]>([]);
  const [slots, setSlots] = useState<(Tile | null)[]>([]);
  const [locked, setLocked] = useState<boolean[]>([]);
  const [status, setStatus] = useState<"play" | "correct" | "wrong" | "timeout" | "done">("play");
  const [timeLeft, setTimeLeft] = useState(ANAGRAM_SECONDS);
  const [score, setScore] = useState(0); // 0..total (demi-points possibles avec indice)
  const [hintCount, setHintCount] = useState(0);
  const [shake, setShake] = useState(0);
  const doneRef = useRef(false);

  const total = deck.length;

  // Charge les flashcards si manquantes (comme matching/speed).
  useEffect(() => {
    if (course.flashcards) {
      setDeck(shuffleArr(usableAnagramCards(course.flashcards)).slice(0, ANAGRAM_MAX));
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: course.slides, summary: course.summary }),
        });
        const data = await res.json();
        if (res.ok) {
          updateCourse({ flashcards: data.flashcards });
          setDeck(shuffleArr(usableAnagramCards(data.flashcards)).slice(0, ANAGRAM_MAX));
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [course.flashcards, course.slides, course.summary, updateCourse]);

  // Construit le mot courant quand idx/deck changent.
  useEffect(() => {
    const card = deck[idx];
    if (!card) return;
    const letters = card.front.trim().split("").filter(isLetter);
    let scr = shuffleArr(letters);
    let guard = 0;
    while (scr.join("") === letters.join("") && letters.length > 1 && guard < 25) {
      scr = shuffleArr(letters);
      guard++;
    }
    setPool(scr.map((ch, i) => ({ id: `t${idx}_${i}`, ch })));
    setSlots(Array(letters.length).fill(null));
    setLocked(Array(letters.length).fill(false));
    setStatus("play");
    setTimeLeft(ANAGRAM_SECONDS);
    setHintCount(0);
  }, [idx, deck]);

  // Vérification auto quand tous les slots lettres sont remplis.
  useEffect(() => {
    if (status !== "play" || total === 0 || slots.length === 0) return;
    if (!slots.every((s) => s !== null)) return;
    const target = deck[idx].front.trim().split("").filter(isLetter).join("");
    const built = slots.map((s) => s!.ch).join("");
    if (built === target) {
      setStatus("correct");
      haptic("success");
      setScore((s) => s + (hintCount > 0 ? 0.5 : 1));
    } else {
      // On garde le mot faux visible (rouge + secoué). L'effacement des tuiles
      // non verrouillées est différé dans l'effet back-to-play pour que le
      // joueur voie bien son erreur avant de réessayer.
      setStatus("wrong");
      setShake((x) => x + 1);
      haptic("error");
    }
  }, [slots, status, total, deck, idx, hintCount, locked]);

  // Revenir à "play" après une erreur : on laisse le mot faux affiché ~750ms
  // (rangée rouge + secouée), puis on rend les tuiles non verrouillées au pool.
  useEffect(() => {
    if (status !== "wrong") return;
    const t = setTimeout(() => {
      const toReturn = slots.filter((_, i) => !locked[i]) as Tile[];
      if (toReturn.length > 0) setPool((prev) => [...prev, ...toReturn]);
      setSlots((prev) => prev.map((s, i) => (locked[i] ? s : null)));
      setStatus("play");
    }, 750);
    return () => clearTimeout(t);
  }, [status, slots, locked]);

  // Mot suivant après succès.
  useEffect(() => {
    if (status !== "correct") return;
    const t = setTimeout(() => {
      if (idx + 1 >= total) setStatus("done");
      else setIdx((i) => i + 1);
    }, 1100);
    return () => clearTimeout(t);
  }, [status, idx, total]);

  // Compte à rebours du mot courant.
  useEffect(() => {
    if (status !== "play") return;
    if (timeLeft <= 0) {
      setStatus("timeout");
      haptic("error");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [status, timeLeft]);

  // Mot suivant après timeout.
  useEffect(() => {
    if (status !== "timeout") return;
    const t = setTimeout(() => {
      if (idx + 1 >= total) setStatus("done");
      else setIdx((i) => i + 1);
    }, 1900);
    return () => clearTimeout(t);
  }, [status, idx, total]);

  // Fin : remonte le score au parcours (une seule fois).
  useEffect(() => {
    if (status === "done" && !doneRef.current) {
      doneRef.current = true;
      onComplete(total > 0 ? Math.round((score / total) * 100) : 0);
    }
  }, [status, score, total, onComplete]);

  function placeTile(tile: Tile) {
    if (status !== "play") return;
    const firstEmpty = slots.findIndex((s) => s === null);
    if (firstEmpty === -1) return;
    setSlots((prev) => {
      const next = [...prev];
      next[firstEmpty] = tile;
      return next;
    });
    setPool((prev) => prev.filter((p) => p.id !== tile.id));
  }

  function removeSlot(i: number) {
    if (status !== "play" || locked[i]) return;
    const tile = slots[i];
    if (!tile) return;
    setSlots((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
    setPool((prev) => [...prev, tile]);
  }

  function useHint() {
    if (status !== "play") return;
    const letters = deck[idx].front.trim().split("").filter(isLetter);
    const firstEmpty = slots.findIndex((s) => s === null);
    if (firstEmpty === -1) return;
    const need = letters[firstEmpty];
    const tileIdx = pool.findIndex((p) => p.ch === need);
    if (tileIdx === -1) return;
    const tile = pool[tileIdx];
    setSlots((prev) => {
      const next = [...prev];
      next[firstEmpty] = tile;
      return next;
    });
    setLocked((prev) => {
      const next = [...prev];
      next[firstEmpty] = true;
      return next;
    });
    setPool((prev) => prev.filter((p) => p.id !== tile.id));
    setHintCount((c) => c + 1);
    haptic("light");
  }

  function restart() {
    doneRef.current = false;
    setDeck(shuffleArr(usableAnagramCards(course.flashcards ?? deck)).slice(0, ANAGRAM_MAX));
    setIdx(0);
    setScore(0);
    setStatus("play");
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-[90px] w-full rounded-[18px]" />
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-11 w-11 rounded-[12px]" />
          ))}
        </div>
        <Skeleton className="mx-auto h-11 w-40 rounded-[14px]" />
        <p className="text-center text-xs text-[var(--muted-ink)]">Préparation du Mélange-mots…</p>
      </div>
    );
  }

  if (total < 3) {
    return (
      <EmptyState
        icon={SpellCheck}
        title="Pas assez de termes"
        description="Il faut au moins 3 flashcards avec un terme court pour jouer. Génère d'abord les cartes de ce cours."
      />
    );
  }

  if (status === "done") {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const title = pct >= 80 ? "Vocabulaire maîtrisé !" : pct >= 50 ? "Bien joué !" : "Continue !";
    return (
      <div className="animate-cb-pop flex flex-col items-center gap-2 px-4 py-8 text-center">
        <div className="mx-auto mb-[18px] flex h-[90px] w-[90px] items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--crimson)] text-white shadow-[5px_5px_0_var(--ink)]">
          <span className="font-heading text-[30px] font-extrabold">{pct}%</span>
        </div>
        <h2 className="m-0 mb-1.5 font-heading text-2xl font-extrabold">{title}</h2>
        <p className="m-0 mb-[22px] text-[15px] text-[var(--muted-ink)]">
          {Math.round(score)} terme{Math.round(score) > 1 ? "s" : ""} sur {total} reconstitués.
        </p>
        <button
          onClick={restart}
          data-press
          className="cb-btn-primary px-7 py-[14px] text-[15px]"
          style={{ boxShadow: "4px 4px 0 var(--crimson)" }}
        >
          <RotateCcw className="h-4 w-4" /> Rejouer
        </button>
      </div>
    );
  }

  const card = deck[idx];
  const term = card?.front.trim() ?? "";
  // Layout : lettres (slots) + séparateurs fixes (espaces, apostrophes, tirets).
  let slotPtr = 0;
  const layout: { kind: "letter" | "sep"; ch?: string; slot?: number }[] = [];
  for (const ch of term) {
    if (isLetter(ch)) {
      layout.push({ kind: "letter", slot: slotPtr });
      slotPtr++;
    } else {
      layout.push({ kind: "sep", ch });
    }
  }

  const livePct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="animate-cb-float space-y-[14px]">
      {/* En-tête : progression + chrono + score */}
      <div className="flex items-center justify-between text-[13px] font-bold text-[var(--muted-ink)]">
        <span>
          Mot {idx + 1} / {total}
        </span>
        <span className={cn("flex items-center gap-1", timeLeft <= 6 ? "text-[var(--crimson)]" : "text-[var(--gold)]")}>
          <Timer className="h-4 w-4" /> {timeLeft}s
        </span>
        <span className="text-[var(--sage)]">{livePct}%</span>
      </div>

      {/* Indice : la définition */}
      <div
        key={`def-${idx}`}
        className="rounded-[18px] border-[2.5px] border-[var(--ink)] bg-[var(--surface)] p-4 shadow-[4px_4px_0_var(--ink)]"
      >
        <div className="cb-mono mb-2 flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[1.5px] text-[var(--crimson)]">
          <SpellCheck className="h-3.5 w-3.5" /> Définition
        </div>
        <p className="m-0 text-[15.5px] leading-[1.45] text-[var(--ink)]">{card?.back}</p>
      </div>

      {/* Réponse en construction */}
      <div
        key={`shake-${shake}`}
        className={cn(
          "relative flex flex-wrap items-center justify-center gap-[6px] rounded-[18px] border-2 p-4 min-h-[68px] transition-colors",
          status === "wrong"
            ? "animate-cb-shake border-[var(--crimson)] bg-[rgba(190,58,43,.10)]"
            : "border-[var(--line)] bg-[var(--bg)]",
        )}
      >
        {status === "wrong" && (
          <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--crimson)] text-white shadow-[2px_2px_0_var(--ink)] animate-cb-pop">
            <X className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
        {layout.map((cell, i) =>
          cell.kind === "sep" ? (
            <span key={`sep-${i}`} className="px-1 text-[22px] font-extrabold text-[var(--ink)]">
              {cell.ch === " " ? "" : cell.ch}
            </span>
          ) : (
            <button
              key={`slot-${cell.slot}`}
              type="button"
              onClick={() => removeSlot(cell.slot!)}
              disabled={locked[cell.slot!] || status !== "play"}
              data-press
              className={cn(
                "flex h-[44px] w-[40px] items-center justify-center rounded-[11px] border-[2.5px] font-heading text-[20px] font-extrabold uppercase transition-colors",
                locked[cell.slot!]
                  ? "border-[var(--sage)] bg-[rgba(78,140,87,.14)] text-[var(--sage)]"
                  : slots[cell.slot!]
                    ? status === "wrong"
                      ? "border-[var(--crimson)] bg-[var(--surface)] text-[var(--crimson)]"
                      : "border-[var(--ink)] bg-[var(--surface)] text-[var(--ink)]"
                    : "border-dashed border-[var(--line)] bg-transparent text-transparent",
              )}
            >
              {slots[cell.slot!]?.ch ?? "·"}
            </button>
          ),
        )}
      </div>

      {/* Statut */}
      {status === "wrong" && (
        <p className="animate-cb-pop text-center text-[14px] font-bold text-[var(--crimson)]">
          Pas tout à fait, réessaie !
        </p>
      )}
      {status === "correct" && (
        <p className="animate-cb-pop text-center text-[14px] font-bold text-[var(--sage)]">
          Correct ! +{hintCount > 0 ? "0,5" : "1"}
        </p>
      )}
      {status === "timeout" && (
        <p className="animate-cb-pop text-center text-[14px] font-bold text-[var(--crimson)]">
          Temps écoulé — c&apos;était « {term} »
        </p>
      )}

      {/* Réserve de lettres */}
      {status === "play" && (
        <div className="flex flex-wrap justify-center gap-[8px]">
          {pool.length === 0 ? (
            <span className="text-[13px] text-[var(--muted-ink)]">Plus de lettres — retire-en une si besoin.</span>
          ) : (
            pool.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => placeTile(tile)}
                data-press
                className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border-[2.5px] border-[var(--ink)] bg-[var(--surface)] font-heading text-[20px] font-extrabold uppercase text-[var(--ink)] shadow-[3px_3px_0_var(--ink)]"
              >
                {tile.ch}
              </button>
            ))
          )}
        </div>
      )}

      {/* Indice */}
      {status === "play" && (
        <button
          onClick={useHint}
          disabled={pool.length === 0}
          data-press
          className="cb-pill flex w-full items-center justify-center gap-1.5 py-2.5 text-[13.5px] disabled:opacity-50"
        >
          <Lightbulb className="h-4 w-4 text-[var(--gold)]" /> Indice (½ point)
        </button>
      )}
    </div>
  );
}

/* -------------------------- Texte à trous ------------------------- */

// Rappel actif en contexte : une phrase du résumé avec un terme masqué.
const FILL_BLANK_SECONDS = 25;

export function FillBlankActivity({ course, updateCourse, onComplete }: ActProps) {
  const [loading, setLoading] = useState(!course.flashcards);
  const [seed, setSeed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [grading, setGrading] = useState(false);
  const [status, setStatus] = useState<"play" | "correct" | "wrong" | "timeout" | "done">("play");
  const [timeLeft, setTimeLeft] = useState(FILL_BLANK_SECONDS);
  const [score, setScore] = useState(0); // 0..total (½ point possible avec indice)
  const [hintCount, setHintCount] = useState(0);
  const [shake, setShake] = useState(0);
  const doneRef = useRef(false);
  const fetchRef = useRef(false);

  // Deck dérivé du résumé + des flashcards, recalculé seulement quand le cours
  // change ou qu'on rejoue (seed). Pas d'état : on évite un reshuffle à chaque render.
  const deck = useMemo(
    () => buildFillBlankItems(course).slice(0, FILL_BLANK_MAX),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- course stable entre renders (même réf) ; seed force le rejouer.
    [course, seed],
  );

  const total = deck.length;

  // Charge les flashcards si manquantes (le jeu dérive ses items du résumé + cartes).
  useEffect(() => {
    if (course.flashcards || fetchRef.current) {
      setLoading(false);
      return;
    }
    fetchRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: course.slides, summary: course.summary }),
        });
        const data = await res.json();
        if (res.ok) updateCourse({ flashcards: data.flashcards });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateCourse est stable enough ; on ne veut pas refetch sur re-render.
  }, [course.flashcards, course.slides, course.summary, updateCourse]);

  // Prépare l'item courant quand idx/deck changent.
  useEffect(() => {
    if (total === 0) return;
    setTyped("");
    setResult(null);
    setFeedback("");
    setStatus("play");
    setTimeLeft(FILL_BLANK_SECONDS);
    setHintCount(0);
  }, [idx, total]);

  // Compte à rebours de l'item courant.
  useEffect(() => {
    if (status !== "play") return;
    if (timeLeft <= 0) {
      setStatus("timeout");
      haptic("error");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [status, timeLeft]);

  // Passe à l'item suivant après un échec affiché (timeout).
  useEffect(() => {
    if (status !== "timeout") return;
    const t = setTimeout(() => {
      if (idx + 1 >= total) setStatus("done");
      else setIdx((i) => i + 1);
    }, 1900);
    return () => clearTimeout(t);
  }, [status, idx, total]);

  // Passe au suivant après un succès.
  useEffect(() => {
    if (status !== "correct") return;
    const t = setTimeout(() => {
      if (idx + 1 >= total) setStatus("done");
      else setIdx((i) => i + 1);
    }, 1200);
    return () => clearTimeout(t);
  }, [status, idx, total]);

  // Fin : remonte le score au parcours (une seule fois).
  useEffect(() => {
    if (status === "done" && !doneRef.current) {
      doneRef.current = true;
      onComplete(total > 0 ? Math.round((score / total) * 100) : 0);
    }
  }, [status, score, total, onComplete]);

  async function submit() {
    if (status !== "play" || typed.trim().length === 0 || grading || result) return;
    const item = deck[idx];
    // Chemin rapide : réponse exacte normalisée → correction instantanée, sans IA.
    if (normalize(typed) === normalize(item.answer)) {
      setStatus("correct");
      setResult("correct");
      setFeedback("Réponse exacte.");
      haptic("success");
      setScore((s) => s + (hintCount > 0 ? 0.5 : 1));
      return;
    }
    // Sinon : correction sémantique par l'IA (synonymes/paraphrases acceptés).
    setGrading(true);
    try {
      const res = await fetch("/api/grade-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expected: item.answer, given: typed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const ok = !!data.correct;
      if (ok) {
        setStatus("correct");
        setResult("correct");
        setScore((s) => s + (hintCount > 0 ? 0.5 : 1));
      } else {
        setStatus("wrong");
        setResult("incorrect");
        setShake((x) => x + 1);
      }
      setFeedback(typeof data.feedback === "string" ? data.feedback : "");
      haptic(ok ? "success" : "error");
    } catch {
      setStatus("wrong");
      setResult("incorrect");
      setFeedback(`Réponse attendue : ${item.answer}`);
      haptic("error");
    } finally {
      setGrading(false);
    }
  }

  // Après une mauvaise réponse : on laisse le mot faux affiché ~900ms puis on
  // rend la main pour réessayer le même item (sans perdre le chrono déjà écoulé).
  useEffect(() => {
    if (status !== "wrong") return;
    const t = setTimeout(() => {
      setTyped("");
      setResult(null);
      setFeedback("");
      setStatus("play");
    }, 900);
    return () => clearTimeout(t);
  }, [status, shake]);

  function useHint() {
    if (status !== "play" || hintCount > 0) return;
    setHintCount(1);
    haptic("light");
  }

  function restart() {
    doneRef.current = false;
    setSeed((s) => s + 1);
    setIdx(0);
    setScore(0);
    setStatus("play");
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-[110px] w-full rounded-[18px]" />
        <Skeleton className="mx-auto h-12 w-full rounded-[14px]" />
        <Skeleton className="mx-auto h-11 w-40 rounded-[14px]" />
        <p className="text-center text-xs text-[var(--muted-ink)]">Préparation du Texte à trous…</p>
      </div>
    );
  }

  if (total < FILL_BLANK_MIN) {
    return (
      <EmptyState
        icon={TextCursorInput}
        title="Pas assez de phrases"
        description="Il faut un résumé et au moins 3 flashcards pour générer des phrases à trous. Génère d'abord le résumé et les cartes de ce cours."
      />
    );
  }

  if (status === "done") {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const title = pct >= 80 ? "Bien ancré !" : pct >= 50 ? "Bien joué !" : "Continue !";
    return (
      <div className="animate-cb-pop flex flex-col items-center gap-2 px-4 py-8 text-center">
        <div className="mx-auto mb-[18px] flex h-[90px] w-[90px] items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--gold)] text-[var(--ink)] shadow-[5px_5px_0_var(--ink)]">
          <span className="font-heading text-[30px] font-extrabold">{pct}%</span>
        </div>
        <h2 className="m-0 mb-1.5 font-heading text-2xl font-extrabold">{title}</h2>
        <p className="m-0 mb-[22px] text-[15px] text-[var(--muted-ink)]">
          {Math.round(score)} phrase{Math.round(score) > 1 ? "s" : ""} sur {total} complétées.
        </p>
        <button
          onClick={restart}
          data-press
          className="cb-btn-primary px-7 py-[14px] text-[15px]"
          style={{ boxShadow: "4px 4px 0 var(--gold)" }}
        >
          <RotateCcw className="h-4 w-4" /> Rejouer
        </button>
      </div>
    );
  }

  const item = deck[idx];
  const livePct = total > 0 ? Math.round((score / total) * 100) : 0;
  // Contenu du blanc selon l'état.
  let blankContent: ReactNode = null;
  let blankCls = "border-[var(--ink)] bg-[var(--surface)] text-[var(--ink)]";
  if (status === "correct" || result === "correct") {
    blankContent = item.answer;
    blankCls = "border-[var(--sage)] bg-[rgba(78,140,87,.16)] text-[var(--sage)]";
  } else if (status === "wrong" || result === "incorrect") {
    blankContent = typed.trim() || "?";
    blankCls = "border-[var(--crimson)] bg-[rgba(190,58,43,.10)] text-[var(--crimson)]";
  } else if (status === "timeout") {
    blankContent = item.answer;
    blankCls = "border-[var(--crimson)] bg-[rgba(190,58,43,.10)] text-[var(--crimson)]";
  } else if (hintCount > 0) {
    // Indice : première lettre visible, reste en underscores.
    blankContent = (
      <span>
        <span className="text-[var(--gold)]">{item.answer.charAt(0)}</span>
        <span className="text-[var(--muted-ink)]">{"_".repeat(Math.max(0, item.length - 1))}</span>
      </span>
    );
  } else {
    blankContent = <span className="text-[var(--muted-ink)]">{"_".repeat(item.length)}</span>;
  }

  return (
    <div className="animate-cb-float space-y-[14px]">
      {/* En-tête : progression + chrono + score */}
      <div className="flex items-center justify-between text-[13px] font-bold text-[var(--muted-ink)]">
        <span>Phrase {idx + 1} / {total}</span>
        <span className={cn("flex items-center gap-1", timeLeft <= 6 ? "text-[var(--crimson)]" : "text-[var(--gold)]")}>
          <Timer className="h-4 w-4" /> {timeLeft}s
        </span>
        <span className="text-[var(--sage)]">{livePct}%</span>
      </div>

      {/* La phrase à compléter */}
      <div
        key={`shake-${shake}`}
        className={cn(
          "rounded-[18px] border-[2.5px] border-[var(--ink)] bg-[var(--surface)] p-4 shadow-[4px_4px_0_var(--ink)]",
          status === "wrong" && "animate-cb-shake",
        )}
      >
        <div className="cb-mono mb-2 flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[1.5px] text-[var(--gold)]">
          <TextCursorInput className="h-3.5 w-3.5" /> Complète la phrase
        </div>
        <p className="m-0 text-[15.5px] leading-[1.5] text-[var(--ink)]">
          {item.before ? <span>{item.before} </span> : null}
          <span
            className={cn(
              "inline-flex min-w-[44px] items-center justify-center rounded-[7px] border-2 px-2 py-[1px] font-heading text-[16px] font-extrabold lowercase tracking-tight align-baseline",
              blankCls,
            )}
            style={{ minWidth: `${Math.max(44, item.length * 11)}px` }}
          >
            {blankContent}
          </span>
          {item.after ? <span> {item.after}</span> : null}
        </p>
      </div>

      {/* Feedback */}
      {status === "correct" && (
        <p className="animate-cb-pop text-center text-[14px] font-bold text-[var(--sage)]">
          Correct ! +{hintCount > 0 ? "0,5" : "1"}
        </p>
      )}
      {status === "wrong" && feedback && (
        <p className="animate-cb-pop text-center text-[14px] font-bold text-[var(--crimson)]">
          {feedback}
        </p>
      )}
      {status === "timeout" && (
        <p className="animate-cb-pop text-center text-[14px] font-bold text-[var(--crimson)]">
          Temps écoulé — c&apos;était « {item.answer} »
        </p>
      )}

      {/* Saisie */}
      {status === "play" && (
        <>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={grading}
            placeholder="Tape le terme manquant…"
            aria-label="Terme manquant"
            className="h-12 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] text-[15px]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
          />
          <div className="flex gap-[10px]">
            <button
              onClick={useHint}
              disabled={hintCount > 0}
              data-press
              className="cb-pill flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[13.5px] disabled:opacity-50"
            >
              <Lightbulb className="h-4 w-4 text-[var(--gold)]" /> {hintCount > 0 ? "Indice utilisé" : "Indice (½ pt)"}
            </button>
            <button
              onClick={submit}
              disabled={typed.trim().length === 0 || grading}
              data-press
              className="cb-btn-primary flex-[2] py-[14px] text-[15px] disabled:opacity-60"
            >
              {grading ? "Correction…" : "Valider"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
/* -------------------------- Vrai / Faux ------------------------- */

export function TrueFalseActivity({ course, updateCourse, onComplete }: ActProps) {
  const [loading, setLoading] = useState(!course.flashcards);
  const [deck, setDeck] = useState<{ statement: string; answer: boolean; cardFront: string }[]>([]);
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (course.flashcards) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: course.slides, summary: course.summary }),
        });
        const data = await res.json();
        if (res.ok) updateCourse({ flashcards: data.flashcards });
      } catch { /* ignore */
      } finally { setLoading(false); }
    })();
  }, [course.flashcards, course.slides, course.summary, updateCourse]);

  useEffect(() => {
    const cards = course.flashcards ?? [];
    if (cards.length < 3) return;
    const items: { statement: string; answer: boolean; cardFront: string }[] = [];
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    for (const card of shuffled) {
      if (Math.random() < 0.5) {
        items.push({ statement: `« ${card.front} » → ${card.back}`, answer: true, cardFront: card.front });
      } else {
        const other = shuffled.find((c) => c.id !== card.id && c.back !== card.back);
        if (other) items.push({ statement: `« ${card.front} » → ${other.back}`, answer: false, cardFront: card.front });
        else items.push({ statement: `« ${card.front} » → ${card.back}`, answer: true, cardFront: card.front });
      }
    }
    setDeck(shuffleArr(items).slice(0, Math.min(12, items.length)));
    setIdx(0); setScore(0); setDone(false); setResult(null); doneRef.current = false;
  }, [course.flashcards, loading]);

  const total = deck.length;

  function answer(userAnswer: boolean) {
    const correct = userAnswer === deck[idx].answer;
    if (correct) { setScore((s) => s + 1); setResult("correct"); haptic("success"); }
    else { setResult("incorrect"); haptic("error"); }
  }

  function next() {
    if (idx + 1 >= total) { setDone(true); doneRef.current = true; onComplete(total > 0 ? Math.round((score / total) * 100) : 0); }
    else { setIdx((i) => i + 1); setResult(null); }
  }

  if (loading) return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-[120px] w-full rounded-[22px]" />
      <div className="flex gap-3"><Skeleton className="h-14 flex-1" /><Skeleton className="h-14 flex-1" /></div>
      <p className="text-center text-xs text-[var(--muted-ink)]">Préparation…</p>
    </div>
  );

  if (total < 3) return <EmptyState icon={Layers} title="Pas assez de cartes" description="Il faut au moins 3 flashcards pour jouer. Génère d'abord les cartes de ce cours." />;

  if (done) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="animate-cb-pop flex flex-col items-center gap-2 px-4 py-8 text-center">
        <div className="mx-auto mb-[18px] flex h-[90px] w-[90px] items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--petrol)] text-white shadow-[5px_5px_0_var(--ink)]">
          <span className="font-heading text-[30px] font-extrabold">{pct}%</span>
        </div>
        <h2 className="m-0 mb-1.5 font-heading text-2xl font-extrabold">Terminé !</h2>
        <p className="m-0 mb-[22px] text-[15px] text-[var(--muted-ink)]">{score} bonnes réponses sur {total}.</p>
        <button onClick={() => { setDone(false); setIdx(0); setScore(0); setResult(null); doneRef.current = false; }} data-press className="cb-btn-primary px-7 py-[14px] text-[15px]"><RotateCcw className="h-4 w-4" /> Rejouer</button>
      </div>
    );
  }

  const item = deck[idx];
  return (
    <div className="animate-cb-float space-y-[18px]">
      <div className="flex items-center justify-between text-[13px] font-bold text-[var(--muted-ink)]">
        <span>Question {idx + 1} / {total}</span>
        <span className="text-[var(--petrol)]">{score} bonnes</span>
      </div>
      <div className="flex min-h-[140px] w-full items-center justify-center rounded-[22px] border-[2.5px] border-[var(--ink)] bg-[var(--surface)] p-6 text-center shadow-[5px_5px_0_var(--ink)]">
        <p className="m-0 font-heading text-[19px] font-bold leading-[1.3] text-balance text-[var(--ink)]">{item.statement}</p>
      </div>
      {result ? (
        <>
          <div className="animate-cb-pop rounded-[16px] border-2 p-[15px] text-center" style={{ background: result === "correct" ? "rgba(78,140,87,.12)" : "rgba(190,58,43,.10)", borderColor: result === "correct" ? "var(--sage)" : "var(--crimson)" }}>
            <span className="font-heading text-base font-extrabold" style={{ color: result === "correct" ? "var(--sage)" : "var(--crimson)" }}>{result === "correct" ? "Correct !" : "Faux !"}</span>
            {result === "incorrect" && <p className="mt-1 text-[13px] text-[var(--ink-2)]">La bonne réponse était : {item.answer ? "Vrai" : "Faux"}</p>}
          </div>
          <button onClick={next} data-press className="cb-btn-primary w-full py-[15px] text-base">{idx + 1 >= total ? "Voir mon score" : "Suivante"} <ArrowRight className="h-4 w-4" /></button>
        </>
      ) : (
        <div className="flex gap-[11px]">
          <button onClick={() => answer(true)} data-press className="flex-1 border-[2.5px] border-[var(--ink)] bg-[var(--sage)] py-[15px] font-heading text-[17px] font-bold text-white rounded-[15px] shadow-[3px_3px_0_var(--ink)]">Vrai</button>
          <button onClick={() => answer(false)} data-press className="flex-1 border-[2.5px] border-[var(--ink)] bg-[var(--crimson)] py-[15px] font-heading text-[17px] font-bold text-white rounded-[15px] shadow-[3px_3px_0_var(--ink)]">Faux</button>
        </div>
      )}
    </div>
  );
}

