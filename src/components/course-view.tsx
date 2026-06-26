"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Check, Home, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { Course, LearningNode } from "@/lib/types";
import { completeNode, useCourses, genId, buildNodes } from "@/lib/store";
import { recordStudyDay } from "@/lib/streak";
import { recordCompletion } from "@/lib/daily-progress";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { CourseStats } from "@/components/course-stats";
import { FlashcardList } from "@/components/flashcard-list";
import { LevelMap } from "@/components/level-map";
import { ProgressionCard } from "@/components/progression-card";
import { ManualFlashcardForm } from "@/components/manual-flashcard-form";
import { Glossary } from "@/components/glossary";
import { ActivityView } from "@/components/activity-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Confetti } from "@/components/confetti";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { playComplete } from "@/lib/sounds";
import { showXpGain } from "@/components/xp-popup";
import { detectCourseLang } from "@/lib/lang-detect";
import { logSession } from "@/lib/session-log";
import { courseAccent } from "@/lib/utils";

const TABS = [
  { id: "path", label: "Parcours" },
  { id: "summary", label: "Résumé" },
  { id: "flashcards", label: "Cartes" },
  { id: "quiz", label: "Quiz" },
  { id: "glossary", label: "Glossaire" },
  { id: "stats", label: "Stats" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CourseView({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { courses, upsert, ready, duplicate } = useCourses();
  const course = courses.find((c) => c.id === courseId);
  const [tab, setTab] = useState<TabId>("path");
  const [confetti, setConfetti] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [tagInput, setTagInput] = useState("");

  const updateCourse = (patch: Partial<Course>) => {
    if (!course) return;
    upsert({ ...course, ...patch });
  };

  const handleComplete = (nodeId: string, score: number) => {
    if (!course) return;
    const node = course.nodes.find((n) => n.id === nodeId);
    const updated = completeNode(course, nodeId, score);
    upsert(updated);
    recordStudyDay();
    recordCompletion();
    if (!node?.completed) {
      const earnedXp = node?.xp ?? 0;
      toast.success("Étape validée !", {
        description: `+${earnedXp} XP gagnés.`,
      });
      if (node) logSession({ type: "activity", label: node.title, detail: `+${earnedXp} XP` });
      if (typeof window !== "undefined") {
        showXpGain(earnedXp, window.innerWidth / 2 - 40, window.innerHeight / 2 - 20);
      }
    }
    if (updated.progress === 100 && course.progress < 100) {
      setConfetti((c) => c + 1);
      playComplete();
      toast("Cours maîtrisé à 100% !", { description: "Tu as terminé le parcours." });
    }
  };

  const nodeByType = (type: LearningNode["type"]) =>
    course?.nodes.find((n) => n.type === type);

  if (!course) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          {!ready ? (
            <p className="text-sm text-muted-foreground">Chargement du cours…</p>
          ) : (
            <>
              <p className="text-lg font-semibold">Cours introuvable</p>
              <p className="text-sm text-muted-foreground">
                Il a peut-être été supprimé.
              </p>
              <Button onClick={() => router.push("/")}>
                <Home className="h-4 w-4" /> Retour à l'accueil
              </Button>
            </>
          )}
        </main>
      </>
    );
  }

  const accent = courseAccent(course.id);
  const lang = detectCourseLang(course.slides);
  const langLabel = lang === "fr" ? "FR" : lang === "en" ? "EN" : null;

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-2 sm:pb-10">
        {/* Header cours */}
        <div className="flex items-center gap-2 pb-3.5 pt-1.5">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Retour"
            data-press
            className="flex h-10 w-10 flex-none items-center justify-center rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
          </button>

          {editingTitle ? (
            <>
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                aria-label="Titre du cours"
                autoFocus
                className="h-[42px] min-w-0 flex-1 rounded-[11px] border-2 border-[var(--clay)] bg-[var(--surface)] font-heading text-[17px] font-bold text-[var(--ink)] outline-none"
              />
              <button
                type="button"
                aria-label="Enregistrer le titre"
                data-press
                disabled={titleDraft.trim().length === 0}
                onClick={() => {
                  updateCourse({ title: titleDraft.trim() });
                  setEditingTitle(false);
                  toast.success("Titre mis à jour");
                }}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] border-2 border-[var(--ink)] bg-[var(--sage)] text-white disabled:opacity-50"
              >
                <Check className="h-[18px] w-[18px]" strokeWidth={2.4} />
              </button>
            </>
          ) : (
            <>
              <div
                className="cb-tile flex h-[42px] w-[42px] flex-none items-center justify-center"
                style={{ background: accent.tint, color: accent.hex }}
              >
                <BookOpen className="h-[22px] w-[22px]" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="cb-mono inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[1.2px]" style={{ color: accent.hex }}>
                  Cours
                  {langLabel && (
                    <span className="rounded-[4px] border border-current px-1 py-[1px] text-[8.5px] font-bold tracking-[.8px] opacity-70">
                      {langLabel}
                    </span>
                  )}
                </span>
                <h1 className="truncate font-heading text-[22px] font-extrabold leading-[1.1] tracking-[-0.4px]">
                  {course.title}
                </h1>
                {/* Tags */}
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {(course.tags ?? []).map((tag) => (
                    <span key={tag} className="cb-mono inline-flex items-center gap-1 rounded-[5px] border border-[var(--clay)] bg-[rgba(204,107,67,.08)] px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-[.6px] text-[var(--clay)]">
                      {tag}
                      <button type="button" onClick={() => updateCourse({ tags: (course.tags ?? []).filter((t) => t !== tag) })} aria-label={`Supprimer le tag ${tag}`} className="hover:text-[var(--crimson)]"><X className="h-2.5 w-2.5" strokeWidth={3} /></button>
                    </span>
                  ))}
                  <form onSubmit={(e) => { e.preventDefault(); const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-"); if (t && !(course.tags ?? []).includes(t)) { updateCourse({ tags: [...(course.tags ?? []), t] }); } setTagInput(""); }} className="flex items-center gap-1">
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="+ tag" aria-label="Ajouter un tag" className="w-16 rounded-[4px] border border-[var(--line)] bg-transparent px-1.5 py-[1px] text-[9px] outline-none placeholder:text-[var(--muted-ink)]" />
                    <button type="submit" aria-label="Ajouter" className="text-[var(--clay)] hover:text-[var(--clay-deep)]"><Plus className="h-2.5 w-2.5" strokeWidth={3} /></button>
                  </form>
                </div>
              </div>
              <button
                type="button"
                aria-label="Modifier le titre"
                data-press
                onClick={() => {
                  setTitleDraft(course.title);
                  setEditingTitle(true);
                }}
                className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--muted-ink)]"
              >
                <Pencil className="h-[17px] w-[17px]" strokeWidth={2} />
              </button>
              <div className="flex gap-1">
                {course.progress < 100 && (
                  <button type="button" aria-label="Marquer comme terminé" data-press onClick={() => { const updated = { ...course, progress: 100, xp: course.xp + 50 }; upsert(updated); toast.success("Cours marqué comme terminé !"); }} className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] border-2 border-[var(--sage)] bg-[rgba(78,140,87,.12)] text-[var(--sage)]"><Check className="h-[17px] w-[17px]" strokeWidth={2.5} /></button>
                )}
                <button type="button" aria-label="Dupliquer le cours" data-press onClick={() => { const newId = duplicate(course.id); if (newId) toast.success("Cours dupliqué !"); }} className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--muted-ink)]"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              </div>
            </>
          )}
        </div>

        {/* Onglets en pilules scrollables */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
          <div className="flex gap-[7px] overflow-x-auto pb-4">
            {TABS.map((t) => {
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  data-active={isActive}
                  className="cb-pill flex-none px-3.5 py-2 text-[13.5px]"
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <TabsContent value="path" className="mt-2 animate-cb-float">
            <ProgressionCard course={course} />
            <div className="mb-3 mt-5 flex items-center gap-2">
              <h2 className="font-heading text-base font-bold text-[var(--ink)]">
                Carte de niveaux
              </h2>
              <span className="cb-mono text-[10px] font-medium uppercase tracking-[1px] text-[var(--muted-ink)]">
                suis le chemin
              </span>
            </div>
            <LevelMap
              nodes={course.nodes}
              onOpen={(n) => {
                if (n.unlocked) router.push(`/course/${course.id}/${n.id}`);
              }}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-2 animate-cb-float">
            {(() => {
              const n = nodeByType("summary")!;
              return (
                <ActivityView
                  course={course}
                  node={n}
                  updateCourse={updateCourse}
                  onComplete={(s) => handleComplete(n.id, s)}
                />
              );
            })()}
          </TabsContent>

          <TabsContent value="flashcards" className="mt-2 animate-cb-float">
            <ManualFlashcardForm course={course} updateCourse={updateCourse} />
            <FlashcardList course={course} updateCourse={updateCourse} />
            {(() => {
              const n = nodeByType("flashcards")!;
              return (
                <ActivityView
                  course={course}
                  node={n}
                  updateCourse={updateCourse}
                  onComplete={(s) => handleComplete(n.id, s)}
                />
              );
            })()}
          </TabsContent>

          <TabsContent value="quiz" className="mt-2 animate-cb-float">
            {(() => {
              const n =
                course.nodes.find((x) => x.type === "quiz" && x.order === 3) ??
                nodeByType("quiz")!;
              return (
                <ActivityView
                  course={course}
                  node={n}
                  updateCourse={updateCourse}
                  onComplete={(s) => handleComplete(n.id, s)}
                />
              );
            })()}
          </TabsContent>

          <TabsContent value="glossary" className="mt-2 animate-cb-float">
            <Glossary course={course} />
          </TabsContent>

          <TabsContent value="stats" className="mt-2 animate-cb-float">
            <CourseStats course={course} />
          </TabsContent>
        </Tabs>
      </main>

      <Confetti fire={confetti} />
      <BottomNav active={tab} onTabChange={(t) => setTab(t)} />
    </>
  );
}