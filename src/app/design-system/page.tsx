import Link from "next/link";
import { ArrowLeft, Flame, Sparkles, Star } from "lucide-react";

/**
 * Cerebra — Référence du design system (fondation clay).
 *
 * Cette page est volontairement un échantillon vivant (et non un écran de
 * l'app) : elle documente la palette, la typographie et les primitives posées
 * dans globals.css pour garder la cohérence entre les itérations de la boucle.
 *
 * Accès : /design-system
 */
const SWATCHES = [
  { name: "bg", var: "--bg" },
  { name: "surface", var: "--surface" },
  { name: "surface-2", var: "--surface-2" },
  { name: "ink", var: "--ink" },
  { name: "clay", var: "--clay" },
  { name: "clay-deep", var: "--clay-deep" },
  { name: "gold", var: "--gold" },
  { name: "sage", var: "--sage" },
  { name: "petrol", var: "--petrol" },
  { name: "crimson", var: "--crimson" },
  { name: "line", var: "--line" },
  { name: "muted", var: "--muted" },
] as const;

export default function DesignSystemPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <Link
        href="/"
        className="cb-mono mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à l'app
      </Link>

      {/* En-tête */}
      <header className="mb-10">
        <div className="cb-stamp mb-4">Design system</div>
        <h1 className="font-heading text-4xl font-extrabold leading-none tracking-tight">
          Cerebra, en clay.
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
          Fondation visuelle synchronisée depuis <span className="cb-mono">Cerebra.dc.html</span>.
          Palette clay chaude, typographies Bricolage&nbsp;/&nbsp;Hanken&nbsp;/&nbsp;DM&nbsp;Mono,
          ombres offset néo-brutalistes et texture grain.
        </p>
      </header>

      {/* Palette */}
      <Section title="Palette" hint="Tokens natifs (--bg, --clay…) + mapping shadcn">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {SWATCHES.map((s) => (
            <div key={s.name} className="overflow-hidden rounded-xl border-2 border-[var(--line)]">
              <div className="h-16" style={{ background: `var(${s.var})` }} />
              <div className="bg-[var(--surface)] px-2.5 py-1.5">
                <div className="cb-mono text-[10px] uppercase tracking-wide text-foreground">{s.name}</div>
                <div className="cb-mono text-[9px] text-muted-foreground">{s.var}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Typographie */}
      <Section title="Typographie" hint="Bricolage (titres) · Hanken (corps) · DM Mono (code)">
        <div className="space-y-4">
          <div>
            <span className="cb-mono text-[10px] uppercase tracking-widest text-muted-foreground">Bricolage Grotesque — display</span>
            <h2 className="font-heading text-5xl font-extrabold leading-[0.95] tracking-tight">
              Un cours entier, prêt à réviser.
            </h2>
          </div>
          <div>
            <span className="cb-mono text-[10px] uppercase tracking-widest text-muted-foreground">Hanken Grotesk — corps</span>
            <p className="text-pretty text-foreground">
              Dépose un PowerPoint, un PDF ou colle tes notes. Cerebra en tire un résumé,
              des flashcards et un quiz, automatiquement.
            </p>
          </div>
          <div>
            <span className="cb-mono text-[10px] uppercase tracking-widest text-muted-foreground">DM Mono — mono</span>
            <p className="cb-mono text-sm text-muted-foreground">PPTX · PDF · DOCX — 0 → 100%</p>
          </div>
        </div>
      </Section>

      {/* Cartes */}
      <Section title="Cartes" hint=".cb-card (offset encre) · .cb-card-line (ombre douce)">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="cb-card p-5">
            <div className="cb-tile mb-3 h-12 w-12 bg-[var(--clay)] text-[#FBF6EC]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-lg font-bold">Carte néo-brutaliste</h3>
            <p className="mt-1 text-sm text-muted-foreground">Bordure encre 2px, ombre offset 5px.</p>
          </div>
          <div className="cb-card-line p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="cb-stamp">Leçon</span>
            </div>
            <h3 className="font-heading text-lg font-bold">Carte douce</h3>
            <p className="mt-1 text-sm text-muted-foreground">Bordure ligne, ombre teintée clay.</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold">
              <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" /> 240 XP
            </div>
          </div>
        </div>
      </Section>

      {/* Boutons & pilules */}
      <Section title="Boutons &amp; pilules" hint=".cb-btn · .cb-btn-primary · .cb-pill">
        <div className="flex flex-wrap items-center gap-3">
          <button className="cb-btn-primary cb-btn px-5 py-3">Commencer</button>
          <button className="cb-btn px-5 py-3">À revoir</button>
          <button className="cb-btn px-5 py-3" style={{ background: "var(--sage)", color: "#fff", boxShadow: "4px 4px 0 var(--ink)" }}>
            Je savais
          </button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button className="cb-pill px-3 py-1.5 text-sm" data-active="true">Parcours</button>
          <button className="cb-pill px-3 py-1.5 text-sm">Résumé</button>
          <button className="cb-pill px-3 py-1.5 text-sm">Cartes</button>
          <button className="cb-pill px-3 py-1.5 text-sm">Quiz</button>
          <button className="cb-pill px-3 py-1.5 text-sm">Stats</button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border-2 border-[var(--gold)] bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
            <Flame className="h-4 w-4 fill-[var(--gold)] text-[var(--clay-deep)]" /> 5 jours
          </span>
          <span className="cb-stamp">Objectif du jour</span>
        </div>
      </Section>

      {/* Grain & animations */}
      <Section title="Grain &amp; motion" hint=".cb-grain · animate-cb-pop / float / pulse / shimmer">
        <div className="cb-grain cb-card-line p-5">
          <p className="text-sm text-muted-foreground">
            Cette carte porte une couche grain (.cb-grain) superposée en multiply à 5%.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="cb-card px-4 py-2 animate-cb-pop">pop</span>
          <span className="cb-card px-4 py-2 animate-cb-float">float</span>
          <span className="cb-card px-4 py-2 animate-cb-pulse">pulse</span>
          <span className="cb-mono text-sm">
            <span
              className="inline-block h-4 w-24 rounded bg-[linear-gradient(90deg,var(--surface-2)_25%,var(--line)_37%,var(--surface-2)_63%)] animate-cb-shimmer align-middle"
            />
            {" "}shimmer
          </span>
        </div>
      </Section>

      <p className="cb-mono mt-12 text-xs text-muted-foreground">
        v0.1.0 — fondation design synchronisée depuis le projet Claude Design « Application à reproduire ».
      </p>
    </main>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold tracking-tight">{title}</h2>
        {hint && <span className="cb-mono text-[10px] uppercase tracking-widest text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </section>
  );
}