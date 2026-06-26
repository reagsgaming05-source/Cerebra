"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Timer, X } from "lucide-react";
import { usePathname } from "next/navigation";

// Singleton partagé pour que le state pomodoro soit accessible partout
interface PomodoroState {
  seconds: number;
  running: boolean;
  phase: "focus" | "break";
}

let pomodoroState: PomodoroState = { seconds: 25 * 60, running: false, phase: "focus" };
let listeners: Array<(s: PomodoroState) => void> = [];
let intervalId: ReturnType<typeof setInterval> | null = null;

function notify() {
  for (const fn of listeners) fn({ ...pomodoroState });
}

function tick() {
  if (!pomodoroState.running || pomodoroState.seconds <= 0) return;
  pomodoroState.seconds--;
  notify();
  if (pomodoroState.seconds <= 0) {
    pomodoroState.running = false;
    notify();
  }
}

function startInterval() {
  if (intervalId) return;
  intervalId = setInterval(tick, 1000);
}

function stopInterval() {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
}

export function usePomodoro() {
  const [state, setState] = useState<PomodoroState>(pomodoroState);

  useEffect(() => {
    listeners.push(setState);
    return () => { listeners = listeners.filter((fn) => fn !== setState); };
  }, []);

  return {
    ...state,
    setSeconds: (s: number) => { pomodoroState.seconds = s; notify(); },
    setRunning: (r: boolean) => {
      pomodoroState.running = r;
      notify();
      if (r) startInterval(); else stopInterval();
    },
    setPhase: (p: "focus" | "break") => { pomodoroState.phase = p; notify(); },
    reset: () => {
      pomodoroState.seconds = 25 * 60;
      pomodoroState.running = false;
      pomodoroState.phase = "focus";
      stopInterval();
      notify();
    },
    toggle: () => {
      pomodoroState.running = !pomodoroState.running;
      notify();
      if (pomodoroState.running) startInterval(); else stopInterval();
    },
  };
}

/**
 * Bulle Pomodoro flottante, visible sur toutes les pages sauf settings/profil.
 * Mini quand inactif, expand au clic pour les contrôles.
 */
export function PomodoroFloating() {
  const pathname = usePathname();
  const pomo = usePomodoro();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (pathname === "/settings" || pathname === "/profile" || pathname === "/login" || pathname === "/landing") return null;

  const mins = Math.floor(pomo.seconds / 60);
  const secs = pomo.seconds % 60;
  const display = `${mins}:${String(secs).padStart(2, "0")}`;
  const isActive = pomo.running || pomo.seconds < 25 * 60;

  return (
    <div className="fixed bottom-28 right-4 z-40 sm:bottom-32 sm:right-6">
      {expanded ? (
        <div className="animate-cb-fade rounded-[18px] border-2 border-[var(--line)] bg-[var(--surface)] p-4 shadow-[4px_4px_0_var(--ink)] min-w-[180px]">
          <div className="flex items-center justify-between mb-2">
            <span className="cb-mono text-[9px] font-medium uppercase tracking-[1.2px] text-[var(--muted-ink)]">
              {pomo.phase === "focus" ? "CONCENTRATION" : "PAUSE"}
            </span>
            <button onClick={() => setExpanded(false)} data-press className="text-[var(--muted-ink)] hover:text-[var(--ink)]">
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <div className="font-heading text-[32px] font-extrabold text-center tracking-tight text-[var(--ink)]">
            {display}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              onClick={pomo.toggle}
              data-press
              className="flex items-center gap-1.5 rounded-[10px] bg-[var(--clay)] px-4 py-2 text-[12px] font-bold text-white transition-all active:scale-90"
            >
              {pomo.running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {pomo.running ? "Pause" : "Démarrer"}
            </button>
            <button
              onClick={pomo.reset}
              data-press
              className="flex items-center gap-1 rounded-[10px] border-2 border-[var(--line)] px-3 py-2 text-[12px] font-semibold text-[var(--muted-ink)] transition-all active:scale-90"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          data-press
          className="flex items-center gap-2 rounded-full border-2 border-[var(--line)] bg-[var(--surface)] px-3 py-2 shadow-[0_2px_8px_rgba(34,28,23,.1)] transition-all active:scale-90 hover:border-[var(--clay)]"
          title="Pomodoro"
        >
          <Timer className="h-4 w-4" strokeWidth={2} style={{ color: isActive ? "var(--clay)" : "var(--muted-ink)" }} />
          {isActive && (
            <span className="font-heading text-[14px] font-extrabold tabular-nums" style={{ color: "var(--clay)" }}>
              {display}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
