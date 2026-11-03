import type { CatalogLevel } from "./types";

export const cycle3: CatalogLevel = {
  id: "cycle3",
  name: "Cycle 3",
  short: "9-11H",
  grades: "9H à 11H (secondaire I)",
  ages: "12 à 15 ans",
  emoji: "📐",
  description: "Le secondaire I : approfondir les branches et préparer la suite (gymnase, ECG ou apprentissage).",
  subjects: [
    {
      id: "c3-maths",
      name: "Mathématiques",
      emoji: "📐",
      color: "#3B82F6",
      units: [
        {
          id: "c3-fractions",
          title: "Les fractions",
          emoji: "🍕",
          description: "Simplifier, comparer, additionner et multiplier des fractions.",
          goals: ["Simplifier une fraction", "Additionner des fractions de dénominateurs différents", "Multiplier et diviser des fractions"],
          slides: [
            {
              title: "Vocabulaire",
              bullets: [
                "Dans 3/4, 3 est le numérateur et 4 le dénominateur.",
                "Le dénominateur indique en combien de parts on partage l'unité.",
                "Deux fractions sont équivalentes si elles représentent la même quantité : 1/2 = 2/4.",
              ],
            },
            {
              title: "Simplifier",
              bullets: [
                "On divise le numérateur et le dénominateur par le même nombre.",
                "12/18 = 2/3 (on divise par 6, le PGDC).",
                "Une fraction est irréductible quand on ne peut plus la simplifier.",
              ],
            },
            {
              title: "Additionner et soustraire",
              bullets: [
                "Il faut d'abord un dénominateur commun.",
                "1/3 + 1/4 = 4/12 + 3/12 = 7/12.",
                "On additionne seulement les numérateurs.",
              ],
            },
            {
              title: "Multiplier et diviser",
              bullets: [
                "Multiplier : numérateur × numérateur et dénominateur × dénominateur. 2/3 × 3/5 = 6/15 = 2/5.",
                "Diviser par une fraction revient à multiplier par son inverse.",
                "3/4 : 1/2 = 3/4 × 2/1 = 6/4 = 3/2.",
              ],
            },
          ],
          keyPoints: [
            "Numérateur en haut, dénominateur en bas.",
            "Pour additionner : même dénominateur d'abord.",
            "Pour multiplier : on multiplie en ligne.",
            "Diviser = multiplier par l'inverse.",
          ],
          flashcards: [
            { front: "Numérateur", back: "Le nombre du haut d'une fraction" },
            { front: "Dénominateur", back: "Le nombre du bas d'une fraction (nombre de parts)" },
            { front: "Simplifier 12/18", back: "2/3" },
            { front: "1/3 + 1/4", back: "7/12" },
            { front: "2/3 × 3/5", back: "2/5" },
            { front: "Inverse de 3/7", back: "7/3" },
            { front: "Fraction irréductible", back: "Fraction qu'on ne peut plus simplifier" },
            { front: "Diviser par une fraction", back: "Multiplier par son inverse" },
          ],
          quiz: [
            {
              question: "Quelle fraction est équivalente à 3/5 ?",
              options: ["6/10", "5/3", "3/10", "6/5"],
              answerIndex: 0,
              explanation: "On multiplie numérateur et dénominateur par 2 : 6/10.",
            },
            {
              question: "Combien vaut 1/2 + 1/3 ?",
              options: ["2/5", "5/6", "1/6", "2/6"],
              answerIndex: 1,
              explanation: "1/2 + 1/3 = 3/6 + 2/6 = 5/6.",
            },
            {
              question: "Simplifie 15/25.",
              options: ["3/5", "5/3", "1/5", "15/5"],
              answerIndex: 0,
              explanation: "On divise par 5 : 15/25 = 3/5.",
            },
            {
              question: "Combien vaut 2/3 × 3/4 ?",
              options: ["6/7", "1/2", "5/12", "8/9"],
              answerIndex: 1,
              explanation: "2/3 × 3/4 = 6/12 = 1/2.",
            },
            {
              question: "Combien vaut 1/2 : 1/4 ?",
              options: ["1/8", "2", "1/2", "4"],
              answerIndex: 1,
              explanation: "1/2 × 4/1 = 4/2 = 2.",
            },
            {
              question: "Quelle fraction est la plus grande ?",
              options: ["2/3", "3/5", "5/8", "1/2"],
              answerIndex: 0,
              explanation: "2/3 ≈ 0,667, 5/8 = 0,625, 3/5 = 0,6 et 1/2 = 0,5.",
            },
          ],
        },
        {
          id: "c3-pythagore",
          title: "Le théorème de Pythagore",
          emoji: "📏",
          description: "Calculer une longueur dans un triangle rectangle et vérifier si un triangle est rectangle.",
          goals: ["Énoncer le théorème", "Calculer l'hypoténuse ou un côté", "Utiliser la réciproque"],
          slides: [
            {
              title: "Le triangle rectangle",
              bullets: [
                "Un triangle rectangle possède un angle droit (90°).",
                "Le côté opposé à l'angle droit s'appelle l'hypoténuse.",
                "L'hypoténuse est toujours le plus long côté.",
              ],
            },
            {
              title: "Le théorème",
              bullets: [
                "Dans un triangle rectangle : a² + b² = c², où c est l'hypoténuse.",
                "Exemple : côtés 3 et 4 → c² = 9 + 16 = 25 → c = 5.",
              ],
            },
            {
              title: "Calculer un côté de l'angle droit",
              bullets: [
                "On isole : a² = c² − b².",
                "Exemple : c = 13, b = 5 → a² = 169 − 25 = 144 → a = 12.",
              ],
            },
            {
              title: "La réciproque",
              bullets: [
                "Si a² + b² = c² avec c le plus grand côté, alors le triangle est rectangle.",
                "Les triplets 3-4-5, 5-12-13 et 8-15-17 forment des triangles rectangles.",
              ],
            },
          ],
          keyPoints: [
            "a² + b² = c² dans un triangle rectangle.",
            "L'hypoténuse est opposée à l'angle droit et est le plus long côté.",
            "La réciproque permet de prouver qu'un triangle est rectangle.",
          ],
          flashcards: [
            { front: "Hypoténuse", back: "Le côté opposé à l'angle droit, le plus long" },
            { front: "Théorème de Pythagore", back: "a² + b² = c² dans un triangle rectangle" },
            { front: "Côtés 6 et 8 : hypoténuse ?", back: "10" },
            { front: "Hypoténuse 13, côté 5 : autre côté ?", back: "12" },
            { front: "Réciproque de Pythagore", back: "Si a² + b² = c², le triangle est rectangle" },
            { front: "Triplet pythagoricien célèbre", back: "3, 4, 5" },
          ],
          quiz: [
            {
              question: "Un triangle rectangle a des côtés de 6 cm et 8 cm autour de l'angle droit. L'hypoténuse mesure…",
              options: ["14 cm", "10 cm", "12 cm", "48 cm"],
              answerIndex: 1,
              explanation: "36 + 64 = 100, et √100 = 10.",
            },
            {
              question: "Quel côté est l'hypoténuse ?",
              options: ["Le plus court", "Celui opposé à l'angle droit", "N'importe lequel", "La hauteur"],
              answerIndex: 1,
              explanation: "L'hypoténuse est en face de l'angle droit.",
            },
            {
              question: "Un triangle de côtés 5, 12 et 13 est-il rectangle ?",
              options: ["Oui", "Non", "Impossible à savoir", "Seulement s'il est isocèle"],
              answerIndex: 0,
              explanation: "25 + 144 = 169 = 13². D'après la réciproque, il est rectangle.",
            },
            {
              question: "Hypoténuse 10, un côté 6. L'autre côté mesure…",
              options: ["4", "8", "16", "√136"],
              answerIndex: 1,
              explanation: "100 − 36 = 64, et √64 = 8.",
            },
            {
              question: "Un triangle de côtés 4, 5 et 6 est-il rectangle ?",
              options: ["Oui", "Non"],
              answerIndex: 1,
              explanation: "16 + 25 = 41 ≠ 36. Il n'est pas rectangle.",
            },
          ],
        },
      ],
    },
    {
      id: "c3-histoire",
      name: "Histoire",
      emoji: "🏰",
      color: "#8B5CF6",
      units: [
        {
          id: "c3-confederation",
          title: "La naissance de la Confédération",
          emoji: "📜",
          description: "De l'alliance de 1291 à l'État fédéral de 1848 : les grandes étapes de l'histoire suisse.",
          goals: ["Situer le Pacte de 1291", "Connaître les batailles fondatrices", "Comprendre le passage à l'État fédéral en 1848"],
          slides: [
            {
              title: "1291 : le Pacte fédéral",
              bullets: [
                "Au début d'août 1291, Uri, Schwytz et Unterwald concluent une alliance d'entraide.",
                "Ce pacte est considéré comme l'acte fondateur de la Confédération.",
                "Le 1er août est devenu la fête nationale.",
                "La légende de Guillaume Tell est associée à cette période.",
              ],
            },
            {
              title: "Les batailles fondatrices",
              bullets: [
                "1315 : victoire des Confédérés contre les Habsbourg à Morgarten.",
                "1386 : nouvelle victoire contre les Habsbourg à Sempach.",
                "1515 : défaite à Marignan contre la France, la Confédération renonce à s'étendre.",
              ],
            },
            {
              title: "Neutralité et indépendance",
              bullets: [
                "1648 : les traités de Westphalie reconnaissent l'indépendance de la Confédération.",
                "1798 : la France impose la République helvétique.",
                "1815 : le Congrès de Vienne reconnaît la neutralité perpétuelle de la Suisse.",
              ],
            },
            {
              title: "1848 : l'État fédéral",
              bullets: [
                "1847 : la guerre du Sonderbund oppose cantons catholiques conservateurs et cantons libéraux.",
                "1848 : la première Constitution fédérale crée l'État fédéral moderne.",
                "Berne devient la ville fédérale.",
              ],
            },
          ],
          keyPoints: [
            "1291 : Pacte entre Uri, Schwytz et Unterwald.",
            "Morgarten (1315) et Sempach (1386) contre les Habsbourg.",
            "1815 : neutralité reconnue au Congrès de Vienne.",
            "1848 : Constitution et État fédéral.",
          ],
          flashcards: [
            { front: "1291", back: "Pacte fédéral entre Uri, Schwytz et Unterwald" },
            { front: "Les trois cantons primitifs", back: "Uri, Schwytz et Unterwald" },
            { front: "1315", back: "Bataille de Morgarten" },
            { front: "1386", back: "Bataille de Sempach" },
            { front: "1515", back: "Défaite de Marignan" },
            { front: "1815", back: "Congrès de Vienne : neutralité reconnue" },
            { front: "1847", back: "Guerre du Sonderbund" },
            { front: "1848", back: "Première Constitution fédérale, naissance de l'État fédéral" },
          ],
          quiz: [
            {
              question: "Quels cantons signent le Pacte de 1291 ?",
              options: ["Berne, Zurich, Lucerne", "Uri, Schwytz, Unterwald", "Vaud, Genève, Valais", "Zoug, Glaris, Berne"],
              answerIndex: 1,
              explanation: "Uri, Schwytz et Unterwald sont les trois cantons primitifs.",
            },
            {
              question: "En quelle année naît l'État fédéral moderne ?",
              options: ["1291", "1515", "1815", "1848"],
              answerIndex: 3,
              explanation: "La Constitution fédérale de 1848 crée l'État fédéral.",
            },
            {
              question: "Contre qui les Confédérés se battent-ils à Morgarten ?",
              options: ["Les Habsbourg", "Napoléon", "Les Romains", "Le Sonderbund"],
              answerIndex: 0,
              explanation: "Morgarten (1315) oppose les Confédérés aux Habsbourg.",
            },
            {
              question: "Quel événement reconnaît la neutralité suisse en 1815 ?",
              options: ["Les traités de Westphalie", "Le Congrès de Vienne", "La République helvétique", "La bataille de Marignan"],
              answerIndex: 1,
              explanation: "Le Congrès de Vienne reconnaît la neutralité perpétuelle de la Suisse.",
            },
            {
              question: "Pourquoi le 1er août est-il la fête nationale ?",
              options: [
                "C'est la date de la Constitution de 1848",
                "Le Pacte fédéral date du début d'août 1291",
                "C'est l'anniversaire de Guillaume Tell",
                "C'est la fin de la guerre du Sonderbund",
              ],
              answerIndex: 1,
              explanation: "Le Pacte fédéral est daté du début du mois d'août 1291.",
            },
            {
              question: "Que se passe-t-il en 1798 ?",
              options: ["La France impose la République helvétique", "Le Jura devient un canton", "La Suisse entre à l'ONU", "La bataille de Sempach"],
              answerIndex: 0,
              explanation: "En 1798, la France révolutionnaire envahit la Suisse et impose la République helvétique.",
            },
          ],
        },
      ],
    },
    {
      id: "c3-sciences",
      name: "Sciences de la nature",
      emoji: "🔬",
      color: "#14B8A6",
      units: [
        {
          id: "c3-cellule",
          title: "La cellule",
          emoji: "🦠",
          description: "L'unité de base du vivant : ses parties et les différences entre cellule animale et végétale.",
          goals: ["Nommer les parties d'une cellule", "Comparer cellule animale et végétale", "Connaître le rôle des organites principaux"],
          slides: [
            {
              title: "L'unité du vivant",
              bullets: [
                "Tous les êtres vivants sont formés de cellules.",
                "Certains organismes n'ont qu'une seule cellule, comme les bactéries.",
                "On observe les cellules au microscope.",
              ],
            },
            {
              title: "Les parties communes",
              bullets: [
                "La membrane entoure la cellule et contrôle les échanges.",
                "Le cytoplasme est le liquide qui remplit la cellule.",
                "Le noyau contient l'ADN, l'information génétique.",
                "Les mitochondries produisent l'énergie de la cellule.",
              ],
            },
            {
              title: "La cellule végétale",
              bullets: [
                "Elle possède en plus une paroi rigide faite de cellulose.",
                "Ses chloroplastes réalisent la photosynthèse grâce à la chlorophylle.",
                "Elle contient une grande vacuole remplie d'eau.",
              ],
            },
          ],
          keyPoints: [
            "La cellule est l'unité de base du vivant.",
            "Membrane, cytoplasme, noyau, mitochondries.",
            "En plus chez les plantes : paroi, chloroplastes, grande vacuole.",
          ],
          flashcards: [
            { front: "Noyau", back: "Contient l'ADN, l'information génétique" },
            { front: "Membrane cellulaire", back: "Enveloppe qui contrôle les échanges avec l'extérieur" },
            { front: "Mitochondrie", back: "Produit l'énergie de la cellule" },
            { front: "Chloroplaste", back: "Réalise la photosynthèse (cellules végétales)" },
            { front: "Paroi cellulaire", back: "Enveloppe rigide en cellulose des cellules végétales" },
            { front: "Cytoplasme", back: "Liquide qui remplit la cellule" },
            { front: "Organisme unicellulaire", back: "Être vivant formé d'une seule cellule" },
          ],
          quiz: [
            {
              question: "Où se trouve l'ADN dans une cellule animale ?",
              options: ["Dans la membrane", "Dans le noyau", "Dans la paroi", "Dans la vacuole"],
              answerIndex: 1,
              explanation: "Le noyau contient l'information génétique.",
            },
            {
              question: "Quel organite est présent seulement chez les végétaux ?",
              options: ["Le noyau", "La mitochondrie", "Le chloroplaste", "La membrane"],
              answerIndex: 2,
              explanation: "Le chloroplaste réalise la photosynthèse et n'existe que chez les végétaux (et certaines algues).",
            },
            {
              question: "Quel est le rôle de la mitochondrie ?",
              options: ["Produire l'énergie", "Stocker l'eau", "Faire la photosynthèse", "Protéger la cellule"],
              answerIndex: 0,
              explanation: "La mitochondrie est la « centrale énergétique » de la cellule.",
            },
            {
              question: "De quoi est faite la paroi des cellules végétales ?",
              options: ["De chitine", "De cellulose", "De calcaire", "D'ADN"],
              answerIndex: 1,
              explanation: "La paroi végétale est composée de cellulose.",
            },
            {
              question: "Une bactérie est…",
              options: ["Un organisme unicellulaire", "Un organe", "Un tissu", "Un virus"],
              answerIndex: 0,
              explanation: "Une bactérie est formée d'une seule cellule.",
            },
          ],
        },
      ],
    },
  ],
};
