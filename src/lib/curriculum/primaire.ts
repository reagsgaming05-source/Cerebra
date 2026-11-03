import type { CatalogLevel } from "./types";

export const cycle1: CatalogLevel = {
  id: "cycle1",
  name: "Cycle 1",
  short: "1-4H",
  grades: "1H à 4H",
  ages: "4 à 8 ans",
  emoji: "🧸",
  description: "Les premiers apprentissages : compter, lire, découvrir le monde.",
  subjects: [
    {
      id: "c1-maths",
      name: "Mathématiques",
      emoji: "🔢",
      color: "#3B82F6",
      units: [
        {
          id: "c1-nombres-100",
          title: "Les nombres jusqu'à 100",
          emoji: "💯",
          description: "Lire, écrire et dire les nombres de 0 à 100, à la manière suisse romande.",
          goals: [
            "Dire les nombres de 0 à 100",
            "Comprendre les dizaines et les unités",
            "Connaître septante, huitante et nonante",
          ],
          slides: [
            {
              title: "Les dizaines et les unités",
              bullets: [
                "Un nombre à deux chiffres a des dizaines et des unités.",
                "Dans 47, il y a 4 dizaines et 7 unités.",
                "10 unités font 1 dizaine.",
              ],
            },
            {
              title: "Les nombres en Suisse romande",
              bullets: [
                "70 se dit septante.",
                "80 se dit huitante dans les cantons de Vaud, du Valais et de Fribourg.",
                "90 se dit nonante.",
                "Exemple : 97 se dit nonante-sept.",
              ],
            },
            {
              title: "Comparer des nombres",
              bullets: [
                "On compare d'abord les dizaines, puis les unités.",
                "Le signe < veut dire « plus petit que ».",
                "Le signe > veut dire « plus grand que ».",
              ],
            },
            {
              title: "Pairs et impairs",
              bullets: [
                "Un nombre pair se termine par 0, 2, 4, 6 ou 8.",
                "Un nombre impair se termine par 1, 3, 5, 7 ou 9.",
              ],
            },
          ],
          keyPoints: [
            "10 unités = 1 dizaine.",
            "70 = septante, 80 = huitante, 90 = nonante.",
            "On compare d'abord les dizaines.",
            "Les nombres pairs finissent par 0, 2, 4, 6 ou 8.",
          ],
          flashcards: [
            { front: "70", back: "Septante" },
            { front: "80", back: "Huitante (Vaud, Valais, Fribourg)" },
            { front: "90", back: "Nonante" },
            { front: "Dizaine", back: "Un groupe de 10 unités" },
            { front: "Combien de dizaines dans 63 ?", back: "6 dizaines (et 3 unités)" },
            { front: "Le signe <", back: "Plus petit que" },
            { front: "Nombre pair", back: "Un nombre qui se termine par 0, 2, 4, 6 ou 8" },
            { front: "Nombre impair", back: "Un nombre qui se termine par 1, 3, 5, 7 ou 9" },
          ],
          quiz: [
            {
              question: "Comment dit-on 75 en Suisse romande ?",
              options: ["Soixante-quinze", "Septante-cinq", "Huitante-cinq", "Sept-cinq"],
              answerIndex: 1,
              explanation: "70 se dit septante, donc 75 se dit septante-cinq.",
            },
            {
              question: "Combien d'unités y a-t-il dans 58 ?",
              options: ["5", "8", "58", "13"],
              answerIndex: 1,
              explanation: "58 = 5 dizaines et 8 unités.",
            },
            {
              question: "Quel nombre est le plus grand ?",
              options: ["39", "41", "14", "40"],
              answerIndex: 1,
              explanation: "41 a 4 dizaines et 1 unité : c'est le plus grand.",
            },
            {
              question: "Quel nombre est pair ?",
              options: ["17", "33", "46", "91"],
              answerIndex: 2,
              explanation: "46 se termine par 6, c'est donc un nombre pair.",
            },
            {
              question: "Que vaut 1 dizaine ?",
              options: ["1 unité", "5 unités", "10 unités", "100 unités"],
              answerIndex: 2,
              explanation: "Une dizaine, c'est 10 unités.",
            },
            {
              question: "Comment écrit-on nonante-deux en chiffres ?",
              options: ["72", "82", "92", "29"],
              answerIndex: 2,
              explanation: "Nonante = 90, donc nonante-deux = 92.",
            },
          ],
        },
      ],
    },
    {
      id: "c1-francais",
      name: "Français",
      emoji: "📖",
      color: "#EF4444",
      units: [
        {
          id: "c1-alphabet",
          title: "Les lettres et les sons",
          emoji: "🔤",
          description: "Connaître l'alphabet, les voyelles, les consonnes et quelques sons composés.",
          goals: ["Réciter l'alphabet", "Distinguer voyelles et consonnes", "Reconnaître les sons ou, on, an, ch"],
          slides: [
            {
              title: "L'alphabet",
              bullets: [
                "L'alphabet français compte 26 lettres.",
                "Chaque lettre existe en minuscule (a) et en majuscule (A).",
                "On met une majuscule au début d'une phrase et aux prénoms.",
              ],
            },
            {
              title: "Voyelles et consonnes",
              bullets: [
                "Il y a 6 voyelles : a, e, i, o, u, y.",
                "Les 20 autres lettres sont des consonnes.",
              ],
            },
            {
              title: "Les sons composés",
              bullets: [
                "o + u fait le son « ou » comme dans loup.",
                "o + n fait le son « on » comme dans bonbon.",
                "a + n fait le son « an » comme dans maman.",
                "c + h fait le son « ch » comme dans chat.",
              ],
            },
          ],
          keyPoints: [
            "L'alphabet a 26 lettres.",
            "6 voyelles : a, e, i, o, u, y.",
            "Deux lettres peuvent faire un seul son : ou, on, an, ch.",
          ],
          flashcards: [
            { front: "Combien de lettres dans l'alphabet ?", back: "26" },
            { front: "Les voyelles", back: "a, e, i, o, u, y" },
            { front: "o + u", back: "Le son « ou » (loup)" },
            { front: "c + h", back: "Le son « ch » (chat)" },
            { front: "a + n", back: "Le son « an » (maman)" },
            { front: "Majuscule", back: "Grande lettre, au début d'une phrase ou d'un prénom" },
          ],
          quiz: [
            {
              question: "Laquelle de ces lettres est une voyelle ?",
              options: ["b", "o", "t", "m"],
              answerIndex: 1,
              explanation: "Les voyelles sont a, e, i, o, u, y.",
            },
            {
              question: "Quel son entends-tu dans « chat » ?",
              options: ["ou", "ch", "on", "an"],
              answerIndex: 1,
              explanation: "c + h fait le son « ch ».",
            },
            {
              question: "Combien y a-t-il de voyelles ?",
              options: ["5", "6", "20", "26"],
              answerIndex: 1,
              explanation: "a, e, i, o, u, y : 6 voyelles.",
            },
            {
              question: "Quel mot contient le son « on » ?",
              options: ["lapin", "bonbon", "loup", "chat"],
              answerIndex: 1,
              explanation: "Bonbon contient deux fois le son « on ».",
            },
            {
              question: "Où met-on une majuscule ?",
              options: ["À la fin d'une phrase", "Au début d'une phrase", "Au milieu de chaque mot", "Jamais"],
              answerIndex: 1,
              explanation: "Une phrase commence toujours par une majuscule.",
            },
          ],
        },
      ],
    },
  ],
};

export const cycle2: CatalogLevel = {
  id: "cycle2",
  name: "Cycle 2",
  short: "5-8H",
  grades: "5H à 8H",
  ages: "8 à 12 ans",
  emoji: "🎒",
  description: "Consolider les bases et découvrir la Suisse, sa géographie et ses langues.",
  subjects: [
    {
      id: "c2-maths",
      name: "Mathématiques",
      emoji: "✖️",
      color: "#3B82F6",
      units: [
        {
          id: "c2-livrets",
          title: "Les livrets (tables de multiplication)",
          emoji: "🧮",
          description: "Maîtriser les livrets de 2 à 10 et les astuces pour les retenir.",
          goals: ["Connaître les livrets par cœur", "Utiliser la commutativité", "Repérer les astuces des livrets 5, 9 et 10"],
          slides: [
            {
              title: "Qu'est-ce qu'une multiplication ?",
              bullets: [
                "Multiplier, c'est additionner plusieurs fois le même nombre.",
                "3 × 4 = 4 + 4 + 4 = 12.",
                "En Suisse, on appelle les tables de multiplication les « livrets ».",
              ],
            },
            {
              title: "L'ordre ne change rien",
              bullets: [
                "3 × 7 donne le même résultat que 7 × 3 : c'est la commutativité.",
                "Si tu connais 4 × 8, tu connais aussi 8 × 4.",
              ],
            },
            {
              title: "Astuces",
              bullets: [
                "Livret de 10 : on ajoute un zéro (6 × 10 = 60).",
                "Livret de 5 : le résultat finit par 0 ou 5.",
                "Livret de 9 : les chiffres du résultat font 9 en tout (9 × 7 = 63 et 6 + 3 = 9).",
                "Livret de 2 : c'est le double.",
              ],
            },
            {
              title: "Les plus difficiles",
              bullets: ["6 × 7 = 42", "7 × 8 = 56", "6 × 8 = 48", "8 × 8 = 64", "7 × 7 = 49"],
            },
          ],
          keyPoints: [
            "Multiplier = additionner plusieurs fois le même nombre.",
            "a × b = b × a.",
            "Livret de 9 : la somme des chiffres du résultat fait 9.",
            "7 × 8 = 56 et 6 × 7 = 42.",
          ],
          flashcards: [
            { front: "6 × 7", back: "42" },
            { front: "7 × 8", back: "56" },
            { front: "6 × 8", back: "48" },
            { front: "9 × 6", back: "54" },
            { front: "8 × 8", back: "64" },
            { front: "7 × 7", back: "49" },
            { front: "9 × 9", back: "81" },
            { front: "Commutativité", back: "L'ordre des facteurs ne change pas le résultat : 3 × 5 = 5 × 3" },
          ],
          quiz: [
            {
              question: "Combien font 7 × 8 ?",
              options: ["54", "56", "63", "48"],
              answerIndex: 1,
              explanation: "7 × 8 = 56. Astuce : 5, 6, 7, 8 → 56 = 7 × 8.",
            },
            {
              question: "Combien font 9 × 4 ?",
              options: ["36", "32", "45", "27"],
              answerIndex: 0,
              explanation: "9 × 4 = 36, et 3 + 6 = 9.",
            },
            {
              question: "Quel calcul donne le même résultat que 6 × 9 ?",
              options: ["6 + 9", "9 × 6", "9 − 6", "6 × 6"],
              answerIndex: 1,
              explanation: "Grâce à la commutativité, 6 × 9 = 9 × 6 = 54.",
            },
            {
              question: "Combien font 12 × 10 ?",
              options: ["22", "102", "120", "1200"],
              answerIndex: 2,
              explanation: "Multiplier par 10, c'est ajouter un zéro : 120.",
            },
            {
              question: "Quel résultat appartient au livret de 5 ?",
              options: ["32", "45", "27", "44"],
              answerIndex: 1,
              explanation: "Les résultats du livret de 5 finissent par 0 ou 5 : 45 = 9 × 5.",
            },
            {
              question: "Combien font 6 × 7 ?",
              options: ["36", "48", "42", "49"],
              answerIndex: 2,
              explanation: "6 × 7 = 42.",
            },
          ],
        },
      ],
    },
    {
      id: "c2-geo",
      name: "Géographie",
      emoji: "🗺️",
      color: "#10B981",
      units: [
        {
          id: "c2-suisse",
          title: "La Suisse et ses cantons",
          emoji: "🇨🇭",
          description: "Découvrir les 26 cantons, les langues nationales et les grands repères géographiques de la Suisse.",
          goals: ["Savoir que la Suisse compte 26 cantons", "Citer les 4 langues nationales", "Situer quelques chefs-lieux romands"],
          slides: [
            {
              title: "Un pays, 26 cantons",
              bullets: [
                "La Suisse est un État fédéral composé de 26 cantons.",
                "Berne est la ville fédérale : c'est là que siègent le gouvernement et le Parlement.",
                "Le Jura est le plus jeune canton, créé en 1979.",
                "Les Grisons sont le plus grand canton.",
              ],
            },
            {
              title: "Quatre langues nationales",
              bullets: [
                "L'allemand est la langue la plus parlée.",
                "Le français est parlé en Suisse romande, à l'ouest.",
                "L'italien est parlé au Tessin et dans une partie des Grisons.",
                "Le romanche est parlé dans les Grisons.",
              ],
            },
            {
              title: "Les cantons romands",
              bullets: [
                "Genève : chef-lieu Genève.",
                "Vaud : chef-lieu Lausanne.",
                "Valais : chef-lieu Sion.",
                "Fribourg : chef-lieu Fribourg.",
                "Neuchâtel : chef-lieu Neuchâtel.",
                "Jura : chef-lieu Delémont.",
              ],
            },
            {
              title: "Reliefs et eaux",
              bullets: [
                "La Suisse a trois grandes régions : le Jura, le Plateau et les Alpes.",
                "Le point culminant est la pointe Dufour (4634 m), au Mont Rose.",
                "Le lac Léman est partagé avec la France.",
                "Le lac de Neuchâtel est le plus grand lac entièrement suisse.",
                "Le Rhône et le Rhin prennent leur source dans les Alpes suisses.",
              ],
            },
          ],
          keyPoints: [
            "26 cantons, Berne est la ville fédérale.",
            "4 langues nationales : allemand, français, italien, romanche.",
            "3 régions : Jura, Plateau, Alpes.",
            "Point culminant : pointe Dufour, 4634 m.",
          ],
          flashcards: [
            { front: "Nombre de cantons", back: "26" },
            { front: "Ville fédérale de la Suisse", back: "Berne" },
            { front: "Chef-lieu du canton de Vaud", back: "Lausanne" },
            { front: "Chef-lieu du Valais", back: "Sion" },
            { front: "Chef-lieu du Jura", back: "Delémont" },
            { front: "Langues nationales", back: "Allemand, français, italien et romanche" },
            { front: "Point culminant de la Suisse", back: "La pointe Dufour (4634 m)" },
            { front: "Les 3 grandes régions naturelles", back: "Le Jura, le Plateau et les Alpes" },
            { front: "Plus jeune canton", back: "Le Jura (1979)" },
          ],
          quiz: [
            {
              question: "Combien la Suisse compte-t-elle de cantons ?",
              options: ["23", "24", "26", "28"],
              answerIndex: 2,
              explanation: "La Suisse compte 26 cantons.",
            },
            {
              question: "Quel est le chef-lieu du canton de Vaud ?",
              options: ["Montreux", "Lausanne", "Yverdon", "Nyon"],
              answerIndex: 1,
              explanation: "Lausanne est le chef-lieu du canton de Vaud.",
            },
            {
              question: "Laquelle n'est PAS une langue nationale suisse ?",
              options: ["Romanche", "Italien", "Anglais", "Allemand"],
              answerIndex: 2,
              explanation: "Les langues nationales sont l'allemand, le français, l'italien et le romanche.",
            },
            {
              question: "Où siègent le gouvernement et le Parlement fédéral ?",
              options: ["Zurich", "Genève", "Berne", "Lucerne"],
              answerIndex: 2,
              explanation: "Berne est la ville fédérale.",
            },
            {
              question: "Quel est le point culminant de la Suisse ?",
              options: ["Le Cervin", "La pointe Dufour", "La Jungfrau", "Le Mont Blanc"],
              answerIndex: 1,
              explanation: "La pointe Dufour culmine à 4634 m. Le Mont Blanc est en France et en Italie.",
            },
            {
              question: "Quelle région naturelle se trouve entre le Jura et les Alpes ?",
              options: ["Le Plateau", "Le Tessin", "La Riviera", "L'Engadine"],
              answerIndex: 0,
              explanation: "Le Plateau s'étend entre le Jura et les Alpes. C'est là que vit la majorité de la population.",
            },
          ],
        },
      ],
    },
    {
      id: "c2-allemand",
      name: "Allemand",
      emoji: "🇩🇪",
      color: "#F59E0B",
      units: [
        {
          id: "c2-deutsch-basics",
          title: "Premiers mots en allemand",
          emoji: "👋",
          description: "Saluer, se présenter, compter jusqu'à 10 et connaître les articles der, die, das.",
          goals: ["Saluer et prendre congé", "Compter jusqu'à 10", "Connaître les trois articles"],
          slides: [
            {
              title: "Saluer",
              bullets: [
                "Hallo ! = Salut !",
                "Guten Morgen ! = Bonjour ! (le matin)",
                "Tschüss ! = Salut ! (en partant)",
                "Auf Wiedersehen ! = Au revoir !",
              ],
            },
            {
              title: "Se présenter",
              bullets: [
                "Ich heisse Léa. = Je m'appelle Léa.",
                "Ich bin zehn Jahre alt. = J'ai dix ans.",
                "Danke ! = Merci ! / Bitte ! = S'il te plaît / De rien.",
              ],
            },
            {
              title: "Compter de 1 à 10",
              bullets: ["eins, zwei, drei, vier, fünf", "sechs, sieben, acht, neun, zehn"],
            },
            {
              title: "Les trois articles",
              bullets: [
                "der pour le masculin : der Hund (le chien).",
                "die pour le féminin : die Katze (le chat).",
                "das pour le neutre : das Haus (la maison).",
                "En allemand, tous les noms prennent une majuscule.",
              ],
            },
          ],
          keyPoints: [
            "Hallo, Tschüss, Danke, Bitte.",
            "Ich heisse… = je m'appelle…",
            "der (masculin), die (féminin), das (neutre).",
            "Les noms prennent toujours une majuscule.",
          ],
          flashcards: [
            { front: "Merci", back: "Danke" },
            { front: "Au revoir", back: "Auf Wiedersehen" },
            { front: "Je m'appelle…", back: "Ich heisse…" },
            { front: "der Hund", back: "Le chien" },
            { front: "die Katze", back: "Le chat" },
            { front: "das Haus", back: "La maison" },
            { front: "sieben", back: "7" },
            { front: "zehn", back: "10" },
            { front: "drei", back: "3" },
          ],
          quiz: [
            {
              question: "Comment dit-on « merci » en allemand ?",
              options: ["Bitte", "Danke", "Hallo", "Tschüss"],
              answerIndex: 1,
              explanation: "Danke = merci. Bitte = s'il te plaît / de rien.",
            },
            {
              question: "Quel article va avec « Haus » ?",
              options: ["der", "die", "das", "den"],
              answerIndex: 2,
              explanation: "Haus est neutre : das Haus.",
            },
            {
              question: "Que veut dire « acht » ?",
              options: ["6", "7", "8", "9"],
              answerIndex: 2,
              explanation: "acht = 8.",
            },
            {
              question: "Comment dit-on « Je m'appelle Tom » ?",
              options: ["Ich bin Tom heisse", "Ich heisse Tom", "Tom heisse ich nicht", "Hallo Tom"],
              answerIndex: 1,
              explanation: "Ich heisse Tom = Je m'appelle Tom.",
            },
            {
              question: "En allemand, les noms communs…",
              options: ["n'ont pas d'article", "commencent par une majuscule", "sont toujours masculins", "finissent par -en"],
              answerIndex: 1,
              explanation: "Tous les noms prennent une majuscule : der Hund, die Katze.",
            },
          ],
        },
      ],
    },
  ],
};
