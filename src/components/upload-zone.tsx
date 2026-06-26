"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useCourses, genId, buildNodes, recomputeProgress } from "@/lib/store";
import type { Course } from "@/lib/types";

export function UploadZone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { upsert } = useCourses();

  async function handleFile(file: File) {
    const isPptx = /\.pptx$/i.test(file.name);
    const isPdf = /\.pdf$/i.test(file.name);
    const isDocx = /\.docx$/i.test(file.name);
    if (!isPptx && !isPdf && !isDocx) {
      toast.error("Format non supporté", { description: "Dépose un fichier .pptx, .pdf ou .docx" });
      return;
    }
    setLoading(true);
    const t = toast.loading("Analyse du document…");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("filename", file.name);
      const endpoint = isPdf ? "/api/parse-pdf" : isDocx ? "/api/parse-docx" : "/api/parse-pptx";
      const res = await fetch(endpoint, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec du parsing");

      const nodes = buildNodes();
      const { progress, xp } = recomputeProgress(nodes);
      const course: Course = {
        id: genId("course"),
        title: data.title,
        createdAt: Date.now(),
        slides: data.slides,
        quizRuns: 0,
        nodes,
        progress,
        xp,
      };
      upsert(course);
      toast.success("Cours importé", {
        description: `${data.slides.length} pages extraite${data.slides.length > 1 ? "s" : ""}.`,
        id: t,
      });
      router.push(`/course/${course.id}`);
    } catch (e) {
      toast.error("Import impossible", { description: (e as Error).message, id: t });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      data-press
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
      onClick={() => inputRef.current?.click()}
      className={`mt-1 cursor-pointer rounded-[20px] border-[2.5px] border-dashed bg-[var(--surface)] p-5 text-center transition-colors ${
        drag ? "border-[var(--clay)]" : "border-[var(--line)]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pptx,.pdf,.docx"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <div
        className="cb-tile mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center text-[var(--clay)]"
        style={{ transform: "rotate(-3deg)" }}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <UploadCloud className="h-6 w-6" strokeWidth={2} />
        )}
      </div>
      <p className="mb-0.5 font-heading text-base font-bold">
        {loading ? "Analyse en cours…" : "Importer un cours"}
      </p>
      <p className="cb-mono text-[10.5px] uppercase tracking-[1px] text-[var(--muted-ink)]">
        {loading ? "Patiente quelques secondes" : "PPTX · PDF · DOCX"}
      </p>
    </div>
  );
}