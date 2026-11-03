"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, Star } from "lucide-react";
import { toast } from "sonner";
import { useCourses } from "@/lib/store";
import {
  LEVELS,
  UNLOCK_THRESHOLD,
  buildCourseFromUnit,
  courseIdForUnit,
  useSchoolLevel,
  type CatalogLevel,
  type CatalogSubject,
  type CatalogUnit,
} from "@/lib/curriculum";
import { cn } from "@/lib/utils";

type UnitState = "locked" | "available" | "started" | "done";

// Décalage horizontal des noeuds pour le chemin en zigzag (façon Duolingo).
const ZIGZAG = [0, 46, 70, 46, 0, -46, -70, -46];

export default function ParcoursPage() {
  const router = useRouter();
  const { courses, ready, upsert } = useCourses();
  const { levelId, level, ready: levelReady, choose } = useSchoolLevel();

  const progressOf = (unitId: string) =>
    courses.find((c) => c.id === courseIdForUnit(unitId))?.progress;

  function unitState(subject: CatalogSubject, index: number): UnitState {
    const p = progressOf(subject.units[index].id);
    if (p !== undefined) return p >= 100 ? "done" : "started";
    if (index === 0) return "available";
    const prev = progressOf(subject.units[index - 1].id) ?? 0;
    return prev >= UNLOCK_THRESHOLD ? "available" : "locked";
  }

  function openUnit(lvl: CatalogLevel, subject: CatalogSubject, unit: CatalogUnit, state: UnitState) {
    if (state === "locked") {
      toast("Unité verrouillée", {
        description: `Termine au moins ${UNLOCK_THRESHOLD} % de l'unité précédente pour la débloquer.`,
      });
      return;
    }
    const id = courseIdForUnit(unit.id);
    if (!courses.some((c) => c.id === id)) {
      upsert(buildCourseFromUnit(lvl, subject, unit));
      toast.success(`${unit.emoji} ${unit.title}`, { description: "Unité ajoutée à tes cours. C'est parti !" });
    }
    router.push(`/course/${id}`);
  }

  const shown = level ?? null;
  const levelUnits = shown ? shown.subjects.flatMap((s) => s.units) : [];
  const levelDone = levelUnits.filter((u) => (progressOf(u.id) ?? 0) >= 100).length;

  return (
    <main className="mx-auto w-full max-w-[640px] flex-1 px-5 pb-16 pt-2 animate-cb-float">
      <header className="flex items-center gap-3 py-2 pb-4">
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          data-press
          className="flex h-10 w-10 items-center justify-center rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-heading text-[23px] font-extrabold tracking-[-0.5px]">Parcours scolaires</h1>
          <p className="text-[13px] text-[var(--muted-ink)]">De l&apos;école obligatoire à l&apos;université, en Suisse</p>
        </div>
      </header>

      {/* Choix du niveau */}
      <section aria-label="Choisis ton niveau" className="mb-5">
        <h2 className="mb-2 font-heading text-sm font-bold">
          {levelReady && !level ? "Choisis ton niveau pour commencer" : "Ton niveau"}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => {
            const active = l.id === levelId;
            return (
              <button
                key={l.id}
                onClick={() => choose(l.id)}
                data-press
                aria-pressed={active}
                className={cn(
                  "rounded-[16px] border-2 p-3 text-left transition-colors",
                  active
                    ? "border-[var(--ink)] bg-[var(--clay)] text-[#FBF6EC] shadow-[3px_3px_0_var(--ink)]"
                    : "border-[var(--line)] bg-[var(--surface)]",
                )}
              >
                <div className="text-xl leading-none">{l.emoji}</div>
                <div className="mt-1.5 font-heading text-[15px] font-extrabold">{l.name}</div>
                <div className={cn("text-[11.5px]", active ? "opacity-85" : "text-[var(--muted-ink)]")}>
                  {l.short} · {l.ages}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {shown && ready && (
        <>
          <section className="mb-6 rounded-[20px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-heading text-lg font-extrabold">
                  {shown.emoji} {shown.name}
                </div>
                <div className="text-[12.5px] text-[var(--muted-ink)]">{shown.grades}</div>
                <p className="mt-2 text-[13.5px]">{shown.description}</p>
              </div>
              <div className="flex-none text-right">
                <div className="font-heading text-2xl font-extrabold">
                  {levelDone}/{levelUnits.length}
                </div>
                <div className="text-[11px] text-[var(--muted-ink)]">unités maîtrisées</div>
              </div>
            </div>
          </section>

          {shown.subjects.map((subject) => (
            <section key={subject.id} className="mb-8" aria-label={subject.name}>
              <div
                className="mb-4 flex items-center gap-2.5 rounded-[16px] px-4 py-3 text-white"
                style={{ background: subject.color }}
              >
                <span className="text-2xl leading-none">{subject.emoji}</span>
                <div>
                  <div className="font-heading text-[16px] font-extrabold">{subject.name}</div>
                  <div className="text-[12px] opacity-90">
                    {subject.units.length} unité{subject.units.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <ol className="flex flex-col items-center gap-5">
                {subject.units.map((unit, i) => {
                  const state = unitState(subject, i);
                  const progress = progressOf(unit.id) ?? 0;
                  const r = 38;
                  const circ = 2 * Math.PI * r;
                  return (
                    <li
                      key={unit.id}
                      className="flex flex-col items-center"
                      style={{ transform: `translateX(${ZIGZAG[i % ZIGZAG.length]}px)` }}
                    >
                      <button
                        onClick={() => openUnit(shown, subject, unit, state)}
                        data-press
                        aria-label={`${unit.title} : ${
                          state === "locked" ? "verrouillée" : state === "done" ? "maîtrisée" : `${progress} %`
                        }`}
                        className="relative h-[88px] w-[88px]"
                      >
                        <svg width="88" height="88" viewBox="0 0 88 88" className="absolute inset-0 -rotate-90">
                          <circle cx="44" cy="44" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
                          {state !== "locked" && (
                            <circle
                              cx="44"
                              cy="44"
                              r={r}
                              fill="none"
                              stroke={subject.color}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={circ}
                              strokeDashoffset={circ * (1 - progress / 100)}
                              style={{ transition: "stroke-dashoffset .6s var(--ease-out)" }}
                            />
                          )}
                        </svg>
                        <span
                          className={cn(
                            "absolute inset-[11px] flex items-center justify-center rounded-full border-[3px] text-[28px]",
                            state === "locked" && "border-[var(--line)] bg-[var(--surface-2)] grayscale opacity-60",
                          )}
                          style={
                            state === "locked"
                              ? undefined
                              : {
                                  background: subject.color,
                                  borderColor: "var(--ink)",
                                  boxShadow: "0 4px 0 var(--ink)",
                                }
                          }
                        >
                          {state === "locked" ? <Lock className="h-6 w-6 text-[var(--muted)]" /> : unit.emoji}
                        </span>
                        {state === "done" && (
                          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--gold)]">
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </span>
                        )}
                        {state === "available" && progress === 0 && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[var(--ink)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                            Commencer
                          </span>
                        )}
                      </button>
                      <div className="mt-2 max-w-[180px] text-center">
                        <div className="text-[13.5px] font-bold leading-tight">{unit.title}</div>
                        <div className="mt-0.5 flex items-center justify-center gap-1 text-[11.5px] text-[var(--muted-ink)]">
                          {state === "done" ? (
                            <>
                              <Star className="h-3 w-3" fill="var(--gold)" stroke="none" /> Maîtrisée
                            </>
                          ) : state === "started" ? (
                            `${progress} % du parcours`
                          ) : state === "locked" ? (
                            "Verrouillée"
                          ) : (
                            `${unit.flashcards.length} cartes · ${unit.quiz.length} questions`
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}

          <p className="text-center text-[12.5px] text-[var(--muted-ink)]">
            Contenus inspirés du Plan d&apos;études romand (PER) et des programmes du secondaire II et du supérieur.
            Tu peux aussi importer tes propres cours depuis l&apos;accueil.
          </p>
        </>
      )}
    </main>
  );
}
