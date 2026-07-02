import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cerebra — Cercle Privé",
  description:
    "Le Cercle Privé de Cerebra. Un cercle fermé, sur cooptation, réservé aux membres choisis par la maison.",
};

/**
 * Cercle Privé — direction artistique « luxe ».
 *
 * En rupture volontaire avec l'identité clay / néo-brutaliste du reste de
 * l'app : fond espresso profond, hairlines champagne, typographie aérée et
 * lettrage large. Palette locale (valeurs explicites) pour rester identique
 * en thème clair comme sombre — le luxe ne change pas d'avis.
 *
 * Server component — page statique, navigation via next/link.
 */

// Palette locale « maison »
const NOIR = "#14100B"; // espresso profond
const NOIR_2 = "#1C1710"; // carte
const OR = "#CBA35A"; // or champagne
const OR_CLAIR = "#E8CE94"; // or clair (titres)
const CREME = "#F3EAD8"; // texte
const CREME_ESTOMPE = "#A99A82"; // texte estompé
const HAIRLINE = "rgba(203,163,90,0.22)";

const PRIVILEGES: { titre: string; texte: string }[] = [
  {
    titre: "Sélection à la main",
    texte:
      "Chaque membre est choisi par la maison. Aucune inscription, aucune file d'attente — seulement une invitation.",
  },
  {
    titre: "Cours d'exception",
    texte:
      "Un accès anticipé aux parcours signés, préparés en petit comité et jamais rendus publics.",
  },
  {
    titre: "Conciergerie d'étude",
    texte:
      "Un accompagnement discret et personnel. Vos demandes sont traitées en priorité, sans intermédiaire.",
  },
  {
    titre: "Cercle restreint",
    texte:
      "Un nombre de places volontairement limité. La rareté n'est pas une contrainte : c'est le principe.",
  },
];

export default function CerclePrivePage() {
  return (
    <main
      className="cb-grain relative min-h-full overflow-hidden"
      style={{ background: NOIR, color: CREME }}
    >
      {/* Halo doré diffus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(203,163,90,0.18) 0%, rgba(203,163,90,0) 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[720px] px-6 pb-24 sm:px-8">
        {/* ===== NAV ===== */}
        <nav className="flex items-center justify-between pt-8 sm:pt-10">
          <Link
            href="/"
            data-press
            className="flex items-center gap-2 text-[12px] font-medium tracking-[1.5px]"
            style={{ color: CREME_ESTOMPE }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="cb-mono uppercase">Accueil</span>
          </Link>
          <span
            className="cb-mono text-[10px] uppercase tracking-[3px]"
            style={{ color: OR }}
          >
            Cerebra
          </span>
        </nav>

        {/* ===== HERO ===== */}
        <header className="pt-20 text-center sm:pt-28">
          {/* Sceau monogramme */}
          <div className="flex justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                border: `1px solid ${OR}`,
                boxShadow: `0 0 0 6px ${NOIR}, 0 0 0 7px ${HAIRLINE}`,
              }}
            >
              <span
                className="font-heading text-[26px] font-extrabold tracking-[1px]"
                style={{ color: OR_CLAIR }}
              >
                CP
              </span>
            </div>
          </div>

          {/* Filet + label */}
          <div className="mt-9 flex items-center justify-center gap-3">
            <span className="h-px w-8" style={{ background: HAIRLINE }} />
            <span
              className="cb-mono text-[10px] uppercase tracking-[4px]"
              style={{ color: OR }}
            >
              Sur invitation
            </span>
            <span className="h-px w-8" style={{ background: HAIRLINE }} />
          </div>

          <h1
            className="mt-6 font-heading text-[46px] font-extrabold leading-[0.95] tracking-[-1px] sm:text-[62px]"
            style={{ color: CREME }}
          >
            Le Cercle
            <br />
            <span style={{ color: OR_CLAIR }}>Privé</span>
          </h1>

          <p
            className="mx-auto mt-7 max-w-[46ch] text-[15.5px] leading-[1.7]"
            style={{ color: CREME_ESTOMPE }}
          >
            Un cercle fermé, tenu à l'écart du reste. On n'y entre pas —
            on y est convié. Les membres sont choisis, un à un, par la maison.
          </p>
        </header>

        {/* ===== MANIFESTE ===== */}
        <section className="mt-24">
          <div
            className="rounded-[4px] px-8 py-12 text-center"
            style={{ border: `1px solid ${HAIRLINE}`, background: NOIR_2 }}
          >
            <span
              className="cb-mono text-[10px] uppercase tracking-[3px]"
              style={{ color: OR }}
            >
              La maison
            </span>
            <p
              className="mx-auto mt-6 max-w-[40ch] font-heading text-[22px] font-medium leading-[1.5] tracking-[-0.3px] sm:text-[26px]"
              style={{ color: CREME }}
            >
              « Nous ne cherchons pas le plus grand nombre.
              Nous cherchons les bons. »
            </p>
          </div>
        </section>

        {/* ===== PRIVILÈGES ===== */}
        <section className="mt-24">
          <div className="mb-12 text-center">
            <span
              className="cb-mono text-[10px] uppercase tracking-[4px]"
              style={{ color: OR }}
            >
              Ce que le cercle réserve
            </span>
          </div>

          <div className="grid gap-px sm:grid-cols-2" style={{ background: HAIRLINE }}>
            {PRIVILEGES.map((p, i) => (
              <div
                key={p.titre}
                className="px-7 py-9"
                style={{ background: NOIR }}
              >
                <span
                  className="cb-mono text-[11px]"
                  style={{ color: OR }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="mt-4 font-heading text-[19px] font-bold tracking-[-0.2px]"
                  style={{ color: OR_CLAIR }}
                >
                  {p.titre}
                </h3>
                <p
                  className="mt-3 text-[14px] leading-[1.65]"
                  style={{ color: CREME_ESTOMPE }}
                >
                  {p.texte}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== COOPTATION / CTA ===== */}
        <section className="mt-24 text-center">
          <div className="mx-auto flex max-w-[52ch] flex-col items-center">
            <span
              className="cb-mono text-[10px] uppercase tracking-[4px]"
              style={{ color: OR }}
            >
              Par cooptation uniquement
            </span>
            <h2
              className="mt-6 font-heading text-[30px] font-extrabold leading-[1.1] tracking-[-0.6px] sm:text-[38px]"
              style={{ color: CREME }}
            >
              L'entrée se mérite,
              <br /> elle ne se demande pas.
            </h2>
            <p
              className="mt-6 max-w-[42ch] text-[14.5px] leading-[1.7]"
              style={{ color: CREME_ESTOMPE }}
            >
              Si votre nom doit figurer dans le cercle, il nous parviendra.
              Vous pouvez néanmoins nous laisser une marque de votre intérêt —
              elle sera étudiée en toute discrétion.
            </p>

            <a
              href="mailto:cercle@cerebra.app?subject=Cercle%20Priv%C3%A9%20%E2%80%94%20Marque%20d%27int%C3%A9r%C3%AAt"
              data-press
              className="mt-10 inline-flex items-center gap-2.5 rounded-[3px] px-9 py-4 font-heading text-[14px] font-bold tracking-[0.5px] transition-colors"
              style={{
                background: OR,
                color: NOIR,
                boxShadow: "0 12px 40px -16px rgba(203,163,90,0.55)",
              }}
            >
              Solliciter le cercle
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>

            <p
              className="cb-mono mt-6 text-[10px] uppercase tracking-[2px]"
              style={{ color: CREME_ESTOMPE }}
            >
              Réponse sous sept jours · sans garantie
            </p>
          </div>
        </section>

        {/* ===== SIGNATURE ===== */}
        <footer className="mt-24 text-center">
          <div className="mx-auto mb-8 h-px w-16" style={{ background: HAIRLINE }} />
          <span
            className="font-heading text-[15px] font-extrabold tracking-[3px]"
            style={{ color: OR }}
          >
            CEREBRA
          </span>
          <p
            className="cb-mono mt-3 text-[10px] uppercase tracking-[2px]"
            style={{ color: CREME_ESTOMPE }}
          >
            Cercle Privé · Maison d'étude
          </p>
        </footer>
      </div>
    </main>
  );
}
