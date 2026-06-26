"use client";

import { useEffect, useState } from "react";
import { useCourses } from "./store";

const KEY = "study-app:onboarded:v1";

/**
 * Détermine s'il faut afficher l'onboarding au premier lancement.
 * Conditions : côté client (mounted), données prêtes, flag absent, aucun cours.
 */
export function useOnboarding() {
  const { courses, ready } = useCourses();
  const [mounted, setMounted] = useState(false);
  const [onboarded, setOnboarded] = useState(true);

  useEffect(() => {
    setMounted(true);
    setOnboarded(window.localStorage.getItem(KEY) === "true");
  }, []);

  const show = mounted && ready && !onboarded && courses.length === 0;

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, "true");
    } catch {
      /* ignore */
    }
    setOnboarded(true);
  };

  return { show, dismiss };
}