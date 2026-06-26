"use client";

import { useEffect, useState } from "react";

const KEY = "study-app:sound-enabled:v1";
const EVENT = "study-app:sound-changed";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playCorrect() {
  if (!isSoundEnabled()) return;
  playTone(523.25, 0.12, "sine", 0.12);
  setTimeout(() => playTone(659.25, 0.12, "sine", 0.12), 80);
  setTimeout(() => playTone(783.99, 0.2, "sine", 0.12), 160);
}

export function playWrong() {
  if (!isSoundEnabled()) return;
  playTone(200, 0.25, "square", 0.08);
  setTimeout(() => playTone(160, 0.3, "square", 0.08), 150);
}

export function playComplete() {
  if (!isSoundEnabled()) return;
  const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, "sine", 0.1), i * 100);
  });
}

export function playFlip() {
  if (!isSoundEnabled()) return;
  playTone(440, 0.06, "sine", 0.06);
}

function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw !== "false"; // default: enabled
  } catch {
    return true;
  }
}

export function isDnd(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DND_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, String(enabled));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* ignore */
  }
}

const DND_KEY = "study-app:dnd:v1";

export function useSoundEnabled() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dnd, setDnd] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(isSoundEnabled());
    try { setDnd(window.localStorage.getItem(DND_KEY) === "true"); } catch { /* ignore */ }
    const onChange = () => setEnabled(isSoundEnabled());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = () => {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
  };

  const toggleDnd = () => {
    const next = !dnd;
    setDnd(next);
    try { window.localStorage.setItem(DND_KEY, String(next)); } catch { /* ignore */ }
  };

  return { enabled, toggle, mounted, dnd, toggleDnd };
}
