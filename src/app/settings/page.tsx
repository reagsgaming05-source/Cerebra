"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePomodoro } from "@/components/pomodoro";
import { DataSettings } from "@/components/data-settings";
import { DEFAULT_DAILY_GOAL, useDailyGoal } from "@/lib/settings";
import { useSoundEnabled } from "@/lib/sounds";
import { useSessionLog } from "@/lib/session-log";
import { ActivityCalendar } from "@/components/activity-calendar";
import { useChallenges } from "@/lib/challenges";
import { useSession } from "next-auth/react";
import { useCourses } from "@/lib/store";
import { useStreak } from "@/lib/streak";
import { useLevel } from "@/lib/levels";

const THEMES = [
  { id: "light", label: "Clair" },
  { id: "dark", label: "Sombre" },
  { id: "system", label: "Système" },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { goal, save, mounted: goalMounted } = useDailyGoal();
  const { enabled: soundEnabled, toggle: toggleSound, mounted: soundMounted, dnd, toggleDnd } = useSoundEnabled();
  const { entries: sessionEntries, ready: sessionReady } = useSessionLog();
  const { courses } = useCourses();
  const { streak } = useStreak();
  const { current: level, totalXp } = useLevel();
  const { challenges, completedCount } = useChallenges();
  const { data: session } = useSession();
  const [show2fa, setShow2fa] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpVerifyCode, setTotpVerifyCode] = useState("");
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpLoading, setTotpLoading] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [offline, setOffline] = useState(false);
  const pomo = usePomodoro();

  useEffect(() => setMounted(true), []);

  const currentTheme = theme ?? "system";
  const goalValue = goalMounted ? goal : DEFAULT_DAILY_GOAL;

  function stepGoal(delta: number) {
    const next = Math.min(200, Math.max(1, goalValue + delta));
    save(next);
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 animate-cb-float px-5 pt-4">
      {/* Header : retour + titre */}
      <div className="flex items-center gap-2.5 pb-5 pt-1.5">
        <Link
          href="/"
          aria-label="Retour"
          data-press
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          Réglages
        </h1>
      </div>

      {/* Apparence */}
      <SectionLabel>Apparence</SectionLabel>
      <div className="mb-[22px] flex gap-1.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-1.5">
        {THEMES.map((t) => {
          const active = mounted && currentTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-pressed={active}
              disabled={!mounted}
              data-press
              className="flex-1 rounded-[11px] px-3 py-3 text-sm font-bold transition-colors"
              style={{
                background: active ? "var(--clay)" : "transparent",
                color: active ? "#fff" : "var(--muted)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Sécurité — 2FA */}
      {session?.user && (
        <>
          <SectionLabel>Sécurité</SectionLabel>
          <div className="mb-[22px] overflow-hidden rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)]">
            <button onClick={async () => {
              if (totpEnabled) {
                setTotpEnabled(false);
                await fetch("/api/setup-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "disable" }) });
                toast.success("2FA désactivé");
                return;
              }
              setShow2fa((v) => !v);
              if (!show2fa) {
                setTotpLoading(true);
                try {
                  const res = await fetch("/api/setup-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate" }) });
                  const data = await res.json();
                  if (res.ok) { setQrCode(data.qrCode); setTotpSecret(data.secret); }
                  else toast.error(data.error);
                } catch { toast.error("Erreur de génération"); }
                finally { setTotpLoading(false); }
              }
            }} data-press className="flex w-full items-center justify-between px-4 py-[15px] text-[15px] font-semibold text-[var(--ink)]">
              <span>Authentification à deux facteurs (2FA)</span>
              <span className="text-[12px]" style={{ color: totpEnabled ? "var(--sage)" : "var(--muted-ink)" }}>{totpEnabled ? "Activé" : "Désactivé"}</span>
            </button>
            {show2fa && !totpEnabled && (
              <div className="border-t border-[var(--line)] p-4 flex flex-col items-center gap-3">
                {totpLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-ink)]" />
                ) : qrCode ? (
                  <>
                    <p className="text-[12px] text-[var(--muted-ink)] text-center">Scanne ce code avec Google Authenticator ou Authy</p>
                    <img src={qrCode} alt="QR Code 2FA" className="rounded-[12px] border-2 border-[var(--line)]" style={{ width: 180, height: 180 }} />
                    <p className="text-[10px] text-[var(--muted-ink)] select-all">Ou saisis la clé : <code className="font-mono font-bold text-[var(--clay)]">{totpSecret}</code></p>
                    <div className="flex gap-2">
                      <input value={totpVerifyCode} onChange={(e) => setTotpVerifyCode(e.target.value)} placeholder="000000" maxLength={6} className="h-11 w-28 rounded-[10px] border-2 border-[var(--line)] bg-[var(--surface)] text-center font-mono text-lg tracking-[4px] outline-none" />
                      <button onClick={async () => {
                        const res = await fetch("/api/setup-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", code: totpVerifyCode }) });
                        const data = await res.json();
                        if (res.ok) { setTotpEnabled(true); setShow2fa(false); toast.success("2FA activé !"); }
                        else toast.error(data.error || "Code invalide");
                      }} disabled={totpVerifyCode.length !== 6} data-press className="cb-btn-primary px-4 py-2 text-[13px] disabled:opacity-50">Vérifier</button>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </>
      )}

      {/* Sons */}
      <SectionLabel>Sons</SectionLabel>
      <div className="mb-[22px] overflow-hidden rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-[15px]">
          <div className="pr-3.5">
            <div className="text-[15px] font-semibold">Effets sonores</div>
            <div className="mt-0.5 text-[12.5px] text-[var(--muted-ink)]">Sons au fil des réponses</div>
          </div>
          <button role="switch" aria-checked={soundMounted && soundEnabled} aria-label="Activer les sons" onClick={toggleSound} disabled={!soundMounted} className="relative h-7 w-[46px] shrink-0 rounded-full transition-colors disabled:opacity-50" style={{ background: soundMounted && soundEnabled ? "var(--sage)" : "var(--surface-2)" }}>
            <span className="absolute top-0.5 h-6 w-6 rounded-full bg-[#FBF6EC] shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-all" style={{ left: soundMounted && soundEnabled ? "20px" : "2px" }} />
          </button>
        </div>
        <div className="flex items-center justify-between px-4 py-[15px]">
          <div className="pr-3.5">
            <div className="text-[15px] font-semibold">Ne pas déranger</div>
            <div className="mt-0.5 text-[12.5px] text-[var(--muted-ink)]">Coupe tous les sons temporairement</div>
          </div>
          <button role="switch" aria-checked={dnd} aria-label="Mode ne pas déranger" onClick={toggleDnd} className="relative h-7 w-[46px] shrink-0 rounded-full transition-colors" style={{ background: dnd ? "var(--crimson)" : "var(--surface-2)" }}>
            <span className="absolute top-0.5 h-6 w-6 rounded-full bg-[#FBF6EC] shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-all" style={{ left: dnd ? "20px" : "2px" }} />
          </button>
        </div>
      </div>

      {/* Pomodoro */}
      <SectionLabel>Pomodoro</SectionLabel>
      <div className="mb-[22px] rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-4 text-center">
        <div className="cb-mono mb-2 text-[10px] font-medium uppercase tracking-[1.5px] text-[var(--muted-ink)]">{pomo.phase === "focus" ? "Concentration" : "Pause"}</div>
        <div className="font-heading text-[42px] font-extrabold tracking-tight">
          {Math.floor(pomo.seconds / 60)}:{String(pomo.seconds % 60).padStart(2, "0")}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button onClick={pomo.toggle} data-press className="cb-btn-primary flex items-center gap-1.5 px-5 py-2 text-[13px]">
            {pomo.running ? "Pause" : "Démarrer"}
          </button>
          <button onClick={pomo.reset} data-press className="cb-pill flex items-center gap-1 px-3 py-2 text-[12px]">Reset</button>
        </div>
      </div>

      {/* Objectif hebdomadaire */}
      <SectionLabel>Objectif hebdomadaire</SectionLabel>
      <div className="mb-[22px] flex items-center justify-between rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-4">
        <div>
          <div className="font-heading text-xl font-extrabold leading-none">
            {Math.round(goalValue * 7)} activités
          </div>
          <div className="mt-1 text-[13px] text-[var(--muted-ink)]">par semaine (auto)</div>
        </div>
        <div className="text-[12px] text-[var(--muted-ink)]">basé sur ton objectif quotidien</div>
      </div>

      {/* Objectif quotidien */}
      <SectionLabel>Objectif quotidien</SectionLabel>
      <div className="mb-[22px] flex items-center justify-between rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] p-4">
        <div>
          <div className="font-heading text-xl font-extrabold leading-none">
            {goalValue} activités
          </div>
          <div className="mt-1 text-[13px] text-[var(--muted-ink)]">par jour</div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => stepGoal(-1)}
            aria-label="Diminuer"
            disabled={!goalMounted}
            data-press
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border-2 border-[var(--ink)] bg-[var(--surface)] text-[22px] font-bold text-[var(--ink)] disabled:opacity-50"
          >
            −
          </button>
          <button
            onClick={() => stepGoal(1)}
            aria-label="Augmenter"
            disabled={!goalMounted}
            data-press
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border-2 border-[var(--ink)] bg-[var(--clay)] text-[22px] font-bold text-white disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Connexion */}
      <SectionLabel>Connexion</SectionLabel>
      <div className="mb-[22px] flex items-center justify-between rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] px-4 py-[15px]">
        <div className="pr-3.5">
          <div className="text-[15px] font-semibold">Mode hors ligne</div>
          <div className="mt-0.5 text-[12.5px] text-[var(--muted-ink)]">
            Simule une perte de réseau pour tester l'app.
          </div>
        </div>
        <button
          role="switch"
          aria-checked={offline}
          aria-label="Mode hors ligne"
          onClick={() => setOffline((v) => !v)}
          className="relative h-7 w-[46px] shrink-0 rounded-full transition-colors"
          style={{
            background: offline ? "var(--sage)" : "var(--surface-2)",
            transitionTimingFunction: "var(--ease-out)",
            transitionDuration: "0.2s",
          }}
        >
          <span
            className="absolute top-0.5 h-6 w-6 rounded-full bg-[#FBF6EC] shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-all"
            style={{
              left: offline ? "20px" : "2px",
              transitionTimingFunction: "var(--ease-out)",
              transitionDuration: "0.22s",
            }}
          />
        </button>
      </div>

      {/* Données + Zone sensible (component) */}
      <DataSettings />

      {/* Statistiques globales */}
      <SectionLabel>Statistiques</SectionLabel>
      <div className="mb-[22px] grid grid-cols-2 gap-[10px]">
        {[
          { label: "Cours", value: courses.length, icon: "📚" },
          { label: "Complétés", value: courses.filter((c) => c.progress >= 100).length, icon: "✅" },
          { label: "XP total", value: totalXp, icon: "⭐" },
          { label: "Streak", value: `${streak}j`, icon: "🔥" },
          { label: "Niveau", value: `${level.icon} ${level.title}`, icon: "" },
          { label: "Flashcards", value: courses.reduce((s, c) => s + (c.flashcards?.length ?? 0), 0), icon: "🃏" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2.5 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] p-3">
            {stat.icon && <span className="text-lg">{stat.icon}</span>}
            <div>
              <div className="font-heading text-[17px] font-extrabold">{stat.value}</div>
              <div className="text-[10.5px] text-[var(--muted-ink)]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Défis */}
      <SectionLabel>Défis ({completedCount}/{challenges.length})</SectionLabel>
      <div className="mb-[22px] flex flex-col gap-[6px]">
        {challenges.map((ch) => (
          <div key={ch.id} className={`flex items-center gap-2.5 rounded-[12px] border-2 p-2.5 ${ch.completed ? "border-[var(--sage)] bg-[rgba(78,140,87,.08)]" : "border-[var(--line)] bg-[var(--surface)] opacity-60"}`}>
            <span className="text-base">{ch.icon}</span>
            <div className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-bold">{ch.title}</span>
              <span className="text-[11px] text-[var(--muted-ink)]">{ch.description}</span>
            </div>
            {ch.completed ? <span className="text-[var(--sage)] font-bold text-[11px]">+{ch.xp}XP</span> : <span className="text-[11px] text-[var(--muted-ink)]">+{ch.xp}XP</span>}
          </div>
        ))}
      </div>

      <ActivityCalendar />

      {/* Journal de bord */}
      <SectionLabel>Journal de bord</SectionLabel>
      <div className="mb-[22px] overflow-hidden rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)]">
        <button onClick={() => setShowLog((s) => !s)} data-press className="flex w-full items-center justify-between px-4 py-[15px] text-[15px] font-semibold text-[var(--ink)]">
          Historique des sessions
          <span className="text-[12px] text-[var(--muted-ink)]">{sessionEntries.length} entrées</span>
        </button>
        {showLog && sessionReady && (
          <div className="max-h-[300px] overflow-y-auto border-t border-[var(--line)]">
            {sessionEntries.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-[var(--muted-ink)]">Aucune activité pour le moment.</p>
            ) : (
              sessionEntries.slice(0, 50).map((e, i) => (
                <div key={i} className="flex items-start gap-2 border-b border-[var(--line)] px-4 py-2.5 text-[12.5px] last:border-0">
                  <span className="mt-0.5 shrink-0 text-[var(--muted-ink)]">
                    {new Date(e.ts).toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="font-semibold text-[var(--ink)]">{e.label}</span>
                  <span className="text-[var(--muted-ink)]">{e.detail}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* À propos */}
      <SectionLabel>À propos</SectionLabel>
      <div className="mb-3.5 overflow-hidden rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)]">
        <Link
          href="/landing"
          data-press
          className="flex min-h-11 w-full items-center justify-between px-4 py-[15px] text-[15px] font-semibold text-[var(--ink)]"
        >
          Revoir la page d'accueil
          <ChevronRight className="h-[18px] w-[18px] text-[var(--muted-ink)]" />
        </Link>
      </div>
      <div className="rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] px-5 py-[18px] text-center">
        <div className="font-heading text-xl font-extrabold">Cerebra</div>
        <div className="mt-0.5 text-[13px] text-[var(--muted-ink)]">
          v0.1.0 — apprends, joue, progresse.
        </div>
      </div>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="cb-mono mb-2.5 mt-2 px-1 text-[10.5px] font-medium uppercase tracking-[1.4px] text-[var(--muted-ink)]">
      {children}
    </div>
  );
}