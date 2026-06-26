import { playCorrect, playWrong, playFlip, playComplete, isDnd } from "./sounds";

/**
 * Feedback haptique léger via l'API Vibration + son optionnel.
 * Silencieux sur les navigateurs sans support (desktop) — no-op propre.
 * Intensités courtes pour ne pas saturer sur mobile.
 */
export function haptic(pattern: "light" | "success" | "error" | "medium" = "light") {
  if (typeof window === "undefined") return;
  // Son (sauf si mode NPD)
  if (!isDnd()) {
    switch (pattern) {
      case "success": playCorrect(); break;
      case "error": playWrong(); break;
      case "light": playFlip(); break;
    }
  }
  // Vibration
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (!nav.vibrate) return;
  const patterns: Record<typeof pattern, number | number[]> = {
    light: 10,
    medium: 25,
    success: [15, 40, 30],
    error: [40, 50, 40],
  };
  try {
    nav.vibrate(patterns[pattern]);
  } catch {
    /* ignore */
  }
}