import { GoogleGenAI } from "@google/genai";
import type {
  Difficulty,
  Flashcard,
  QuizQuestion,
  Slide,
  Summary,
} from "./types";
import { slidesToText } from "./pptx";
import {
  fallbackFlashcards,
  fallbackQuiz,
  fallbackSummary,
} from "./fallback";

// Modèle Gemini. Flash est rapide, peu coûteux et largement suffisant pour
// des résumés/flashcards/quiz. Disponible sur le free tier de Google AI Studio.
const MODEL = "gemini-2.5-flash";

function client(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch {
    return null;
  }
}

function extractJson(text: string): string {
  // Gemini peut entourer le JSON de fences ```json ... ```
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return text;
}

/** Appelle Gemini et renvoie le texte brut de la réponse. */
async function ask(ai: GoogleGenAI, prompt: string): Promise<string> {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return res.text ?? "";
}

/** Mélange un tableau (variabilité d'une génération à l'autre). */
function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sérialise un Summary en texte pour le donner à Gemini. */
function summaryToText(s?: Summary): string {
  if (!s) return "(résumé indisponible, base-toi sur les slides)";
  const parts: string[] = [];
  if (s.intro?.trim()) parts.push(`INTRODUCTION\n${s.intro.trim()}`);
  if (Array.isArray(s.sections) && s.sections.length) {
    parts.push(
      "SECTIONS\n" +
        s.sections
          .filter((sec) => sec.heading || sec.content)
          .map((sec) => `## ${sec.heading}\n${sec.content}`)
          .join("\n\n"),
    );
  }
  if (Array.isArray(s.keyPoints) && s.keyPoints.length) {
    parts.push(`POINTS CLÉS\n- ${s.keyPoints.join("\n- ")}`);
  }
  return parts.length ? parts.join("\n\n") : "(résumé vide, base-toi sur les slides)";
}

/**
 * 14 tournures de questions pour le QCM. On en tire un sous-ensemble mélangé à
 * chaque génération afin que les formulations (et les questions) ne se répètent
 * pas d'une session à l'autre tout en restant toujours en rapport avec le sujet.
 */
const TOURNURES_QUIZ = [
  "Question directe : « Qu'est-ce que X ? »",
  "Définition : « Comment définit-on X ? »",
  "Affirmation correcte : « Laquelle de ces affirmations est exacte à propos de X ? »",
  "Cause / conséquence : « Quel est l'effet de X ? » ou « Pourquoi X se produit-il ? »",
  "Identification du terme : « Quel terme désigne X ? »",
  "Application : « Dans la situation X, que se passe-t-il si Y ? »",
  "Comparaison : « Quelle est la différence entre X et Y ? »",
  "Compléter la phrase : « X repose sur... »",
  "Assertion à évaluer : « Coche l'affirmation correcte concernant X. »",
  "Exemple : « Quel exemple illustre le mieux X ? »",
  "Exception / nuance : « Quelle est l'exception à la règle X ? »",
  "Rôle / fonction : « À quoi sert X ? »",
  "Étapes / ordre : « Quelle est la première étape de X ? »",
  "Intrus : « Lequel de ces éléments n'appartient PAS à X ? »",
];

export async function generateSummary(slides: Slide[]): Promise<Summary> {
  const c = client();
  if (!c) return fallbackSummary(slides);
  try {
    const prompt = `Tu es un tuteur expert qui aide des étudiants à réviser. À partir des slides d'un cours ci-dessous, rédige un RÉSUMÉ pédagogique de très haute qualité : structuré, clair, compréhensible et fidèle au contenu.

Réponds en français, STRICTEMENT en JSON (aucun texte hors du JSON, pas de markdown), avec ce format exact :
{"intro":"...","sections":[{"heading":"...","content":"..."}],"keyPoints":["..."]}

Règles de qualité :
- "intro" : un paragraphe d'introduction de 3 à 5 phrases qui pose le sujet, explique ce dont traite le cours, son intérêt et la logique d'ensemble. Vrai texte rédigé, pas une liste.
- "sections" : regroupe les slides par THÈME (PAS une section par slide). Vise 4 à 8 sections. Chaque "heading" est court (≤ 6 mots). Chaque "content" est un paragraphe rédigé de 2 à 4 phrases qui EXPLIQUE les notions (définitions, mécanismes, liens de cause à effet, exemples quand c'est utile), et pas une simple reprise des bullets. Quand un terme technique apparaît, définis-le en clair.
- "keyPoints" : 6 à 12 points clés, chacun une phrase complète et autonome (pas un fragment) qui isole l'idée essentielle à retenir.
- Ignore les titres de slides qui ne sont que des numéros ou du bruit. Ne duplique pas l'introduction dans les sections. Reste fidèle au contenu des slides, n'invente rien.

SLIDES:
${slidesToText(slides)}`;

    const text = await ask(c, prompt);
    const parsed = JSON.parse(extractJson(text));
    return {
      plainText: slidesToText(slides),
      intro: typeof parsed.intro === "string" ? parsed.intro.trim() : "",
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    };
  } catch {
    return fallbackSummary(slides);
  }
}

export async function generateFlashcards(
  slides: Slide[],
  summary?: Summary,
): Promise<Flashcard[]> {
  const c = client();
  if (!c) return fallbackFlashcards(slides);
  try {
    const prompt = `Tu es un tuteur expert. Crée des flashcards (recto/verso) À PARTIR DU RÉSUMÉ ci-dessous. Le résumé est la source principale, les slides ne sont qu'un complément de vérification.

Format JSON exact (aucun texte hors du JSON, pas de markdown) :
{"cards":[{"front":"...","back":"..."}]}

Nombre : entre 12 et 25 cartes, couvrant l'ENSEMBLE du cours (pas seulement le début).

RÈGLES DU RECTO ("front") — le plus important :
- Il doit être AUTO-PORTÉ et COMPRÉHENSIBLE seul, sans contexte.
- JAMAIS un titre de slide, un numéro de slide, ou un fragment coupé en milieu de phrase qui ne veut rien dire.
- Varie la nature du recto d'une carte à l'autre, sans jamais répéter la même formulation deux fois de suite : tour à tour un TERME/CONCEPT précis à définir (ex. « Inflation », « Effet de levier »), une QUESTION courte (ex. « Qu'est-ce que la TVA ? », « Quel est le rôle de l'offre ? »), ou un DÉBUT DE PHRASE à compléter (ex. « La balance des paiements enregistre... »).

RÈGLES DU VERSO ("back") :
- Réponse ou définition claire et complète, 1 à 3 phrases, fidèle au résumé.
- N'invente rien qui ne figure pas dans le cours.

RÉSUMÉ (source principale) :
${summaryToText(summary)}

SLIDES (complément de vérification seulement) :
${slidesToText(slides)}`;

    const text = await ask(c, prompt);
    const parsed = JSON.parse(extractJson(text));
    return (parsed.cards ?? [])
      .filter(
        (card: { front?: unknown; back?: unknown }) =>
          typeof card.front === "string" &&
          card.front.trim().length > 0 &&
          typeof card.back === "string" &&
          card.back.trim().length > 0,
      )
      .map((card: { front: string; back: string }, i: number) => ({
        id: `fc_ai_${i}`,
        front: String(card.front).trim(),
        back: String(card.back).trim(),
      }));
  } catch {
    return fallbackFlashcards(slides);
  }
}

export async function generateQuiz(
  slides: Slide[],
  config: { count: number; difficulty: Difficulty },
  summary?: Summary,
): Promise<QuizQuestion[]> {
  const c = client();
  if (!c) return fallbackQuiz(slides, config);
  try {
    // On mélange les tournures à chaque appel pour que les formulations
    // (et donc les questions) ne se répètent pas d'une session à l'autre.
    const tournures = shuffleArr(TOURNURES_QUIZ)
      .slice(0, 12)
      .map((t, i) => `${i + 1}. ${t}`)
      .join("\n");

    const prompt = `Tu es un tuteur expert. Crée un QCM À PARTIR DU RÉSUMÉ ci-dessous. Le résumé est la source principale, les slides ne sont qu'un complément. ${config.count} questions, difficulté "${config.difficulty}".

Format JSON exact (aucun texte hors du JSON, pas de markdown) :
{"questions":[{"question":"...","options":["a","b","c","d"],"answerIndex":0,"explanation":"..."}]}
"answerIndex" = index 0-based de la bonne réponse dans "options". 4 options pour medium/hard, 3 pour easy.

DIVERSITÉ DES FORMULATIONS (très important) : varie la tournure de CHAQUE question en piochant parmi ces modèles (ordre imposé, tire ta variété de là, utilise-en au moins 10 différents sur l'ensemble du quiz) :
${tournures}

- Chaque question doit avoir une formulation DIFFÉRENTE des autres (varie la tournure ET le sujet précis abordé).
- Les questions doivent rester CONSTAMMENT différentes d'une génération à l'autre, mais TOUJOURS en rapport direct avec le sujet du cours.
- Ne reformule pas plusieurs fois la même idée, ne pose pas deux questions quasi identiques. Si deux questions se ressemblent trop, change l'une d'angle.

FIDÉLITÉ : puise dans le résumé. Les distracteurs doivent être plausibles mais objectivement faux. Aucune invention hors-sujet. L'explication justifie la bonne réponse en 1 phrase courte.

RÉSUMÉ (source principale) :
${summaryToText(summary)}

SLIDES (complément) :
${slidesToText(slides)}`;

    const text = await ask(c, prompt);
    const parsed = JSON.parse(extractJson(text));
    type RawQ = {
      question: unknown;
      options: unknown[];
      answerIndex: unknown;
      explanation?: unknown;
    };
    return (parsed.questions ?? [])
      .map((q: RawQ, i: number) => ({
        id: `q_ai_${i}`,
        question: String(q.question),
        options: (q.options as string[]).map(String),
        answerIndex: Number(q.answerIndex),
        explanation: String(q.explanation ?? ""),
      }))
      .slice(0, config.count);
  } catch {
    return fallbackQuiz(slides, config);
  }
}

/**
 * Génère un QCM à partir des flashcards seules (quand il n'y a pas de slides).
 */
export async function generateQuizFromFlashcards(
  flashcards: Flashcard[],
  config: { count: number; difficulty: Difficulty },
): Promise<QuizQuestion[]> {
  const c = client();
  if (!c) return fallbackQuizFromFlashcards(flashcards, config);
  try {
    const tournures = shuffleArr(TOURNURES_QUIZ)
      .slice(0, 10)
      .map((t, i) => `${i + 1}. ${t}`)
      .join("\n");

    const cardsText = flashcards
      .map((f, i) => `Carte ${i + 1} — Recto : ${f.front} / Verso : ${f.back}`)
      .join("\n");

    const prompt = `Tu es un tuteur expert. Crée un QCM À PARTIR DES FLASHCARDS ci-dessous. ${config.count} questions, difficulté "${config.difficulty}".

Format JSON exact (aucun texte hors du JSON, pas de markdown) :
{"questions":[{"question":"...","options":["a","b","c","d"],"answerIndex":0,"explanation":"..."}]}
"answerIndex" = index 0-based de la bonne réponse dans "options". 4 options pour medium/hard, 3 pour easy.

DIVERSITÉ DES FORMULATIONS : varie la tournure de CHAQUE question en piochant parmi ces modèles :
${tournures}

- Chaque question doit porter sur un concept DIFFÉRENT des flashcards.
- Les distracteurs doivent être plausibles mais objectivement faux.
- L'explication justifie la bonne réponse en 1 phrase courte.

FLASHCARDS :
${cardsText}`;

    const text = await ask(c, prompt);
    const parsed = JSON.parse(extractJson(text));
    type RawQ = {
      question: unknown;
      options: unknown[];
      answerIndex: unknown;
      explanation?: unknown;
    };
    return (parsed.questions ?? [])
      .map((q: RawQ, i: number) => ({
        id: `q_fc_${i}`,
        question: String(q.question),
        options: (q.options as string[]).map(String),
        answerIndex: Number(q.answerIndex),
        explanation: String(q.explanation ?? ""),
      }))
      .slice(0, config.count);
  } catch {
    return fallbackQuizFromFlashcards(flashcards, config);
  }
}

/** Fallback déterministe pour quiz depuis flashcards. */
function fallbackQuizFromFlashcards(
  flashcards: Flashcard[],
  config: { count: number; difficulty: Difficulty },
): QuizQuestion[] {
  const count = Math.min(config.count, flashcards.length);
  const shuffled = shuffleArr([...flashcards]);
  return shuffled.slice(0, count).map((card, i) => {
    const wrong = shuffled
      .filter((f) => f.id !== card.id)
      .slice(0, config.difficulty === "easy" ? 2 : 3)
      .map((f) => f.back);
    const options = [card.back, ...wrong];
    // Mélanger les options
    const optIdx = options.map((opt, idx) => ({ opt, idx }));
    const shuffledOpts = shuffleArr(optIdx);
    return {
      id: `q_fc_fb_${i}`,
      question: `Que signifie « ${card.front} » ?`,
      options: shuffledOpts.map((o) => o.opt),
      answerIndex: shuffledOpts.findIndex((o) => o.idx === 0),
      explanation: `La bonne réponse est : ${card.back}`,
    };
  });
}

/**
 * Explique un concept en profondeur à partir du contexte du cours.
 * Renvoie un texte clair et pédagogique.
 */
export async function explainConcept(
  concept: string,
  slides: Slide[],
  summary?: Summary,
): Promise<string> {
  const c = client();
  if (!c) return `**${concept}**\n\nJe n'ai pas accès à l'IA pour le moment. Active ta clé Gemini pour une explication détaillée.`;
  try {
    const prompt = `Tu es un tuteur expert qui aide un étudiant à comprendre un concept de son cours.

L'étudiant demande : « Explique-moi **${concept}** »

Contexte du cours (slides + résumé) :
${summaryToText(summary)}

SLIDES :
${slidesToText(slides)}

Rédige une explication claire et pédagogique en français :
1. Définition simple du concept (1-2 phrases)
2. Pourquoi c'est important dans le contexte de ce cours
3. Un exemple concret si possible
4. Un point clé à retenir

Format : réponds en texte brut (pas de JSON), avec des paragraphes courts. Maximum 150 mots.`;

    const text = await ask(c, prompt);
    return text.trim() || `**${concept}**\n\nJe n'ai pas trouvé d'explication dans le contenu du cours.`;
  } catch {
    return `**${concept}**\n\nDésolé, je n'ai pas pu générer d'explication pour le moment. Réessaie plus tard.`;
  }
}

/**
 * Reformulation du résumé en langage simplifié (niveau collège).
 */
export async function simplifySummary(summary: Summary): Promise<string> {
  const c = client();
  if (!c) return "Active ta clé Gemini pour la reformulation simplifiée.";
  try {
    const prompt = `Tu es un tuteur qui explique des concepts à un collégien. Reformule le résumé suivant en langage SIMPLE : phrases courtes, mots faciles, pas de jargon. Garde les idées essentielles.

RÉSUMÉ :
${summaryToText(summary)}

Réponds en français, en texte brut (pas de JSON), maximum 200 mots.`;
    return (await ask(c, prompt)).trim();
  } catch { return "Reformulation indisponible pour le moment."; }
}

/**
 * Reformulation du résumé en version approfondie (niveau expert).
 */
export async function deepenSummary(summary: Summary): Promise<string> {
  const c = client();
  if (!c) return "Active ta clé Gemini pour la version approfondie.";
  try {
    const prompt = `Tu es un expert du domaine. Développe le résumé suivant avec des détails techniques, des nuances, et des liens avec d'autres concepts. Niveau master.

RÉSUMÉ :
${summaryToText(summary)}

Réponds en français, en texte brut (pas de JSON), maximum 300 mots.`;
    return (await ask(c, prompt)).trim();
  } catch { return "Version approfondie indisponible pour le moment."; }
}

/**
 * Génère des exemples concrets pour chaque section du résumé.
 */
export async function generateExamples(summary: Summary): Promise<string> {
  const c = client();
  if (!c) return "Active ta clé Gemini pour des exemples concrets.";
  try {
    const prompt = `Tu es un tuteur pédagogue. Pour chaque section du résumé ci-dessous, donne un EXEMPLE CONCRET et RÉALISTE qui illustre le concept. Les exemples doivent être tirés de la vie quotidienne ou de cas réels.

RÉSUMÉ :
${summaryToText(summary)}

Format : texte brut (pas de JSON). Pour chaque section, écris "Exemple : [titre]" suivi de l'exemple en 2-3 phrases. Maximum 250 mots.`;
    return (await ask(c, prompt)).trim();
  } catch { return "Exemples indisponibles pour le moment."; }
}

/**
 * Traduit le résumé du cours en anglais (ou en français si le cours est en anglais).
 */
export async function translateSummary(summary: Summary, targetLang: "fr" | "en"): Promise<string> {
  const c = client();
  if (!c) return `Active ta clé Gemini pour la traduction en ${targetLang === "fr" ? "français" : "anglais"}.`;
  try {
    const langName = targetLang === "fr" ? "français" : "anglais";
    const prompt = `Traduis le résumé suivant en ${langName}. Garde le sens exact, adapte les expressions. Conserve la structure (sections, points clés).

RÉSUMÉ :
${summaryToText(summary)}

Réponds en ${langName}, en texte brut (pas de JSON).`;
    return (await ask(c, prompt)).trim();
  } catch { return "Traduction indisponible pour le moment."; }
}

/** Normalisation locale : minuscules, sans accents ni ponctuation. */
function normalizeLocal(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Correcteur local (fallback hors-ligne ou si l'IA échoue). Tolérant :
 * match exact normalisé, inclusion, ou fort recouvrement de tokens (Jaccard).
 */
function localGrade(expected: string, given: string): { correct: boolean; feedback: string } {
  const e = normalizeLocal(expected);
  const g = normalizeLocal(given);
  if (e.length === 0) return { correct: false, feedback: "Réponse attendue vide." };
  if (g === e) return { correct: true, feedback: "Réponse exacte." };
  const et = new Set(e.split(" ").filter(Boolean));
  const gt = new Set(g.split(" ").filter(Boolean));
  if (et.size && gt.size) {
    let inter = 0;
    for (const t of gt) if (et.has(t)) inter++;
    const union = new Set([...et, ...gt]).size;
    const jacc = inter / union;
    // La réponse donnée contient l'essentiel des mots attendus.
    const coverage = inter / et.size;
    if (jacc >= 0.6 || coverage >= 0.8) {
      return { correct: true, feedback: "Réponse correcte, formulation différente." };
    }
  }
  return {
    correct: false,
    feedback: `Pas tout à fait. Réponse attendue : ${expected.trim()}`,
  };
}

/**
 * Corrige sémantiquement une réponse tapée face à la réponse attendue.
 * Renvoie { correct, feedback }. Utilise Gemini (synonymes/paraphrases acceptés),
 * avec un fallback local flou si pas de clé ou erreur.
 */
export async function gradeAnswer(
  expected: string,
  given: string,
): Promise<{ correct: boolean; feedback: string }> {
  const c = client();
  if (!c) return localGrade(expected, given);
  try {
    const prompt = `Tu es un correcteur bienveillant mais rigoureux sur le fond. Un étudiant répond à une flashcard.

Réponse attendue (recto) : « ${expected} »
Réponse de l'étudiant : « ${given} »

Décide si la réponse de l'étudiant est SÉMANTIQUEMENT CORRECTE : même idée que la réponse attendue, peu importe la formulation, l'ordre des mots, les synonymes, ou une paraphrase. Sois indulgent sur la forme mais STRICT sur le fond :
- correct = true si l'idée principale est juste et suffisamment complète.
- correct = false si l'idée est fausse, absente, trop partielle, ou hors-sujet.

Réponds STRICTEMENT en JSON (aucun texte hors du JSON) :
{"correct": true/false, "feedback": "une phrase courte"}

"feedback" : si correct, un encouragement court ; si faux, un indice ou la réponse attendue reformulée, en une seule phrase.

JSON:`;

    const text = await ask(c, prompt);
    const parsed = JSON.parse(extractJson(text));
    const correct = parsed.correct === true;
    const feedback =
      typeof parsed.feedback === "string" && parsed.feedback.trim().length > 0
        ? parsed.feedback.trim()
        : correct
          ? "Réponse correcte."
          : `Réponse attendue : ${expected.trim()}`;
    return { correct, feedback };
  } catch {
    return localGrade(expected, given);
  }
}

export interface ConceptNode {
  id: string;
  label: string;
  blank: boolean;
}
export interface ConceptEdge {
  from: string;
  to: string;
  label: string;
}
export interface ConceptGraph {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

/** Fallback hors-ligne : petite carte linéaire tirée du résumé ou des slides. */
function fallbackConceptMap(slides: Slide[], summary?: Summary): ConceptGraph {
  const labels: string[] = [];
  const pushShort = (raw: string) => {
    const t = raw.split(/\s+/).slice(0, 3).join(" ").trim();
    if (t && !labels.includes(t)) labels.push(t);
  };
  if (summary?.sections?.length) {
    for (const s of summary.sections) {
      if (s.heading) pushShort(s.heading);
      if (labels.length >= 5) break;
    }
  }
  if (labels.length < 3) {
    for (const s of slides) {
      if (s.title) pushShort(s.title);
      if (labels.length >= 5) break;
    }
  }
  const n = Math.max(3, Math.min(5, labels.length));
  const blankCount = Math.min(3, n - 1);
  const nodes: ConceptNode[] = labels
    .slice(0, n)
    .map((label, i) => ({ id: `n${i}`, label, blank: i < blankCount }));
  const edges: ConceptEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ from: nodes[i].id, to: nodes[i + 1].id, label: i === 0 ? "introduit" : "précède" });
  }
  return { nodes, edges };
}

/** Génère une carte conceptuelle à compléter à partir du résumé. */
export async function generateConceptMap(
  slides: Slide[],
  summary?: Summary,
): Promise<ConceptGraph> {
  const c = client();
  if (!c) return fallbackConceptMap(slides, summary);
  try {
    const prompt = `Tu es un tuteur expert. À partir du RÉSUMÉ ci-dessous, génère une CARTE CONCEPTUELLE simplifiée : des concepts (nœuds) reliés par des flèches étiquetées qui décrivent la relation.

Format JSON exact (aucun texte hors du JSON, pas de markdown) :
{"nodes":[{"id":"n1","label":"Inflation","blank":false},{"id":"n2","label":"Demande","blank":true}],"edges":[{"from":"n2","to":"n1","label":"causée par"}]}

Règles :
- 5 à 8 nœuds. Chaque "label" est un concept ou terme court (1 à 3 mots), fidèle au résumé.
- Au moins 3 nœuds avec "blank":true (ce sont les termes que l'utilisateur devra replacer). Les autres "blank":false sont affichés comme indices.
- 4 à 8 arêtes. Chaque "label" décrit la relation en 1 à 3 mots (ex. « causée par », « mesure », « composante de », « augmente avec », « opposé à »).
- Les "from" et "to" doivent référencer des ids existant dans "nodes". Évite les cycles directs (A→B→A).
- Place les nœuds "blank" de sorte que les nœuds indices autour donnent assez de contexte pour les deviner, sans que la réponse soit triviale.
- N'invente rien hors du résumé.

RÉSUMÉ (source principale) :
${summaryToText(summary)}

SLIDES (complément) :
${slidesToText(slides)}`;

    const text = await ask(c, prompt);
    const parsed = JSON.parse(extractJson(text));
    const nodes: ConceptNode[] = (parsed.nodes ?? [])
      .map((n: { id?: unknown; label?: unknown; blank?: unknown }, i: number) => ({
        id: typeof n.id === "string" ? n.id : `n${i}`,
        label: String(n.label ?? "").trim(),
        blank: n.blank === true,
      }))
      .filter((n: ConceptNode) => n.label.length > 0);
    const knownIds = new Set(nodes.map((n) => n.id));
    const edges: ConceptEdge[] = (parsed.edges ?? [])
      .map((e: { from?: unknown; to?: unknown; label?: unknown }) => ({
        from: String(e.from ?? ""),
        to: String(e.to ?? ""),
        label: String(e.label ?? "").trim(),
      }))
      .filter((e: ConceptEdge) => knownIds.has(e.from) && knownIds.has(e.to) && e.label.length > 0);
    const blankCount = nodes.filter((n) => n.blank).length;
    if (nodes.length < 3 || blankCount < 2 || edges.length === 0) {
      return fallbackConceptMap(slides, summary);
    }
    return { nodes, edges };
  } catch {
    return fallbackConceptMap(slides, summary);
  }
}