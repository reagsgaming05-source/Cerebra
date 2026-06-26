"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker et gère le prompt d'installation PWA.
 */
export function PwaSetup() {
  useEffect(() => {
    // Service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("[PWA] Service worker enregistré"))
        .catch(() => console.warn("[PWA] Échec d'enregistrement du service worker"));
    }
  }, []);

  return null;
}
