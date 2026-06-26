/** Date relative lisible : "Aujourd'hui", "Hier", "Il y a X j" (≤ 7j), sinon YYYY-MM-DD. "Jamais" si absent. */
export function formatRelativeDate(ts?: number): string {
  if (!ts) return "Jamais";
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor((Date.now() - ts) / day);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days <= 7) return `Il y a ${days} j`;
  return new Date(ts).toISOString().slice(0, 10);
}