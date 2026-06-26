import type { Course } from "./types";

/** Normalise une chaîne : sans accents, minuscule, espaces collapseés. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Construit le texte searchable d'un cours (titre + slides + résumé + cartes). */
function courseText(c: Course): string {
  const parts: string[] = [c.title];
  for (const s of c.slides) {
    parts.push(s.title, ...s.bullets, s.notes ?? "");
  }
  if (c.summary) {
    parts.push(c.summary.plainText, ...c.summary.keyPoints);
    for (const sec of c.summary.sections) parts.push(sec.heading, sec.content);
  }
  if (c.flashcards) {
    for (const f of c.flashcards) parts.push(f.front, f.back);
  }
  return parts.join(" ");
}

/** Vrai si le cours correspond à la query (insensible casse/accents). Query vide = toujours vrai. */
export function courseMatches(c: Course, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return normalize(courseText(c)).includes(q);
}

export type SortKey = "recent" | "progress" | "xp" | "title";

/** Trie une liste de cours : cours épinglés en premier, puis par clé de tri. Tri stable. */
export function sortCourses(courses: Course[], key: SortKey): Course[] {
  const byKey = (a: Course, b: Course): number => {
    switch (key) {
      case "progress":
        return b.progress - a.progress;
      case "xp":
        return b.xp - a.xp;
      case "title":
        return normalize(a.title).localeCompare(normalize(b.title));
      case "recent":
      default:
        return b.createdAt - a.createdAt;
    }
  };
  return [...courses].sort((a, b) => {
    const pa = a.pinned ? 1 : 0;
    const pb = b.pinned ? 1 : 0;
    if (pa !== pb) return pb - pa;
    return byKey(a, b);
  });
}