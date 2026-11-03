"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Flame,
  Pin,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { Onboarding } from "@/components/onboarding";
import { PasteTextZone } from "@/components/paste-text-zone";
import { UploadZone } from "@/components/upload-zone";
import { useOnboarding } from "@/lib/onboarding";
import { courseMatches, sortCourses, type SortKey } from "@/lib/search";
import { useSort } from "@/lib/settings";
import { useCourses } from "@/lib/store";
import { useSchoolLevel } from "@/lib/curriculum";
import { useStreak } from "@/lib/streak";
import { useDailyProgress } from "@/lib/daily-progress";
import { toast } from "sonner";
import { cn, courseAccent } from "@/lib/utils";
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
import { AchievementsPanel } from "@/components/achievements-panel";
import { useAchievements } from "@/lib/achievements";
import { useLevel } from "@/lib/levels";
import { estimateDifficulty, getDifficultyColor } from "@/lib/difficulty";
import { normalize } from "@/lib/search";
import { dueCards } from "@/lib/srs";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Récent" },
  { key: "progress", label: "Progrès" },
  { key: "xp", label: "XP" },
];

export default function Home() {
  const { courses, ready, remove, togglePin, archive } = useCourses();
  const { level: schoolLevel } = useSchoolLevel();
  const { streak } = useStreak();
  const { today, goal, pct, reached } = useDailyProgress();
  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding();
  const { achievements, unlockedCount, totalCount, justUnlocked } = useAchievements();
  const { current: level, next: nextLvl, pct: levelPct, totalXp } = useLevel();
  const [query, setQuery] = useState("");
  const [globalSearch, setGlobalSearch] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [gridView, setGridView] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { sort, setSort } = useSort();

  // Notification des nouveaux succès
  useEffect(() => {
    if (justUnlocked.length > 0) {
      justUnlocked.forEach((ach) => {
        toast.success(`🏆 Succès débloqué : ${ach.title}`, {
          description: ach.description,
          duration: 4000,
        });
      });
    }
  }, [justUnlocked]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    courses.forEach((c) => (c.tags ?? []).forEach((t) => tags.add(t)));
    return [...tags].sort();
  }, [courses]);

  const filtered = useMemo(
    () => sortCourses(courses.filter((c) => courseMatches(c, query) && (!tagFilter || (c.tags ?? []).includes(tagFilter)) && (showArchived || !c.archived)), sort),
    [courses, query, sort, tagFilter, showArchived]
  );

  const ringC = 2 * Math.PI * 26;
  const ringOffset = ringC * (1 - Math.min(100, pct) / 100);
  const goalLeft = Math.max(0, goal - today);
  const goalNudge = reached
    ? "Objectif atteint, bravo · reviens demain"
    : `Plus que ${goalLeft} pour ton objectif`;

  const startOnboarding = () => {
    dismissOnboarding();
    requestAnimationFrame(() => {
      document
        .getElementById("upload")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      {showOnboarding && (
        <Onboarding onStart={startOnboarding} onSkip={dismissOnboarding} />
      )}
      <main className="mx-auto w-full max-w-[640px] flex-1 px-5 pt-2 animate-cb-float">
        {/* Header */}
        <header className="flex items-center justify-between py-2 pb-4">
          <Link
            href="/landing"
            data-press
            className="flex items-center gap-2.5"
            aria-label="Cerebra — accueil"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-[11px] border-[2.5px] border-[var(--ink)] bg-[var(--clay)] text-[#FBF6EC] shadow-[2.5px_2.5px_0_var(--ink)]"
            >
              <BookOpen className="h-5 w-5" strokeWidth={2.1} />
            </span>
            <span className="font-heading text-[23px] font-extrabold tracking-[-0.5px]">
              Cerebra
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-full border-2 border-[var(--clay)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-bold text-[var(--ink)]"
              title={`Niveau ${level.level} · ${totalXp} XP`}
            >
              <span className="text-base leading-none">{level.icon}</span>
              <span>{level.title}</span>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-full border-2 border-[var(--gold)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-bold text-[var(--ink)]"
              title="Série de jours"
            >
              <Flame className="h-4 w-4" fill="var(--gold)" stroke="var(--clay-deep)" strokeWidth={1.2} />
              {streak}
            </div>
            <Link
              href="/settings"
              aria-label="Réglages"
              data-press
              className="flex h-10 w-10 items-center justify-center rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
            >
              <Settings className="h-5 w-5" strokeWidth={1.9} />
            </Link>
          </div>
        </header>

        {/* Objectif du jour */}
        <section
          className="relative mb-4 overflow-hidden rounded-[24px] p-5 text-[var(--bg)] shadow-[0_14px_30px_-14px_rgba(34,28,23,.5)]"
          style={{ background: "linear-gradient(140deg, #2a221b 0%, var(--ink) 60%)" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="cb-mono mb-3 inline-flex -rotate-[1.5deg] items-center gap-1.5 rounded-[5px] border border-[rgba(229,165,44,.5)] px-2 py-1 text-[10px] font-medium uppercase tracking-[1.5px] text-[var(--gold)]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}>
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
                OBJECTIF DU JOUR
              </span>
              <div className="flex items-end gap-2">
                <span className="font-heading text-[42px] font-extrabold leading-[0.9] tracking-[-1px]">
                  {today}
                </span>
                <span className="mb-[5px] text-base opacity-60">
                  / {goal} activités
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-semibold opacity-70">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5L20 6" />
                </svg>
                {goalNudge}
              </div>
            </div>
            <div className="relative h-[74px] w-[74px] flex-none">
              <svg width="74" height="74" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="7" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={ringC}
                  strokeDashoffset={ringOffset}
                  style={{ transition: "stroke-dashoffset .7s var(--ease-out)" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-heading text-[17px] font-extrabold tracking-[-0.5px]">
                {pct}%
              </div>
            </div>
          </div>
        </section>

        {/* Parcours scolaires suisses */}
        <Link
          href="/parcours"
          data-press
          className="mb-4 flex items-center gap-3.5 rounded-[20px] border-2 border-[var(--ink)] bg-[var(--surface)] p-4 shadow-[3px_3px_0_var(--ink)]"
        >
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] bg-[var(--clay)] text-2xl">
            {schoolLevel?.emoji ?? "🇨🇭"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-[16px] font-extrabold">
              {schoolLevel ? `Parcours ${schoolLevel.name}` : "Parcours scolaires suisses"}
            </span>
            <span className="block text-[12.5px] text-[var(--muted-ink)]">
              {schoolLevel
                ? `${schoolLevel.grades} · continue ton parcours`
                : "Du cycle 1 à l'université : choisis ton niveau et apprends"}
            </span>
          </span>
          <span className="font-heading text-xl font-extrabold text-[var(--clay)]">→</span>
        </Link>

        {/* Rappel SRS */}
        {(() => {
          const totalDue = courses.reduce((s, c) => s + dueCards(c.flashcards ?? []).length, 0);
          if (totalDue === 0) return null;
          return (
            <section className="mb-4 rounded-[18px] border-2 border-[var(--gold)] bg-[rgba(229,165,44,.08)] p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔄</span>
                <div>
                  <span className="block text-[14px] font-bold">{totalDue} carte{totalDue > 1 ? "s" : ""} à réviser aujourd'hui</span>
                  <span className="text-[12px] text-[var(--muted-ink)]">Répétition espacée — reviens pour consolider</span>
                </div>
              </div>
            </section>
          );
        })()}

        {/* Derniers cours ouverts */}
        {courses.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-2 font-heading text-[13px] font-bold text-[var(--muted-ink)]">Reprendre</h2>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {[...courses].sort((a, b) => (b.lastStudiedAt ?? 0) - (a.lastStudiedAt ?? 0)).slice(0, 5).filter((c) => !c.archived).map((c) => {
                const accent = courseAccent(c.id);
                return (
                  <Link key={c.id} href={`/course/${c.id}`} className="flex shrink-0 items-center gap-2.5 rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] p-3">
                    <span className="cb-tile flex h-9 w-9 items-center justify-center" style={{ background: accent.tint, color: accent.hex }}><BookOpen className="h-4 w-4" strokeWidth={2} /></span>
                    <div className="min-w-0 max-w-[120px]">
                      <span className="block truncate text-[13px] font-bold">{c.title}</span>
                      <span className="text-[10px] text-[var(--muted-ink)]">{c.progress}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Vue d'ensemble */}
        {courses.length > 0 && (
          <section className="mb-5 grid grid-cols-3 gap-[10px]">
            {[
              {
                label: "Cours",
                value: courses.length,
                icon: "📚",
                color: "var(--clay)",
              },
              {
                label: "Complétés",
                value: courses.filter((c) => c.progress >= 100).length,
                icon: "✅",
                color: "var(--sage)",
              },
              {
                label: "Total XP",
                value: courses.reduce((s, c) => s + c.xp, 0),
                icon: "⭐",
                color: "var(--gold)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 rounded-[18px] border-2 border-[var(--line)] bg-[var(--surface)] p-3 text-center"
              >
                <span className="text-lg leading-none">{stat.icon}</span>
                <span className="font-heading text-[20px] font-extrabold leading-none" style={{ color: stat.color }}>
                  {stat.value}
                </span>
                <span className="text-[10.5px] font-semibold text-[var(--muted-ink)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Succès / Achievements */}
        <AchievementsPanel
          achievements={achievements}
          unlockedCount={unlockedCount}
          totalCount={totalCount}
        />

        {/* Recherche */}
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="mb-5 flex h-12 items-center gap-2.5 rounded-[15px] border-2 border-[var(--line)] bg-[var(--surface)] px-3.5"
        >
          <Search className="h-[19px] w-[19px] text-[var(--muted-ink)]" strokeWidth={2.2} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un cours…"
            aria-label="Rechercher un cours"
            className="h-full flex-1 border-none bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--muted-ink)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setGlobalSearch(false); }}
              aria-label="Vider la recherche"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-ink)] hover:text-[var(--ink)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setGlobalSearch((v) => !v)}
            data-active={globalSearch}
            className="cb-pill px-2 py-1 text-[10px]"
            title="Recherche globale (cours + flashcards)"
          >
            {globalSearch ? "Cours" : "Global"}
          </button>
        </form>

        {/* Résultats recherche globale */}
        {globalSearch && query.trim() && (
          <div className="mb-4 rounded-[18px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-sm font-bold">Résultats globaux</span>
              <button type="button" onClick={() => setGlobalSearch(false)} className="text-[11px] text-[var(--clay)]">Fermer</button>
            </div>
            {(() => {
              const q = normalize(query);
              const results: { type: string; label: string; link: string }[] = [];
              for (const c of courses) {
                if (normalize(c.title).includes(q)) results.push({ type: "Cours", label: c.title, link: `/course/${c.id}` });
                for (const fc of c.flashcards ?? []) {
                  if (normalize(fc.front).includes(q) || normalize(fc.back).includes(q)) {
                    results.push({ type: "Flashcard", label: `${fc.front} → ${fc.back.slice(0, 60)}`, link: `/course/${c.id}` });
                  }
                }
              }
              if (results.length === 0) return <p className="text-[13px] text-[var(--muted-ink)]">Aucun résultat pour « {query} ».</p>;
              return (
                <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
                  {results.slice(0, 20).map((r, i) => (
                    <Link key={i} href={r.link} className="flex items-center gap-2 rounded-[10px] border border-[var(--line)] px-2.5 py-2 text-[12.5px] hover:border-[var(--clay)]">
                      <span className="cb-mono shrink-0 rounded-[3px] bg-[var(--surface-2)] px-1 py-[1px] text-[8px] font-bold uppercase">{r.type}</span>
                      <span className="truncate">{r.label}</span>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Filtre par tag */}
        {allTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            <button type="button" data-press data-active={tagFilter === null} onClick={() => setTagFilter(null)} className="cb-pill px-2 py-1 text-[11px]">Tous</button>
            {allTags.map((tag) => (
              <button key={tag} type="button" data-press data-active={tagFilter === tag} onClick={() => setTagFilter(tag)} className="cb-pill px-2 py-1 text-[11px]">{tag}</button>
            ))}
          </div>
        )}

        {/* Titre + tris */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Mes cours</h2>
          {courses.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button type="button" data-press onClick={() => setShowArchived((v) => !v)} className="cb-pill px-2 py-1 text-[12.5px]" title="Afficher les cours archivés" style={{ color: showArchived ? "var(--crimson)" : undefined }}>
                🗄️
              </button>
              <button type="button" data-press onClick={() => setGridView((v) => !v)} className="cb-pill px-2 py-1 text-[12.5px]" title={gridView ? "Vue liste" : "Vue grille"}>
                {gridView ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                )}
              </button>
              {SORTS.map((s) => {
                const active = sort === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    data-press
                    onClick={() => setSort(s.key)}
                    data-active={active}
                    className={cn(
                      "cb-pill rounded-full border-2 px-2.5 py-1 text-[12.5px] font-semibold transition-colors"
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Contenu */}
        {!ready ? (
          <p className="text-sm text-[var(--muted-ink)]">Chargement…</p>
        ) : courses.length === 0 ? (
          // emptyAll
          <div className="relative overflow-hidden rounded-[22px] border-[2.5px] border-dashed border-[var(--clay)] bg-[var(--surface)] px-5 py-7 text-center">
            <span className="cb-mono mb-3.5 inline-block -rotate-[1.5deg] rounded-[5px] border border-[var(--clay)] px-2 py-1 text-[9.5px] font-medium uppercase tracking-[1.6px] text-[var(--clay)]">
              CAHIER VIDE
            </span>
            <p className="mb-1.5 font-heading text-[19px] font-extrabold tracking-[-0.3px]">
              Ton premier cours t'attend
            </p>
            <p className="mx-auto mb-4 max-w-[34ch] text-sm leading-[1.5] text-[var(--muted-ink)]">
              Importe un document ou colle des notes — on s'occupe du résumé, des cartes et du quiz.
            </p>
            <button
              type="button"
              data-press
              onClick={startOnboarding}
              className="cb-btn-primary inline-flex items-center justify-center rounded-[14px] px-6 py-3 font-heading text-[15px] font-bold"
            >
              Importer un cours
            </button>
          </div>
        ) : filtered.length === 0 ? (
          // noResults
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="mb-3 flex h-[54px] w-[54px] items-center justify-center rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--muted-ink)]">
              <Search className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <p className="mb-1 font-heading text-base font-bold">Aucun résultat</p>
            <p className="text-sm leading-[1.45] text-[var(--muted-ink)]">
              Rien ne correspond à « {query} ». Essaie un autre mot-clé.
            </p>
          </div>
        ) : (
          <div className={gridView ? "grid grid-cols-2 gap-[13px]" : "flex flex-col gap-[13px]"}>
            {filtered.map((c) => {
              const accent = courseAccent(c.id);
              return (
                <div
                  key={c.id}
                  data-press
                  className="cb-card-line relative cursor-pointer rounded-[20px] p-[15px]"
                >
                  <Link href={`/course/${c.id}`} className="block">
                    <div className="mb-3.5 flex items-center gap-3">
                      <span
                        className="cb-tile flex h-12 w-12 flex-none items-center justify-center"
                        style={{
                          background: accent.tint,
                          color: accent.hex,
                        }}
                      >
                        <BookOpen className="h-6 w-6" strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-0.5 line-clamp-2 font-heading text-[18px] font-bold leading-[1.12] tracking-[-0.3px]">
                          {c.title}
                        </h3>
                        <span className="cb-mono text-[10px] font-medium uppercase tracking-[1.2px]" style={{ color: accent.hex }}>
                          Cours
                        </span>
                        {c.tags && c.tags.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {c.tags.map((tag) => (
                              <span key={tag} className="cb-mono rounded-[3px] bg-[rgba(204,107,67,.08)] px-1 py-[1px] text-[8px] font-bold uppercase tracking-[.5px] text-[var(--clay)]">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label={c.pinned ? "Désépingler le cours" : "Épingler le cours"}
                        aria-pressed={c.pinned}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(c.id);
                        }}
                        className="flex-none rounded-[10px] border-[1.5px] px-0 py-0"
                        style={{
                          width: 34,
                          height: 34,
                          borderColor: c.pinned ? accent.hex : "var(--line)",
                          background: c.pinned ? accent.tint : "var(--surface)",
                          color: c.pinned ? accent.hex : "var(--muted)",
                        }}
                      >
                        <Pin className="h-4 w-4" fill={c.pinned ? accent.hex : "none"} />
                      </button>
                      <button
                        type="button"
                        aria-label={c.archived ? "Restaurer le cours" : "Archiver le cours"}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); archive(c.id); }}
                        className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--muted-ink)]"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <button
                              type="button"
                              aria-label="Supprimer le cours"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--muted-ink)]"
                            />
                          }
                        >
                          <Trash2 className="h-[15px] w-[15px]" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce cours ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              « {c.title} » et toute sa progression seront effacés
                              définitivement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => remove(c.id)}
                              className="bg-[var(--crimson)] text-[var(--bg)] hover:bg-[var(--crimson)]/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {/* Difficulté */}
                      {(() => {
                        const diff = estimateDifficulty(c);
                        const colors = getDifficultyColor(diff.level);
                        return (
                          <span
                            className="cb-mono rounded-[6px] px-1.5 py-[2px] text-[9.5px] font-bold uppercase tracking-[.8px]"
                            style={{ background: colors.bg, color: colors.text }}
                            title={`${diff.estimatedMinutes} min estimées`}
                          >
                            {colors.label}
                          </span>
                        );
                      })()}
                      {/* Anneau de progression */}
                      <div className="relative h-[38px] w-[38px] flex-none">
                        <svg width="38" height="38" viewBox="0 0 38 38" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="19" cy="19" r="15" fill="none" stroke="var(--surface-2)" strokeWidth="3.5" />
                          <circle
                            cx="19" cy="19" r="15"
                            fill="none"
                            stroke={accent.hex}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 15}
                            strokeDashoffset={2 * Math.PI * 15 * (1 - Math.min(100, c.progress) / 100)}
                            style={{ transition: "stroke-dashoffset .5s var(--ease-out)" }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-[var(--muted-ink)]">
                          {c.progress}%
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[13px] font-bold text-[var(--gold)]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="m12 2 2.4 6.9H22l-6 4.5 2.3 7-6.3-4.5L5.7 20.4 8 13.4l-6-4.5h7.6Z" />
                        </svg>
                        {c.xp}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload + paste */}
        <section id="upload" className="mt-5 scroll-mt-20">
          <UploadZone />
          <PasteTextZone />
        </section>
      </main>
    </>
  );
}