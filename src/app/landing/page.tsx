import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Cerebra — Révise plus malin",
  description:
    "Transforme n'importe quel cours en résumé, flashcards et quiz. Automatiquement.",
};

/**
 * Landing marketing de Cerebra.
 * Reprend le contenu visuel de la maquette (bloc isLanding de Cerebra.dc.html),
 * adapté au web responsive : conteneur max-w, espacements confortables,
 * grille desktop, tout en conservant l'identité clay / néo-brutaliste.
 *
 * Server component — aucun état nécessaire, navigation via next/link.
 */
export default function LandingPage() {
  return (
    <main
      className="cb-grain min-h-full bg-[var(--bg)] text-[var(--ink)]"
      style={{ backgroundImage: "var(--bg)" }}
    >
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-8">
        {/* ===== NAV ===== */}
        <nav className="flex items-center justify-between pt-8 sm:pt-10">
          <Link
            href="/landing"
            className="flex items-center gap-2.5"
            data-press
          >
            <span
              className="cb-tile flex h-[30px] w-[30px] items-center justify-center text-[#FBF6EC]"
              style={{ background: "var(--clay)" }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.1}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 18V8a3 3 0 0 1 6 0M5 12a5 5 0 0 1 5-5M19 12a5 5 0 0 0-5-5M7.5 20h9" />
              </svg>
            </span>
            <span className="font-heading text-[19px] font-extrabold tracking-[-0.5px]">
              Cerebra
            </span>
          </Link>

          <Link
            href="/login"
            data-press
            className="px-2 py-2 text-[13.5px] font-bold text-[var(--muted-ink)] transition-colors hover:text-[var(--ink)]"
          >
            Se connecter
          </Link>
        </nav>

        {/* ===== HERO ===== */}
        <section className="pt-14 sm:pt-20 lg:pt-28">
          <div className="max-w-3xl">
            <div className="cb-mono mb-5 text-[10px] font-medium uppercase tracking-[2.5px] text-[var(--clay)]">
              App d'étude
            </div>
            <h1 className="m-0 font-heading text-[44px] font-extrabold leading-[1.0] tracking-[-1.8px] sm:text-[58px] lg:text-[72px] lg:tracking-[-2.4px]">
              Révise
              <br className="sm:hidden" /> plus malin.
            </h1>
            <p className="mt-6 max-w-md text-[16.5px] leading-[1.55] text-[var(--muted-ink)] sm:text-[17.5px]">
              Transforme n'importe quel cours en résumé, flashcards et quiz.
              Automatiquement.
            </p>
          </div>
        </section>

        {/* ===== HERO VISUAL : carte preview quiz ===== */}
        <section className="pt-10 sm:pt-14">
          <div className="mx-auto max-w-md sm:max-w-lg">
            <div
              className="animate-cb-float"
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--line)",
                borderRadius: "22px",
                padding: "22px",
                boxShadow:
                  "0 18px 40px -22px color-mix(in oklab, var(--clay) 55%, transparent)",
              }}
            >
              <div className="cb-mono mb-3.5 text-[9.5px] font-medium uppercase tracking-[1.5px] text-[var(--clay)]">
                Quiz · Question 1
              </div>
              <div className="mb-4 font-heading text-[18px] font-bold leading-[1.25]">
                Quel organite produit l'énergie de la cellule ?
              </div>
              <div className="flex flex-col gap-2.5">
                {/* Option correcte */}
                <div
                  className="flex items-center gap-3 rounded-[13px] px-3.5 py-3"
                  style={{
                    background: "color-mix(in oklab, var(--sage) 14%, transparent)",
                    border: "1.5px solid var(--sage)",
                  }}
                >
                  <span
                    className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] text-[11px] font-extrabold text-white"
                    style={{ background: "var(--sage)" }}
                  >
                    B
                  </span>
                  <span className="text-[14.5px] font-semibold">La mitochondrie</span>
                  <Check
                    className="ml-auto"
                    size={17}
                    strokeWidth={2.6}
                    color="var(--sage)"
                  />
                </div>
                {/* Option neutre */}
                <div
                  className="flex items-center gap-3 rounded-[13px] px-3.5 py-3"
                  style={{
                    background: "var(--bg)",
                    border: "1.5px solid var(--line)",
                  }}
                >
                  <span
                    className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] text-[11px] font-extrabold text-[var(--muted-ink)]"
                    style={{ background: "var(--surface-2)" }}
                  >
                    C
                  </span>
                  <span className="text-[14.5px] font-semibold text-[var(--muted-ink)]">
                    Le ribosome
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA principal ===== */}
        <section className="pt-9 sm:pt-12">
          <div className="mx-auto max-w-md sm:max-w-lg">
            <Link
              href="/"
              data-press
              className="block w-full rounded-2xl px-6 py-[18px] text-center font-heading text-[17px] font-bold text-[var(--bg)]"
              style={{
                background: "var(--ink)",
                boxShadow: "4px 4px 0 var(--clay)",
                border: "2.5px solid var(--ink)",
              }}
            >
              Commencer gratuitement
            </Link>
            <p className="cb-mono mt-3.5 text-center text-[10px] font-medium uppercase tracking-[1px] text-[var(--muted-ink)]">
              Sans carte bancaire
            </p>
          </div>
        </section>

        {/* ===== COMMENT ÇA MARCHE ===== */}
        <section className="pt-16 sm:pt-24 lg:pt-28">
          <h2 className="m-0 mb-7 font-heading text-[24px] font-extrabold tracking-[-0.5px] sm:text-[28px]">
            Comment ça marche
          </h2>
          <div className="flex flex-col">
            {/* Étape 01 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center flex-none">
                <span className="cb-mono flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-[12px] font-medium text-[var(--clay)]"
                  style={{ border: "1.5px solid var(--line)" }}
                >
                  01
                </span>
                <div
                  className="my-1.5 w-[1.5px] flex-1"
                  style={{ background: "var(--line)" }}
                />
              </div>
              <div className="pb-6">
                <h3 className="m-0 mb-1 font-heading text-[16.5px] font-bold">
                  Importe ton cours
                </h3>
                <p className="m-0 text-[14px] leading-[1.5] text-[var(--muted-ink)]">
                  PowerPoint, PDF, Word ou simple copier-coller.
                </p>
              </div>
            </div>
            {/* Étape 02 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center flex-none">
                <span className="cb-mono flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-[12px] font-medium text-[var(--clay)]"
                  style={{ border: "1.5px solid var(--line)" }}
                >
                  02
                </span>
                <div
                  className="my-1.5 w-[1.5px] flex-1"
                  style={{ background: "var(--line)" }}
                />
              </div>
              <div className="pb-6">
                <h3 className="m-0 mb-1 font-heading text-[16.5px] font-bold">
                  Cerebra génère tout
                </h3>
                <p className="m-0 text-[14px] leading-[1.5] text-[var(--muted-ink)]">
                  Résumé, flashcards et quiz en quelques secondes.
                </p>
              </div>
            </div>
            {/* Étape 03 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center flex-none">
                <span className="cb-mono flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-[12px] font-medium text-[var(--clay)]"
                  style={{ border: "1.5px solid var(--clay)" }}
                >
                  03
                </span>
              </div>
              <div>
                <h3 className="m-0 mb-1 font-heading text-[16.5px] font-bold">
                  Révise en jouant
                </h3>
                <p className="m-0 text-[14px] leading-[1.5] text-[var(--muted-ink)]">
                  Parcours, séries et XP pour garder le rythme.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PREUVE ===== */}
        <section className="pt-16 sm:pt-20">
          <div className="flex items-center justify-center gap-7 sm:gap-10">
            <div className="text-center">
              <div className="font-heading text-[30px] font-extrabold leading-none tracking-[-1px] sm:text-[36px]">
                12k+
              </div>
              <div className="cb-mono mt-1.5 text-[9.5px] font-medium uppercase tracking-[1px] text-[var(--muted-ink)]">
                Étudiants
              </div>
            </div>
            <div
              className="h-[34px] w-[1.5px]"
              style={{ background: "var(--line)" }}
            />
            <div className="text-center">
              <div
                className="font-heading text-[30px] font-extrabold leading-none tracking-[-1px] sm:text-[36px]"
                style={{ color: "var(--clay)" }}
              >
                4,8
              </div>
              <div className="cb-mono mt-1.5 text-[9.5px] font-medium uppercase tracking-[1px] text-[var(--muted-ink)]">
                App Store
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <section className="pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div
            className="pt-9 text-center sm:pt-10"
            style={{ borderTop: "1.5px solid var(--line)" }}
          >
            <h2 className="m-0 mb-5 font-heading text-[24px] font-extrabold leading-[1.1] tracking-[-0.6px] sm:text-[30px]">
              Prêt à réviser autrement ?
            </h2>
            <div className="mx-auto flex max-w-md flex-col items-center sm:max-w-lg">
              <Link
                href="/"
                data-press
                className="block w-full rounded-2xl px-6 py-[18px] text-center font-heading text-[17px] font-bold"
                style={{
                  background: "var(--clay)",
                  color: "#FBF6EC",
                  border: "2.5px solid var(--ink)",
                  boxShadow: "4px 4px 0 var(--ink)",
                }}
              >
                Importer mon premier cours
              </Link>
              <Link
                href="/"
                data-press
                className="mt-3 px-2.5 py-2.5 text-[14px] font-semibold text-[var(--muted-ink)] underline underline-offset-[3px] transition-colors hover:text-[var(--ink)]"
              >
                Voir un exemple de cours
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}