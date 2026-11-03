import type { CatalogLevel } from "./types";

export const uni: CatalogLevel = {
  id: "uni",
  name: "Université & HES",
  short: "Uni/HES",
  grades: "Bachelor et Master (universités, EPF, HES)",
  ages: "18 ans et plus",
  emoji: "🏛️",
  description: "Les bases des cours de première année : statistiques, droit, économie.",
  subjects: [
    {
      id: "u-stats",
      name: "Statistiques",
      emoji: "📊",
      color: "#3B82F6",
      units: [
        {
          id: "u-stats-descriptives",
          title: "Statistiques descriptives",
          emoji: "📉",
          description: "Moyenne, médiane, variance, écart-type et premiers réflexes d'interprétation.",
          goals: ["Calculer les mesures de tendance centrale", "Mesurer la dispersion", "Éviter les pièges classiques d'interprétation"],
          slides: [
            {
              title: "Tendance centrale",
              bullets: [
                "La moyenne est la somme des valeurs divisée par leur nombre.",
                "La médiane sépare les données ordonnées en deux moitiés égales.",
                "Le mode est la valeur la plus fréquente.",
                "La médiane est robuste aux valeurs extrêmes, la moyenne ne l'est pas.",
              ],
            },
            {
              title: "Dispersion",
              bullets: [
                "L'étendue est la différence entre la valeur maximale et la valeur minimale.",
                "La variance est la moyenne des carrés des écarts à la moyenne.",
                "L'écart-type est la racine carrée de la variance, dans la même unité que les données.",
                "L'écart interquartile (Q3 − Q1) contient les 50 % centraux des données.",
              ],
            },
            {
              title: "Interpréter",
              bullets: [
                "Corrélation ne veut pas dire causalité.",
                "Le coefficient de corrélation r varie entre −1 et 1.",
                "Une valeur p inférieure au seuil (souvent 0,05) conduit à rejeter l'hypothèse nulle.",
                "Un échantillon doit être représentatif de la population étudiée.",
              ],
            },
          ],
          keyPoints: [
            "Moyenne sensible aux extrêmes, médiane robuste.",
            "Écart-type = √variance.",
            "Corrélation ≠ causalité.",
            "r est compris entre −1 et 1.",
          ],
          flashcards: [
            { front: "Médiane", back: "Valeur qui sépare les données ordonnées en deux moitiés" },
            { front: "Mode", back: "Valeur la plus fréquente" },
            { front: "Écart-type", back: "Racine carrée de la variance" },
            { front: "Écart interquartile", back: "Q3 − Q1, les 50 % centraux des données" },
            { front: "Valeur p", back: "Probabilité d'observer un résultat au moins aussi extrême si l'hypothèse nulle est vraie" },
            { front: "Coefficient de corrélation r", back: "Mesure de la relation linéaire, entre −1 et 1" },
            { front: "Mesure robuste", back: "Peu influencée par les valeurs extrêmes (ex. médiane)" },
          ],
          quiz: [
            {
              question: "Quelle est la médiane de 2, 3, 7, 9, 100 ?",
              options: ["7", "24,2", "9", "3"],
              answerIndex: 0,
              explanation: "Les valeurs sont ordonnées, la valeur du milieu est 7.",
            },
            {
              question: "Quelle est la moyenne de 2, 4, 6, 8 ?",
              options: ["4", "5", "6", "20"],
              answerIndex: 1,
              explanation: "(2 + 4 + 6 + 8) / 4 = 20 / 4 = 5.",
            },
            {
              question: "Une variance de 16 correspond à un écart-type de…",
              options: ["4", "8", "16", "256"],
              answerIndex: 0,
              explanation: "√16 = 4.",
            },
            {
              question: "Les ventes de glaces et les noyades sont corrélées. On peut en conclure que…",
              options: [
                "Les glaces causent les noyades",
                "Une troisième variable (la chaleur) peut expliquer les deux",
                "Les noyades font vendre des glaces",
                "La corrélation est forcément fausse",
              ],
              answerIndex: 1,
              explanation: "Corrélation ≠ causalité : la chaleur est une variable confondante.",
            },
            {
              question: "Quelle mesure est la plus robuste aux valeurs extrêmes ?",
              options: ["La moyenne", "L'étendue", "La médiane", "La variance"],
              answerIndex: 2,
              explanation: "La médiane dépend seulement du rang des valeurs.",
            },
            {
              question: "Avec un seuil de 0,05, une valeur p de 0,01 conduit à…",
              options: ["Accepter l'hypothèse nulle", "Rejeter l'hypothèse nulle", "Refaire l'étude", "Rien conclure"],
              answerIndex: 1,
              explanation: "0,01 < 0,05 : le résultat est statistiquement significatif.",
            },
          ],
        },
      ],
    },
    {
      id: "u-droit",
      name: "Droit",
      emoji: "⚖️",
      color: "#8B5CF6",
      units: [
        {
          id: "u-intro-droit",
          title: "Introduction au droit suisse",
          emoji: "📚",
          description: "Les sources du droit, la hiérarchie des normes et les grands codes suisses.",
          goals: ["Connaître la hiérarchie des normes", "Situer les grands codes", "Comprendre la primauté du droit fédéral"],
          slides: [
            {
              title: "Les sources du droit",
              bullets: [
                "La source principale est la loi écrite.",
                "Le juge peut aussi s'appuyer sur la coutume, la jurisprudence et la doctrine.",
                "L'art. 1 du Code civil indique au juge comment combler une lacune de la loi.",
              ],
            },
            {
              title: "La hiérarchie des normes",
              bullets: [
                "La Constitution fédérale est au sommet. La version actuelle date de 1999, en vigueur depuis 2000.",
                "Viennent ensuite les lois fédérales, adoptées par le Parlement.",
                "Puis les ordonnances, adoptées surtout par le Conseil fédéral.",
                "Le droit fédéral prime le droit cantonal qui lui est contraire (art. 49 Cst.).",
              ],
            },
            {
              title: "Les grands codes",
              bullets: [
                "Le Code civil (CC) date de 1907 et est entré en vigueur en 1912.",
                "Le Code des obligations (CO) règle les contrats, la responsabilité civile et les sociétés.",
                "Le Code pénal (CP) est entré en vigueur en 1942.",
                "La majorité civile est fixée à 18 ans (art. 14 CC).",
              ],
            },
            {
              title: "Principes clés du CC",
              bullets: [
                "Art. 2 CC : chacun doit agir selon les règles de la bonne foi.",
                "Art. 3 CC : la bonne foi est présumée.",
                "Art. 8 CC : celui qui allègue un fait doit le prouver (fardeau de la preuve).",
              ],
            },
          ],
          keyPoints: [
            "Constitution > lois > ordonnances.",
            "Le droit fédéral prime le droit cantonal.",
            "CC (1907), CO, CP (1942).",
            "Art. 2 CC bonne foi, art. 8 CC fardeau de la preuve.",
          ],
          flashcards: [
            { front: "Art. 8 CC", back: "Fardeau de la preuve : celui qui allègue un fait doit le prouver" },
            { front: "Art. 2 CC", back: "Agir selon les règles de la bonne foi" },
            { front: "Art. 14 CC", back: "La majorité est fixée à 18 ans" },
            { front: "Art. 49 Cst.", back: "Le droit fédéral prime le droit cantonal contraire" },
            { front: "Constitution fédérale actuelle", back: "Adoptée en 1999, en vigueur depuis le 1er janvier 2000" },
            { front: "CO", back: "Code des obligations : contrats, responsabilité, sociétés" },
            { front: "Jurisprudence", back: "Ensemble des décisions rendues par les tribunaux" },
            { front: "Ordonnance", back: "Norme d'exécution, adoptée surtout par le Conseil fédéral" },
          ],
          quiz: [
            {
              question: "Quelle norme est au sommet de la hiérarchie en droit suisse ?",
              options: ["Le Code civil", "La Constitution fédérale", "Les ordonnances", "Les lois cantonales"],
              answerIndex: 1,
              explanation: "La Constitution fédérale est la norme suprême de l'ordre juridique suisse.",
            },
            {
              question: "Quel article du CC traite du fardeau de la preuve ?",
              options: ["Art. 1", "Art. 2", "Art. 8", "Art. 14"],
              answerIndex: 2,
              explanation: "Art. 8 CC : chaque partie doit prouver les faits qu'elle allègue pour en déduire son droit.",
            },
            {
              question: "Une loi cantonale contraire à une loi fédérale…",
              options: ["Prévaut dans le canton", "Est inapplicable, le droit fédéral prime", "S'applique moitié-moitié", "Doit être votée par le peuple suisse"],
              answerIndex: 1,
              explanation: "Art. 49 Cst. : primauté du droit fédéral.",
            },
            {
              question: "Où trouve-t-on les règles sur le contrat de travail ?",
              options: ["Code pénal", "Code des obligations", "Constitution", "Code civil, livre des successions"],
              answerIndex: 1,
              explanation: "Le contrat de travail est réglé aux art. 319 ss CO.",
            },
            {
              question: "En quelle année le Code civil suisse est-il entré en vigueur ?",
              options: ["1848", "1912", "1942", "2000"],
              answerIndex: 1,
              explanation: "Adopté en 1907, il est entré en vigueur le 1er janvier 1912.",
            },
          ],
        },
      ],
    },
    {
      id: "u-eco",
      name: "Économie",
      emoji: "💹",
      color: "#F59E0B",
      units: [
        {
          id: "u-offre-demande",
          title: "Offre, demande et équilibre",
          emoji: "⚖️",
          description: "Le modèle de base de la microéconomie : courbes, équilibre et élasticité.",
          goals: ["Expliquer la loi de l'offre et de la demande", "Trouver un équilibre de marché", "Interpréter l'élasticité-prix"],
          slides: [
            {
              title: "La demande",
              bullets: [
                "Quand le prix augmente, la quantité demandée diminue (toutes choses égales par ailleurs).",
                "La courbe de demande est décroissante.",
                "Un changement de revenu ou de goûts déplace toute la courbe.",
              ],
            },
            {
              title: "L'offre",
              bullets: [
                "Quand le prix augmente, la quantité offerte augmente.",
                "La courbe d'offre est croissante.",
                "Une baisse des coûts de production déplace l'offre vers la droite.",
              ],
            },
            {
              title: "L'équilibre",
              bullets: [
                "L'équilibre est atteint au prix où quantité offerte = quantité demandée.",
                "Au-dessus de ce prix, il y a un excédent d'offre.",
                "En dessous, il y a une pénurie (excédent de demande).",
                "Exemple : Qd = 100 − 2P et Qo = 3P donnent P* = 20 et Q* = 60.",
              ],
            },
            {
              title: "L'élasticité-prix",
              bullets: [
                "Elle mesure la variation en % de la quantité demandée pour une variation de 1 % du prix.",
                "Demande élastique (|e| > 1) : les consommateurs réagissent fortement.",
                "Demande inélastique (|e| < 1) : biens de première nécessité, peu de substituts.",
              ],
            },
          ],
          keyPoints: [
            "Demande décroissante, offre croissante.",
            "Équilibre : Qo = Qd.",
            "Prix trop haut = excédent, trop bas = pénurie.",
            "|e| > 1 élastique, |e| < 1 inélastique.",
          ],
          flashcards: [
            { front: "Loi de la demande", back: "Si le prix monte, la quantité demandée baisse" },
            { front: "Prix d'équilibre", back: "Prix où quantité offerte = quantité demandée" },
            { front: "Pénurie", back: "Excédent de demande, quand le prix est sous l'équilibre" },
            { front: "Élasticité-prix", back: "Variation % de la quantité / variation % du prix" },
            { front: "Demande inélastique", back: "|e| < 1, la quantité réagit peu au prix" },
            { front: "Bien substitut", back: "Bien qui peut en remplacer un autre (beurre / margarine)" },
            { front: "Ceteris paribus", back: "Toutes choses égales par ailleurs" },
          ],
          quiz: [
            {
              question: "Qd = 100 − 2P et Qo = 3P. Quel est le prix d'équilibre ?",
              options: ["10", "20", "25", "60"],
              answerIndex: 1,
              explanation: "100 − 2P = 3P → 5P = 100 → P = 20.",
            },
            {
              question: "Si le prix est fixé sous l'équilibre, on observe…",
              options: ["Un excédent d'offre", "Une pénurie", "L'équilibre", "Une baisse de la demande"],
              answerIndex: 1,
              explanation: "Les consommateurs veulent plus que ce qui est offert : pénurie.",
            },
            {
              question: "Le revenu des ménages augmente (bien normal). Que fait la courbe de demande ?",
              options: ["Elle se déplace vers la droite", "Elle se déplace vers la gauche", "On bouge le long de la courbe", "Rien"],
              answerIndex: 0,
              explanation: "Un facteur autre que le prix déplace toute la courbe.",
            },
            {
              question: "Le prix augmente de 10 % et la quantité demandée baisse de 5 %. La demande est…",
              options: ["Élastique", "Inélastique", "Parfaitement élastique", "Croissante"],
              answerIndex: 1,
              explanation: "|e| = 5 / 10 = 0,5 < 1 : inélastique.",
            },
            {
              question: "Une baisse des coûts de production…",
              options: ["Déplace l'offre vers la droite", "Déplace la demande vers la gauche", "Augmente le prix d'équilibre", "N'a aucun effet"],
              answerIndex: 0,
              explanation: "Produire coûte moins cher : on offre plus à chaque prix.",
            },
          ],
        },
      ],
    },
  ],
};
