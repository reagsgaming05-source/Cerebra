"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCourses, downloadCoursesJson, mergeCourses, clearAllCourses } from "@/lib/store";
import type { Course } from "@/lib/types";
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

/** Exporte le résumé d'un cours en PDF via l'impression navigateur. */
function exportSummaryPdf(courses: Course[]) {
  if (courses.length === 0) { toast.error("Aucun cours à exporter."); return; }
  const win = window.open("", "_blank");
  if (!win) { toast.error("Autorise les popups pour l'export PDF."); return; }
  const allHtml = courses.map((c) => {
    const summary = c.summary;
    if (!summary) return "";
    return `<section style="page-break-after:always;font-family:sans-serif;max-width:800px;margin:0 auto;padding:20px">
      <h1 style="font-size:22px;margin-bottom:4px">${c.title}</h1>
      <p style="font-size:12px;color:#666;margin-bottom:16px">${c.slides.length} slides · ${c.xp} XP</p>
      ${summary.intro ? `<p style="font-size:14px;line-height:1.6;margin-bottom:16px">${summary.intro}</p>` : ""}
      ${summary.sections.map((s) => `<div style="margin-bottom:12px"><h2 style="font-size:16px;margin-bottom:4px">${s.heading}</h2><p style="font-size:13px;line-height:1.5;margin:0">${s.content}</p></div>`).join("")}
      ${summary.keyPoints.length > 0 ? `<div style="margin-top:12px"><h3 style="font-size:14px">Points clés</h3><ul>${summary.keyPoints.map((k) => `<li style="font-size:12px;margin-bottom:4px">${k}</li>`).join("")}</ul></div>` : ""}
    </section>`;
  }).filter(Boolean).join("");
  if (!allHtml) { toast.error("Aucun résumé à exporter. Génère d'abord les résumés."); win.close(); return; }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cerebra — Résumés</title><style>@media print{@page{margin:1.5cm}}body{color:#222}</style></head><body>${allHtml}</body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 500);
  toast.success("Impression prête, utilise Ctrl+P ou Cmd+P.");
}

/** Exporte les flashcards de tous les cours au format CSV Anki (front,back). */
function exportAnkiCsv(courses: Course[]) {
  const rows: string[] = ["front,back"];
  for (const c of courses) {
    for (const fc of c.flashcards ?? []) {
      const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
      rows.push(`${escape(fc.front)},${escape(fc.back)}`);
    }
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cerebra-anki-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success(`Exporté ${rows.length - 1} flashcards au format Anki.`);
}

/** Zone données : export / import JSON + reset de tous les cours + suppression compte (démo). */
export function DataSettings() {
  const { courses } = useCourses();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleImport(file: File) {
    setImporting(true);
    const t = toast.loading("Import du fichier…");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming: Course[] = Array.isArray(parsed) ? parsed : parsed?.courses;
      if (!Array.isArray(incoming)) throw new Error("Format invalide");
      const { added, skipped } = mergeCourses(incoming);
      toast.success(`${added} cours importé${added > 1 ? "s" : ""}`, {
        description: skipped > 0 ? `${skipped} déjà présents ignorés.` : undefined,
        id: t,
      });
    } catch (e) {
      toast.error("Import impossible", { description: (e as Error).message, id: t });
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      {/* Données */}
      <div className="cb-mono mb-2.5 mt-2 px-1 text-[10.5px] font-medium uppercase tracking-[1.4px] text-[var(--muted-ink)]">
        Données
      </div>
      <div className="mb-[22px] overflow-hidden rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)]">
        <button
          onClick={() => downloadCoursesJson()}
          disabled={courses.length === 0}
          data-press
          className="block w-full min-h-11 border-b-[1.5px] border-[var(--line)] px-4 py-[15px] text-left text-[15px] font-semibold text-[var(--ink)] disabled:opacity-50"
        >
          Exporter mes cours (JSON)
        </button>
        <button
          onClick={() => exportAnkiCsv(courses)}
          disabled={courses.length === 0}
          data-press
          className="block w-full min-h-11 border-b-[1.5px] border-[var(--line)] px-4 py-[15px] text-left text-[15px] font-semibold text-[var(--ink)] disabled:opacity-50"
        >
          Exporter les flashcards (CSV Anki)
        </button>
        <button
          onClick={() => exportSummaryPdf(courses)}
          disabled={courses.length === 0}
          data-press
          className="block w-full min-h-11 px-4 py-[15px] text-left text-[15px] font-semibold text-[var(--ink)] disabled:opacity-50"
        >
          Exporter les résumés (PDF)
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          data-press
          className="block w-full min-h-11 px-4 py-[15px] text-left text-[15px] font-semibold text-[var(--ink)] disabled:opacity-50"
        >
          Importer des cours
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImport(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Zone sensible */}
      <div className="cb-mono mb-2.5 mt-2 px-1 text-[10.5px] font-medium uppercase tracking-[1.4px] text-[var(--crimson)]">
        Zone sensible
      </div>
      <div className="mb-[22px] overflow-hidden rounded-2xl border-2 bg-[var(--surface)]" style={{ borderColor: "rgba(190,58,43,0.4)" }}>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                disabled={courses.length === 0}
                data-press
                className="block w-full min-h-11 px-4 py-[15px] text-left text-[15px] font-semibold text-[var(--crimson)] disabled:opacity-50"
                style={{ borderBottom: "1.5px solid rgba(190,58,43,0.2)" }}
              />
            }
          >
            Effacer tous les cours
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Effacer tous les cours ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprime définitivement les {courses.length} cours
                et toute leur progression. Pense à exporter d'abord si besoin.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  clearAllCourses();
                  toast.success("Tous les cours ont été effacés.");
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Tout effacer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <button
                data-press
                className="block w-full min-h-11 px-4 py-[15px] text-left text-[15px] font-bold text-[var(--crimson)]"
              />
            }
          >
            Supprimer mon compte
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le compte ?</AlertDialogTitle>
              <AlertDialogDescription>
                Ton compte, tes cours et toutes tes données seront supprimés
                définitivement. Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => toast.success("Compte supprimé (démo)")}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer le compte
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}