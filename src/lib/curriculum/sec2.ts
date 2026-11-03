import type { CatalogLevel } from "./types";

export const sec2: CatalogLevel = {
  id: "sec2",
  name: "Secondaire II",
  short: "Sec II",
  grades: "Gymnase (maturité), ECG ou formation professionnelle (CFC)",
  ages: "15 à 19 ans",
  emoji: "🎓",
  description: "Gymnase, école de culture générale ou apprentissage : préparer la maturité, le CFC et la vie citoyenne.",
  subjects: [
    {
      id: "s2-maths",
      name: "Mathématiques",
      emoji: "📈",
      color: "#3B82F6",
      units: [
        {
          id: "s2-second-degre",
          title: "Fonctions du second degré",
          emoji: "⤴️",
          description: "Paraboles, sommet, discriminant et résolution d'équations du second degré.",
          goals: ["Reconnaître une fonction quadratique", "Trouver le sommet d'une parabole", "Résoudre ax² + bx + c = 0 avec le discriminant"],
          slides: [
            {
              title: "La forme générale",
              bullets: [
                "Une fonction du second degré s'écrit f(x) = ax² + bx + c avec a ≠ 0.",
                "Son graphe est une parabole.",
                "Si a > 0 la parabole est ouverte vers le haut, si a < 0 vers le bas.",
              ],
            },
            {
              title: "Le sommet",
              bullets: [
                "L'abscisse du sommet vaut x = −b / (2a).",
                "La parabole est symétrique par rapport à la droite verticale passant par le sommet.",
                "Exemple : f(x) = x² − 4x + 1 a son sommet en x = 2, f(2) = −3.",
              ],
            },
            {
              title: "Le discriminant",
              bullets: [
                "Δ = b² − 4ac.",
                "Si Δ > 0 : deux solutions x = (−b ± √Δ) / (2a).",
                "Si Δ = 0 : une solution double x = −b / (2a).",
                "Si Δ < 0 : aucune solution réelle.",
              ],
            },
            {
              title: "Forme factorisée",
              bullets: [
                "Si x₁ et x₂ sont les zéros, f(x) = a(x − x₁)(x − x₂).",
                "Exemple : x² − 5x + 6 = (x − 2)(x − 3).",
              ],
            },
          ],
          keyPoints: [
            "f(x) = ax² + bx + c, graphe en parabole.",
            "Sommet en x = −b / (2a).",
            "Δ = b² − 4ac décide du nombre de solutions.",
            "a > 0 : ouverte vers le haut.",
          ],
          flashcards: [
            { front: "Discriminant", back: "Δ = b² − 4ac" },
            { front: "Abscisse du sommet", back: "x = −b / (2a)" },
            { front: "Δ < 0", back: "Aucune solution réelle" },
            { front: "Δ = 0", back: "Une solution double" },
            { front: "Formule des solutions", back: "x = (−b ± √Δ) / (2a)" },
            { front: "a < 0", back: "Parabole ouverte vers le bas" },
            { front: "Factoriser x² − 5x + 6", back: "(x − 2)(x − 3)" },
          ],
          quiz: [
            {
              question: "Combien de solutions réelles a x² + 2x + 5 = 0 ?",
              options: ["0", "1", "2", "Une infinité"],
              answerIndex: 0,
              explanation: "Δ = 4 − 20 = −16 < 0 : aucune solution réelle.",
            },
            {
              question: "Où se trouve le sommet de f(x) = 2x² − 8x + 3 ?",
              options: ["x = −2", "x = 2", "x = 4", "x = 8"],
              answerIndex: 1,
              explanation: "x = −(−8) / (2·2) = 8/4 = 2.",
            },
            {
              question: "Quelles sont les solutions de x² − 7x + 12 = 0 ?",
              options: ["3 et 4", "−3 et −4", "2 et 6", "1 et 12"],
              answerIndex: 0,
              explanation: "Δ = 49 − 48 = 1, x = (7 ± 1)/2, donc 3 et 4.",
            },
            {
              question: "La parabole de f(x) = −x² + 3 est…",
              options: ["Ouverte vers le haut", "Ouverte vers le bas", "Une droite", "Sans sommet"],
              answerIndex: 1,
              explanation: "a = −1 < 0 : ouverte vers le bas, avec un maximum.",
            },
            {
              question: "Si Δ = 0, la parabole…",
              options: ["Coupe l'axe des x deux fois", "Touche l'axe des x en un seul point", "Ne touche jamais l'axe des x", "Est verticale"],
              answerIndex: 1,
              explanation: "Une solution double : le sommet est sur l'axe des x.",
            },
          ],
        },
      ],
    },
    {
      id: "s2-citoyennete",
      name: "Économie, droit et citoyenneté",
      emoji: "🏛️",
      color: "#EF4444",
      units: [
        {
          id: "s2-institutions",
          title: "Les institutions politiques suisses",
          emoji: "🗳️",
          description: "Les trois pouvoirs, le fédéralisme et les outils de la démocratie directe.",
          goals: ["Décrire les trois pouvoirs fédéraux", "Expliquer le bicamérisme", "Distinguer initiative et référendum"],
          slides: [
            {
              title: "Trois niveaux, trois pouvoirs",
              bullets: [
                "La Suisse a trois niveaux politiques : la Confédération, les cantons et les communes.",
                "Le pouvoir législatif fédéral est l'Assemblée fédérale (le Parlement).",
                "Le pouvoir exécutif est le Conseil fédéral.",
                "Le pouvoir judiciaire suprême est le Tribunal fédéral, à Lausanne.",
              ],
            },
            {
              title: "Le Parlement : deux chambres",
              bullets: [
                "Le Conseil national compte 200 membres, répartis selon la population des cantons.",
                "Le Conseil des États compte 46 membres : 2 par canton, 1 pour les six anciens demi-cantons.",
                "Les deux chambres ont les mêmes pouvoirs : c'est un bicamérisme parfait.",
                "Les élections fédérales ont lieu tous les 4 ans.",
              ],
            },
            {
              title: "Le Conseil fédéral",
              bullets: [
                "Il compte 7 membres élus par l'Assemblée fédérale réunie.",
                "Chaque conseiller fédéral dirige un département.",
                "La présidence de la Confédération change chaque année.",
                "Les décisions sont prises de manière collégiale.",
              ],
            },
            {
              title: "La démocratie directe",
              bullets: [
                "Initiative populaire : 100 000 signatures en 18 mois pour proposer une modification de la Constitution.",
                "Référendum facultatif : 50 000 signatures en 100 jours pour contester une loi.",
                "Référendum obligatoire : toute modification de la Constitution est soumise au vote.",
                "Une modification de la Constitution exige la double majorité : le peuple et les cantons.",
                "Le droit de vote des femmes au niveau fédéral date de 1971.",
              ],
            },
          ],
          keyPoints: [
            "Parlement = Conseil national (200) + Conseil des États (46).",
            "Conseil fédéral : 7 membres, collégialité.",
            "Initiative : 100 000 signatures en 18 mois.",
            "Référendum facultatif : 50 000 signatures en 100 jours.",
            "Double majorité pour changer la Constitution.",
          ],
          flashcards: [
            { front: "Membres du Conseil national", back: "200" },
            { front: "Membres du Conseil des États", back: "46" },
            { front: "Membres du Conseil fédéral", back: "7" },
            { front: "Initiative populaire", back: "100 000 signatures en 18 mois, modifie la Constitution" },
            { front: "Référendum facultatif", back: "50 000 signatures en 100 jours contre une loi" },
            { front: "Double majorité", back: "Majorité du peuple ET majorité des cantons" },
            { front: "Siège du Tribunal fédéral", back: "Lausanne" },
            { front: "Bicamérisme", back: "Parlement composé de deux chambres aux pouvoirs égaux" },
            { front: "Droit de vote des femmes (fédéral)", back: "1971" },
          ],
          quiz: [
            {
              question: "Combien de signatures faut-il pour une initiative populaire fédérale ?",
              options: ["50 000", "100 000", "200 000", "8 cantons"],
              answerIndex: 1,
              explanation: "100 000 signatures récoltées en 18 mois.",
            },
            {
              question: "Qui élit le Conseil fédéral ?",
              options: ["Le peuple", "Les cantons", "L'Assemblée fédérale réunie", "Le Tribunal fédéral"],
              answerIndex: 2,
              explanation: "Les 246 parlementaires des deux chambres élisent les 7 conseillers fédéraux.",
            },
            {
              question: "Combien de sièges compte le Conseil des États ?",
              options: ["26", "46", "200", "246"],
              answerIndex: 1,
              explanation: "2 sièges par canton, 1 pour les six anciens demi-cantons : 46.",
            },
            {
              question: "Pour contester une loi votée par le Parlement, on lance…",
              options: ["Une initiative populaire", "Un référendum facultatif", "Une motion", "Une pétition au Tribunal fédéral"],
              answerIndex: 1,
              explanation: "Le référendum facultatif demande 50 000 signatures en 100 jours.",
            },
            {
              question: "Que signifie « double majorité » ?",
              options: [
                "Les deux chambres doivent accepter",
                "Le peuple et les cantons doivent accepter",
                "Deux tiers des votants",
                "Le Conseil fédéral et le Parlement",
              ],
              answerIndex: 1,
              explanation: "Une modification constitutionnelle doit être acceptée par la majorité du peuple et des cantons.",
            },
            {
              question: "Quel est le pouvoir exécutif fédéral ?",
              options: ["Le Conseil national", "Le Conseil fédéral", "Le Tribunal fédéral", "La Chancellerie"],
              answerIndex: 1,
              explanation: "Le Conseil fédéral est le gouvernement de la Suisse.",
            },
          ],
        },
        {
          id: "s2-assurances",
          title: "Assurances et prévoyance",
          emoji: "🛡️",
          description: "Culture générale (CFC) : le système des trois piliers et l'assurance maladie obligatoire.",
          goals: ["Expliquer les trois piliers", "Comprendre franchise et quote-part", "Lire une fiche de salaire simple"],
          slides: [
            {
              title: "Le système des trois piliers",
              bullets: [
                "1er pilier : l'AVS/AI, assurance étatique qui couvre les besoins vitaux.",
                "2e pilier : la prévoyance professionnelle (LPP), via l'employeur.",
                "3e pilier : la prévoyance privée et facultative, par exemple le 3e pilier A.",
                "Ensemble, ils doivent permettre de maintenir son niveau de vie à la retraite.",
              ],
            },
            {
              title: "L'assurance maladie (LAMal)",
              bullets: [
                "L'assurance de base est obligatoire pour toute personne domiciliée en Suisse.",
                "On paie une prime chaque mois.",
                "La franchise est le montant annuel payé soi-même avant que l'assurance rembourse (au minimum 300 CHF pour un adulte).",
                "Ensuite, on paie encore une quote-part de 10 % des frais, plafonnée à 700 CHF par an pour un adulte.",
              ],
            },
            {
              title: "La fiche de salaire",
              bullets: [
                "Le salaire brut est le montant avant déductions.",
                "On déduit notamment les cotisations AVS/AI/APG, l'assurance chômage (AC) et le 2e pilier.",
                "Le salaire net est ce qui arrive sur le compte.",
              ],
            },
          ],
          keyPoints: [
            "1er pilier AVS/AI, 2e pilier LPP, 3e pilier privé.",
            "Assurance maladie de base obligatoire (LAMal).",
            "Franchise puis quote-part de 10 %.",
            "Brut − déductions = net.",
          ],
          flashcards: [
            { front: "1er pilier", back: "AVS/AI : assurance vieillesse et invalidité de l'État" },
            { front: "2e pilier", back: "Prévoyance professionnelle (LPP)" },
            { front: "3e pilier", back: "Prévoyance privée facultative" },
            { front: "Franchise", back: "Montant annuel payé soi-même avant le remboursement de l'assurance" },
            { front: "Quote-part", back: "10 % des frais après la franchise (max. 700 CHF/an pour un adulte)" },
            { front: "Salaire net", back: "Salaire brut moins les cotisations sociales" },
            { front: "LAMal", back: "Loi fédérale sur l'assurance-maladie" },
          ],
          quiz: [
            {
              question: "Le 2e pilier correspond à…",
              options: ["L'AVS", "La prévoyance professionnelle", "L'épargne privée", "L'assurance maladie"],
              answerIndex: 1,
              explanation: "Le 2e pilier est la prévoyance professionnelle (LPP).",
            },
            {
              question: "L'assurance maladie de base en Suisse est…",
              options: ["Facultative", "Obligatoire", "Payée par l'employeur", "Réservée aux adultes"],
              answerIndex: 1,
              explanation: "Toute personne domiciliée en Suisse doit être assurée (LAMal).",
            },
            {
              question: "Ta franchise est de 300 CHF et tu as 1000 CHF de frais. Combien paies-tu au total (franchise + quote-part) ?",
              options: ["300 CHF", "370 CHF", "1000 CHF", "400 CHF"],
              answerIndex: 1,
              explanation: "300 CHF de franchise + 10 % des 700 CHF restants (70 CHF) = 370 CHF.",
            },
            {
              question: "Quel pilier est facultatif ?",
              options: ["Le 1er", "Le 2e", "Le 3e", "Aucun"],
              answerIndex: 2,
              explanation: "Le 3e pilier est une épargne privée facultative.",
            },
            {
              question: "Le salaire net, c'est…",
              options: ["Le salaire avant déductions", "Le salaire après déductions", "Le 13e salaire", "Le salaire annuel"],
              answerIndex: 1,
              explanation: "Net = brut − cotisations sociales.",
            },
          ],
        },
      ],
    },
    {
      id: "s2-chimie",
      name: "Chimie",
      emoji: "⚗️",
      color: "#14B8A6",
      units: [
        {
          id: "s2-tableau-periodique",
          title: "Le tableau périodique",
          emoji: "🧪",
          description: "L'atome, le numéro atomique et l'organisation du tableau de Mendeleïev.",
          goals: ["Décrire la structure de l'atome", "Lire une case du tableau", "Connaître les familles principales"],
          slides: [
            {
              title: "L'atome",
              bullets: [
                "Un atome a un noyau (protons et neutrons) entouré d'électrons.",
                "Le numéro atomique Z est le nombre de protons.",
                "Un atome neutre a autant d'électrons que de protons.",
              ],
            },
            {
              title: "L'organisation du tableau",
              bullets: [
                "Mendeleïev publie la première classification périodique en 1869.",
                "Les éléments sont rangés par numéro atomique croissant.",
                "Les lignes s'appellent des périodes, les colonnes des groupes.",
                "Les éléments d'un même groupe ont des propriétés chimiques semblables.",
                "On connaît aujourd'hui 118 éléments.",
              ],
            },
            {
              title: "Les familles",
              bullets: [
                "Groupe 1 : les métaux alcalins (lithium, sodium, potassium), très réactifs.",
                "Groupe 17 : les halogènes (fluor, chlore, brome).",
                "Groupe 18 : les gaz nobles (hélium, néon, argon), très peu réactifs.",
              ],
            },
          ],
          keyPoints: [
            "Z = nombre de protons.",
            "Périodes = lignes, groupes = colonnes.",
            "Alcalins (1), halogènes (17), gaz nobles (18).",
            "Mendeleïev, 1869.",
          ],
          flashcards: [
            { front: "Numéro atomique (Z)", back: "Nombre de protons dans le noyau" },
            { front: "Période", back: "Ligne du tableau périodique" },
            { front: "Groupe", back: "Colonne du tableau périodique" },
            { front: "Gaz nobles", back: "Groupe 18, très peu réactifs (He, Ne, Ar)" },
            { front: "Métaux alcalins", back: "Groupe 1, très réactifs (Li, Na, K)" },
            { front: "Na", back: "Sodium" },
            { front: "Cl", back: "Chlore" },
            { front: "Fe", back: "Fer" },
          ],
          quiz: [
            {
              question: "Le numéro atomique indique…",
              options: ["Le nombre de neutrons", "Le nombre de protons", "La masse de l'atome", "Le nombre de couches"],
              answerIndex: 1,
              explanation: "Z est le nombre de protons du noyau.",
            },
            {
              question: "Quel élément est un gaz noble ?",
              options: ["Sodium", "Chlore", "Néon", "Fer"],
              answerIndex: 2,
              explanation: "Le néon appartient au groupe 18.",
            },
            {
              question: "Quel est le symbole du potassium ?",
              options: ["P", "Po", "K", "Pt"],
              answerIndex: 2,
              explanation: "K vient du latin kalium.",
            },
            {
              question: "Dans le tableau, les colonnes s'appellent…",
              options: ["Des périodes", "Des groupes", "Des couches", "Des séries"],
              answerIndex: 1,
              explanation: "Colonnes = groupes, lignes = périodes.",
            },
            {
              question: "Qui a proposé la classification périodique en 1869 ?",
              options: ["Lavoisier", "Mendeleïev", "Curie", "Bohr"],
              answerIndex: 1,
              explanation: "Dmitri Mendeleïev, en 1869.",
            },
          ],
        },
      ],
    },
  ],
};
