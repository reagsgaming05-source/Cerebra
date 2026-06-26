"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Maximize, Minimize } from "lucide-react";
import { toast } from "sonner";
import type { Course, LearningNode } from "@/lib/types";
import { completeNode, useCourses } from "@/lib/store";
import { recordStudyDay } from "@/lib/streak";
import { recordCompletion } from "@/lib/daily-progress";
import { AppHeader } from "@/components/app-header";
import { ActivityView } from "@/components/activity-view";
import { Confetti } from "@/components/confetti";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { courseAccent, NODE_LABEL } from "@/lib/utils";

/** Page dédiée à une activité du parcours (route /course/[id]/[nodeId]). */
export function ActivityRunner({ courseId, nodeId }: { courseId: string; nodeId: string }) {
  const router = useRouter();
  const { courses, upsert, ready } = useCourses();
  const course = courses.find((c) => c.id === courseId);
  const node = course?.nodes.find((n) => n.id === nodeId);
  const [confetti, setConfetti] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const updateCourse = (patch: Partial<Course>) => {
    if (!course) return;
    upsert({ ...course, ...patch });
  };

  const handleComplete = (score: number) => {
    if (!course || !node) return;
    const wasCompleted = node.completed;
    const updated = completeNode(course, node.id, score);
    upsert(updated);
    recordStudyDay();
    recordCompletion();
    if (!wasCompleted) {
      toast.success("Étape validée !", { description: `+${node.xp ?? 0} XP gagnés.` });
    }
    if (updated.progress === 100 && course.progress < 100) {
      setConfetti((c) => c + 1);
      toast("Cours maîtrisé à 100% !", { description: "Tu as terminé le parcours." });
    }
  };

  if (!course) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          {!ready ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : (
            <>
              <p className="text-lg font-semibold">Cours introuvable</p>
              <Button onClick={() => router.push("/")}>
                <Home className="h-4 w-4" /> Retour à l&apos;accueil
              </Button>
            </>
          )}
        </main>
      </>
    );
  }

  const accent = courseAccent(course.id);

  if (!node) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <p className="text-lg font-semibold">Étape introuvable</p>
          <Button onClick={() => router.push(`/course/${courseId}`)}>Retour au cours</Button>
        </main>
      </>
    );
  }

  if (!node.unlocked) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--surface-2)] text-[var(--muted-ink)] shadow-[5px_5px_0_var(--ink)]">
            <Lock className="h-10 w-10" strokeWidth={2.2} />
          </div>
          <h2 className="m-0 font-heading text-xl font-extrabold">Étape verrouillée</h2>
          <p className="m-0 max-w-sm text-[15px] leading-relaxed text-[var(--muted-ink)]">
            « {node.title} » se débloque une fois l&apos;étape précédente validée.
          </p>
          <Button onClick={() => router.push(`/course/${courseId}`)}>Retour au parcours</Button>
        </main>
      </>
    );
  }

  const label = NODE_LABEL[node.type] ?? node.type;

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-2">
        {/* En-tête : retour + titre de l'étape + plein écran */}
        <div className="flex items-center gap-2 pb-3.5 pt-1.5">
          <button
            type="button"
            onClick={() => router.push(`/course/${courseId}`)}
            aria-label="Retour au parcours"
            data-press
            className="flex h-10 w-10 flex-none items-center justify-center rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) { document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => {}); }
              else { document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {}); }
            }}
            aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"}
            data-press
            className="flex h-10 w-10 flex-none items-center justify-center rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--muted-ink)]"
          >
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
          <div className="min-w-0 flex-1">
            <span
              className="cb-mono inline-block text-[10px] font-medium uppercase tracking-[1.2px]"
              style={{ color: accent.hex }}
            >
              {label}
            </span>
            <h1 className="truncate font-heading text-[22px] font-extrabold leading-[1.1] tracking-[-0.4px]">
              {node.title}
            </h1>
          </div>
        </div>

        {/* Description de l'étape */}
        <p className="mb-5 text-[14px] leading-[1.45] text-[var(--ink-2)]">{node.description}</p>

        {/* Activité */}
        <div className="animate-cb-float">
          <ActivityView
            course={course}
            node={node}
            updateCourse={updateCourse}
            onComplete={handleComplete}
          />
        </div>

        {/* Retour en bas */}
        <button
          type="button"
          onClick={() => router.push(`/course/${courseId}`)}
          data-press
          className="mt-6 w-full rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] py-[13px] text-[14px] font-bold text-[var(--ink-2)]"
        >
          <ArrowLeft className="mr-1.5 inline h-4 w-4" /> Retour au parcours
        </button>
      </main>
      <Confetti fire={confetti} />
    </>
  );
}