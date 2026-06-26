"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Course,
  Flashcard,
  LearningNode,
  QuizConfig,
  QuizQuestion,
  Summary,
} from "./types";

const KEY = "study-app:courses:v1";

function read(): Course[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const courses = JSON.parse(raw) as Course[];
    // Migration : ajoute les mini-jeux introduits après coup (Mélange-mots,
    // Carte conceptuelle) aux cours créés avant leur ajout.
    const needsMigration = courses.some(
      (c) =>
        c.nodes &&
        INSERT_BEFORE_EXPERT.some((def) => !c.nodes.some((n) => n.type === def.type)),
    );
    if (needsMigration) {
      const migrated = courses.map(migrateCourse);
      window.localStorage.setItem(KEY, JSON.stringify(migrated));
      return migrated;
    }
    return courses;
  } catch {
    return [];
  }
}

function write(courses: Course[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(courses));
  window.dispatchEvent(new CustomEvent("study-app:courses-changed"));
}

export function genId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/** Remplace toute la base locale de cours par une nouvelle liste. */
export function replaceAllCourses(courses: Course[]) {
  write(courses);
}

/** Fusionne des cours importés : ajoute ceux dont l'id n'existe pas déjà. */
export function mergeCourses(incoming: Course[]): { added: number; skipped: number } {
  const all = read();
  const existingIds = new Set(all.map((c) => c.id));
  const toAdd = incoming.filter((c) => c && c.id && !existingIds.has(c.id));
  const skipped = incoming.length - toAdd.length;
  write([...toAdd, ...all]);
  return { added: toAdd.length, skipped };
}

/** Efface tous les cours. */
export function clearAllCourses() {
  write([]);
}

/** Exporte tous les cours en JSON et déclenche le téléchargement navigateur. */
export function downloadCoursesJson() {
  const data = JSON.stringify({ app: "cerebra", version: 1, exportedAt: Date.now(), courses: read() }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cerebra-cours-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Construit le squelette du parcours d'apprentissage pour un nouveau cours. */
export function buildNodes(): LearningNode[] {
  const defs: { type: LearningNode["type"]; title: string; description: string; xp: number }[] = [
    { type: "summary", title: "Résumé du cours", description: "Lis le résumé généré par l'IA.", xp: 10 },
    { type: "flashcards", title: "Cartes mémoire", description: "Mémorise les concepts clés.", xp: 20 },
    { type: "matching", title: "Association", description: "Relie chaque terme à sa définition.", xp: 25 },
    { type: "quiz", title: "Quiz de validation", description: "Teste tes connaissances.", xp: 30 },
    { type: "speed", title: "Défi rapidité", description: "Réponds vite aux flashcards.", xp: 40 },
    { type: "anagram", title: "Mélange-mots", description: "Reconstitue chaque terme à partir de sa définition.", xp: 45 },
    { type: "fill-blank", title: "Texte à trous", description: "Retrouve le terme manquant dans les phrases du cours.", xp: 46 },
    { type: "true-false", title: "Vrai ou Faux", description: "Démêle le vrai du faux sur les concepts du cours.", xp: 47 },
    { type: "concept-map", title: "Carte conceptuelle", description: "Replace les concepts au bon endroit du schéma.", xp: 48 },
    { type: "quiz", title: "Quiz expert", description: "QCM difficile pour valider la mastery.", xp: 50 },
  ];
  return defs.map((d, i) => ({
    id: `node_${i}`,
    type: d.type,
    title: d.title,
    description: d.description,
    xp: d.xp,
    order: i,
    unlocked: i === 0,
    completed: false,
    bestScore: 0,
  }));
}

export function recomputeProgress(nodes: LearningNode[]): { progress: number; xp: number } {
  const total = nodes.length;
  const done = nodes.filter((n) => n.completed).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  const xp = nodes.filter((n) => n.completed).reduce((s, n) => s + n.xp, 0);
  return { progress, xp };
}

/** Mini-jeux introduits après coup, à réinsérer avant le Quiz expert. */
const INSERT_BEFORE_EXPERT: {
  type: LearningNode["type"];
  title: string;
  description: string;
  xp: number;
  idPrefix: string;
}[] = [
  {
    type: "anagram" as const,
    title: "Mélange-mots",
    description: "Reconstitue chaque terme à partir de sa définition.",
    xp: 45,
    idPrefix: "anagram",
  },
  {
    type: "fill-blank" as const,
    title: "Texte à trous",
    description: "Retrouve le terme manquant dans les phrases du cours.",
    xp: 46,
    idPrefix: "fb",
  },
  {
    type: "true-false" as const,
    title: "Vrai ou Faux",
    description: "Démêle le vrai du faux sur les concepts du cours.",
    xp: 47,
    idPrefix: "tf",
  },
  {
    type: "concept-map" as const,
    title: "Carte conceptuelle",
    description: "Replace les concepts au bon endroit du schéma.",
    xp: 48,
    idPrefix: "cmap",
  },
];

/** Migration : réinsère les mini-jeux manquants avant le Quiz expert. */
function migrateCourse(course: Course): Course {
  let nodes = [...(course.nodes ?? [])].sort((a, b) => a.order - b.order);
  let changed = false;
  for (const def of INSERT_BEFORE_EXPERT) {
    if (nodes.some((n) => n.type === def.type)) continue;
    changed = true;
    // Insère juste avant le "Quiz expert" (type quiz d'ordre >= 5), sinon à la fin.
    const expertIdx = nodes.findIndex((n) => n.type === "quiz" && n.order >= 5);
    const insertAt = expertIdx >= 0 ? expertIdx : nodes.length;
    const newNode: LearningNode = {
      id: `node_${def.idPrefix}_${course.id}`,
      type: def.type,
      title: def.title,
      description: def.description,
      xp: def.xp,
      order: insertAt,
      unlocked: false,
      completed: false,
      bestScore: 0,
    };
    nodes = [...nodes.slice(0, insertAt), newNode, ...nodes.slice(insertAt)].map((n, i) => ({
      ...n,
      order: i,
    }));
  }
  if (!changed) return course;
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].unlocked = i === 0 || nodes.slice(0, i).every((p) => p.completed);
  }
  const { progress, xp } = recomputeProgress(nodes);
  return { ...course, nodes, progress, xp };
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCourses(read());
    setReady(true);
    const onChange = () => setCourses(read());
    window.addEventListener("study-app:courses-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("study-app:courses-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const upsert = useCallback((course: Course) => {
    const all = read();
    const idx = all.findIndex((c) => c.id === course.id);
    if (idx >= 0) all[idx] = course;
    else all.unshift(course);
    write(all);
    setCourses(all);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((c) => c.id !== id));
    setCourses(read());
  }, []);

  const archive = useCallback((id: string) => {
    const all = read().map((c) => c.id === id ? { ...c, archived: !c.archived } : c);
    write(all);
    setCourses(read());
  }, []);

  const togglePin = useCallback((id: string) => {
    const all = read().map((c) =>
      c.id === id ? { ...c, pinned: !c.pinned } : c
    );
    write(all);
    setCourses(all);
  }, []);

  const get = useCallback((id: string) => read().find((c) => c.id === id) ?? null, []);

  const duplicate = useCallback((id: string) => {
    const all = read();
    const original = all.find((c) => c.id === id);
    if (!original) return;
    const copy: Course = {
      ...JSON.parse(JSON.stringify(original)),
      id: genId("course"),
      title: `${original.title} (copie)`,
      createdAt: Date.now(),
      progress: 0,
      xp: 0,
      nodes: buildNodes(),
      pinned: false,
      lastStudiedAt: undefined,
    };
    write([copy, ...all]);
    setCourses(read());
    return copy.id;
  }, []);

  return { courses, ready, upsert, remove, togglePin, get, duplicate, archive };
}

export function completeNode(
  course: Course,
  nodeId: string,
  score: number,
): Course {
  const nodes = course.nodes.map((n) => {
    if (n.id === nodeId) {
      return {
        ...n,
        completed: true,
        bestScore: Math.max(n.bestScore, score),
        attempts: (n.attempts ?? 0) + 1,
      };
    }
    return n;
  });
  // débloquer le noeud suivant le premier non complété
  let unlockedOne = false;
  const ordered = [...nodes].sort((a, b) => a.order - b.order);
  for (const n of ordered) {
    if (!n.completed && !unlockedOne) {
      n.unlocked = true;
      unlockedOne = true;
    } else if (!unlockedOne) {
      n.unlocked = true;
    }
  }
  // re-mapper sur l'ordre original
  const finalNodes = nodes.map((n) => {
    const updated = ordered.find((o) => o.id === n.id)!;
    return { ...n, unlocked: updated.unlocked };
  });
  const { progress, xp } = recomputeProgress(finalNodes);
  return { ...course, nodes: finalNodes, progress, xp, lastStudiedAt: Date.now() };
}