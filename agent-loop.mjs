// Cerebra — Boucle autonome while-true.
//
// Lance Claude en continu sur le backlog de Cerebra, avec un contexte persistant
// (le tableau messages survit entre les itérations) et une mémoire durable sur
// disque (BACKLOG.md, PROGRESS.md, LOOP-NOTES.md). S'arrête quand tu kill le
// process (Ctrl+C) ou quand le fichier .stop-loop est présent.
//
// Lancement :
//   $ cd study-app
//   $ $env:ANTHROPIC_API_KEY="sk-ant-..."   # PowerShell
//   $ node agent-loop.mjs
//
// Arrêt :
//   Ctrl+C   -> termine proprement après l'itération en cours
//   ou crée le fichier  study-app/.stop-loop  -> s'arrête au prochain cycle

import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = __dirname; // study-app/
const STATE_FILE = path.join(PROJECT, ".agent-loop-state.json");
const STOP_FILE = path.join(PROJECT, ".stop-loop");
const NOTES_FILE = path.join(PROJECT, "LOOP-NOTES.md");
const BACKLOG_FILE = path.join(PROJECT, "BACKLOG.md");
const PROGRESS_FILE = path.join(PROJECT, "PROGRESS.md");

const MODEL = "claude-opus-4-8";
const MAX_TOKENS = 64000;
const MAX_CONTEXT_CHARS = 240_000; // seuil de prune (~60k tokens)
const BASH_TIMEOUT_MS = 180_000;

const client = new Anthropic(); // lit ANTHROPIC_API_KEY dans l'env

// ---------------------------------------------------------------------------
// System prompt : la mission, la méthodo, l'auto-critique.
// ---------------------------------------------------------------------------
const SYSTEM = `Tu es l'agent autonome qui améliore Cerebra, une app mobile d'étude (Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui base-ui, qui utilise la prop \`render\` et NON \`asChild\`). Tu travailles en français.

Ta mission : rendre Cerebra la meilleure app mobile possible, en dépilant le backlog \`study-app/BACKLOG.md\` et en proposant tes propres améliorations quand le backlog est épuisé.

Méthode par itération (une itération = un de mes messages "Continue") :
1. Lis \`BACKLOG.md\` et \`LOOP-NOTES.md\` pour savoir où on en est.
2. Choisis 1 à 3 objectifs cohérents du backlog (ou une amélioration pertinente).
3. Implémente-les avec les outils (read_file, write_file, edit_file, list_files, bash).
4. Vérifie le build : lance \`bash\` avec \`npx tsc --noEmit\` (et si pertinent \`npm run build\`). Corrige jusqu'à ce que ça compile sans erreur.
5. Mets à jour \`BACKLOG.md\` (coche les objectifs faits) et ajoute une entrée en haut de \`PROGRESS.md\` (date du jour = 2026-06-22, résume ce qui a été fait, build vérifié).
6. Note dans \`LOOP-NOTES.md\` (une ligne par objectif) ce que tu as appris, les pièges rencontrés, les décisions prises. Ces notes sont ta mémoire durable entre les itérations.
7. Auto-critique ton rendu : avant de finir, vérifie que ce que tu as écrit est correct, cohérent avec le code existant, et que le build passe vraiment. Signale honnêtement si quelque chose est incomplet.

Règles strictes :
- Toujours vérifier le build avant de cocher un objectif. Un objectif non vérifié = pas coché.
- Respecter les conventions du code existant (style, nommage, structure shadcn/ui base-ui avec \`render\`).
- Ne pas casser ce qui marche. Préférer des petits changements sûrs à des refactors gros.
- Pas d'em dashes (tirets longs) dans les textes utilisateur, commentaires et docs. Virgules ou points.
- Communique en français. Sois direct, pas de blabla.
- Quand tu as fini ton itération, réponds par un court résumé de ce qui a été fait et ce qui reste.

Tu es autonome. Si tu hésites entre deux approches, choisis la plus simple qui marche et note ton choix. N'attends pas d'instructions.`;

// ---------------------------------------------------------------------------
// Outils exposés à Claude.
// ---------------------------------------------------------------------------
const tools = [
  {
    name: "read_file",
    description:
      "Lire le contenu d'un fichier du projet study-app. Le chemin est relatif à study-app/ (ex: 'src/components/activities.tsx'). Retourne le contenu brut.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Chemin relatif à study-app/" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description:
      "Écrire/créer/écraser un fichier du projet study-app. path relatif à study-app/.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Chemin relatif à study-app/" },
        content: { type: "string", description: "Contenu complet du fichier" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "edit_file",
    description:
      "Remplacer une occurrence exacte de old_str par new_str dans un fichier. Erreur si 0 ou >1 correspondance. path relatif à study-app/.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Chemin relatif à study-app/" },
        old_str: { type: "string", description: "Texte exact à remplacer" },
        new_str: { type: "string", description: "Texte de remplacement" },
      },
      required: ["path", "old_str", "new_str"],
    },
  },
  {
    name: "list_files",
    description:
      "Lister les fichiers d'un dossier du projet (récursif). path relatif à study-app/, défaut '.'.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Dossier relatif à study-app/" },
        glob: {
          type: "string",
          description: "Pattern optionnel, ex: 'src/**/*.tsx'",
        },
      },
    },
  },
  {
    name: "bash",
    description:
      "Exécuter une commande shell dans study-app/ (cwd = study-app). Utilise pour vérifier le build (npx tsc --noEmit, npm run build), git, etc. Timeout 180s. Retourne stdout+stderr.",
    input_schema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Commande shell à exécuter" },
      },
      required: ["command"],
    },
  },
];

// ---------------------------------------------------------------------------
// Exécution des outils (côté script, pas côté API).
// ---------------------------------------------------------------------------
function rel(p) {
  const full = path.resolve(PROJECT, p);
  // empêcher de sortir du projet
  if (!full.startsWith(PROJECT)) {
    return { is_error: true, content: `Chemin hors projet: ${p}` };
  }
  return full;
}

function executeTool(name, input) {
  try {
    switch (name) {
      case "read_file": {
        const full = rel(input.path);
        if (full.is_error) return full;
        if (!fs.existsSync(full))
          return { is_error: true, content: `Fichier introuvable: ${input.path}` };
        const content = fs.readFileSync(full, "utf8");
        return { content: content };
      }
      case "write_file": {
        const full = rel(input.path);
        if (full.is_error) return full;
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, input.content, "utf8");
        return { content: `Écrit ${input.path} (${input.content.length} octets)` };
      }
      case "edit_file": {
        const full = rel(input.path);
        if (full.is_error) return full;
        if (!fs.existsSync(full))
          return { is_error: true, content: `Fichier introuvable: ${input.path}` };
        const original = fs.readFileSync(full, "utf8");
        const occurrences = original.split(input.old_str).length - 1;
        if (occurrences === 0)
          return {
            is_error: true,
            content: `old_str introuvable dans ${input.path}`,
          };
        if (occurrences > 1)
          return {
            is_error: true,
            content: `old_str trouvé ${occurrences} fois dans ${input.path} (doit être unique)`,
          };
        const next = original.replace(input.old_str, input.new_str);
        fs.writeFileSync(full, next, "utf8");
        return { content: `Édité ${input.path}` };
      }
      case "list_files": {
        const dir = input.path || ".";
        const full = rel(dir);
        if (full.is_error) return full;
        if (!fs.existsSync(full))
          return { is_error: true, content: `Dossier introuvable: ${dir}` };
        const out = [];
        const walk = (d, base) => {
          for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
            if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git")
              continue;
            const p = path.join(d, entry.name);
            const relp = path.relative(PROJECT, p).replace(/\\/g, "/");
            if (entry.isDirectory()) {
              out.push(relp + "/");
              walk(p, base);
            } else {
              out.push(relp);
            }
          }
        };
        walk(full);
        let list = out;
        if (input.glob) {
          const re = globToRegex(input.glob);
          list = out.filter((x) => re.test(x.replace(/\/$/, "")));
        }
        return { content: list.slice(0, 500).join("\n") };
      }
      case "bash": {
        try {
          const out = execSync(input.command, {
            cwd: PROJECT,
            timeout: BASH_TIMEOUT_MS,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
            maxBuffer: 2 * 1024 * 1024,
          });
          const trimmed = (out || "").slice(0, 20000);
          return { content: trimmed || "(aucune sortie)" };
        } catch (e) {
          const msg = [
            e.stdout ? String(e.stdout).slice(0, 10000) : "",
            e.stderr ? String(e.stderr).slice(0, 10000) : "",
            `exit code: ${e.status ?? "n/a"}`,
          ]
            .filter(Boolean)
            .join("\n");
          return { is_error: true, content: msg || String(e) };
        }
      }
      default:
        return { is_error: true, content: `Outil inconnu: ${name}` };
    }
  } catch (e) {
    return { is_error: true, content: `Erreur outil ${name}: ${e?.message ?? e}` };
  }
}

function globToRegex(g) {
  // conversion minimale glob -> regex (supporte *, **, ?)
  let s = g.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  s = s.replace(/\*\*/g, "<<GLOBSTAR>>");
  s = s.replace(/\*/g, "[^/]*");
  s = s.replace(/<<GLOBSTAR>>/g, ".*");
  s = s.replace(/\?/g, "[^/]");
  return new RegExp("^" + s + "$");
}

// ---------------------------------------------------------------------------
// Gestion du contexte persistant : prune quand ça grossit trop.
// ---------------------------------------------------------------------------
function messagesCharCount(messages) {
  return JSON.stringify(messages).length;
}

function pruneMessages(messages) {
  if (messagesCharCount(messages) <= MAX_CONTEXT_CHARS) return messages;
  // Garde le 1er message utilisateur (mission) + la fin de la conversation.
  // On coupe les tours du milieu (paires assistant+user tool_results) entières.
  const head = messages.slice(0, 2); // mission + éventuel 1er assistant
  const tailKeep = 10; // garder les 10 derniers messages
  const tail = messages.slice(-tailKeep);
  const pruned = [
    ...head,
    {
      role: "user",
      content:
        "[Contexte plus ancien élagué. Consulte BACKLOG.md, PROGRESS.md et LOOP-NOTES.md pour retrouver l'historique. Continue où tu en étais.]",
    },
    ...tail,
  ];
  console.log(
    `\n[prune] contexte réduit de ${messagesCharCount(messages)} à ${messagesCharCount(
      pruned
    )} chars\n`
  );
  return pruned;
}

// ---------------------------------------------------------------------------
// Sauvegarde / restauration de l'état pour reprise après crash.
// ---------------------------------------------------------------------------
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      const s = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
      if (Array.isArray(s.messages) && s.messages.length) {
        console.log(`[reprise] état chargé : ${s.messages.length} messages`);
        return s.messages;
      }
    } catch (e) {
      console.log("[reprise] état corrompu, on repart à zéro");
    }
  }
  return null;
}

function saveState(messages) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ messages }), "utf8");
  } catch (e) {
    console.error("[save] échec:", e?.message);
  }
}

function stopRequested() {
  return fs.existsSync(STOP_FILE);
}

// ---------------------------------------------------------------------------
// Un "tour" = on envoie les messages, on boucle sur les tool_use jusqu'à end_turn.
// ---------------------------------------------------------------------------
async function runTurn(messages) {
  let safety = 0;
  while (true) {
    if (++safety > 60) {
      console.error("\n[tour] trop d'itérations outil, on force la fin du tour");
      break;
    }
    if (stopRequested()) {
      console.log("\n[stop] fichier .stop-loop détecté, arrêt du tour");
      return { stop: true };
    }

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      system: SYSTEM,
      tools,
      messages,
    });

    stream.on("text", (t) => process.stdout.write(t));

    let message;
    try {
      message = await stream.finalMessage();
    } catch (e) {
      console.error("\n[API] erreur:", e?.message ?? e);
      if (e?.status === 429 || e?.status >= 500) {
        console.log("[API] erreur transitoire, on attend 30s et on réessaie");
        await sleep(30_000);
        continue;
      }
      throw e;
    }

    // écho complet (y compris thinking + tool_use) pour la persistance
    messages.push({ role: "assistant", content: message.content });

    if (message.stop_reason === "end_turn") {
      console.log("\n");
      return { stop: false };
    }
    if (message.stop_reason === "max_tokens") {
      console.log("\n[tour] max_tokens atteint, on continue le tour");
      messages.push({
        role: "user",
        content: "Continue exactement où tu t'es arrêté.",
      });
      continue;
    }
    if (message.stop_reason === "refusal") {
      console.error("\n[tour] refusal, arrêt");
      return { stop: true };
    }
    if (message.stop_reason === "pause_turn") {
      // resume serveur : renvoyer tel quel
      continue;
    }
    if (message.stop_reason !== "tool_use") {
      console.log(`\n[tour] stop_reason inattendu: ${message.stop_reason}`);
      return { stop: false };
    }

    // tool_use : exécuter tous les outils appelés en parallèle
    const toolUses = message.content.filter((b) => b.type === "tool_use");
    const toolResults = [];
    for (const tu of toolUses) {
      process.stdout.write(`\n[outil] ${tu.name} ${JSON.stringify(tu.input).slice(0, 120)}\n`);
      const res = executeTool(tu.name, tu.input);
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: typeof res.content === "string" ? res.content : JSON.stringify(res.content),
        is_error: res.is_error === true,
      });
    }
    messages.push({ role: "user", content: toolResults });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Boucle principale.
// ---------------------------------------------------------------------------
async function main() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    console.error("Erreur: définis ANTHROPIC_API_KEY dans l'environnement.");
    console.error("PowerShell:  $env:ANTHROPIC_API_KEY=\"sk-ant-...\"");
    process.exit(1);
  }

  console.log("=== Cerebra agent-loop ===");
  console.log(`Projet: ${PROJECT}`);
  console.log(`Modèle: ${MODEL}`);
  console.log(`Stop: Ctrl+C ou crée ${STOP_FILE}`);
  console.log("");

  // S'assurer que LOOP-NOTES.md existe
  if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(
      NOTES_FILE,
      "# Notes de la boucle autonome\n\nMémoire durable entre les itérations de l'agent.\nUne ligne par apprentissage / décision / piège.\n\n",
      "utf8"
    );
  }

  let messages = loadState();
  if (!messages) {
    messages = [
      {
        role: "user",
        content:
          "Démarre la boucle. Lis BACKLOG.md et LOOP-NOTES.md, choisis le prochain objectif à faire, implémente-le, vérifie le build, mets à jour BACKLOG.md et PROGRESS.md, note dans LOOP-NOTES.md, puis auto-critique. Commence maintenant.",
      },
    ];
  }

  let iteration = 0;
  let stopping = false;

  const cleanStop = async (reason) => {
    if (stopping) return;
    stopping = true;
    console.log(`\n[arrêt] ${reason} — sauvegarde de l'état…`);
    saveState(messages);
    console.log(`[arrêt] état sauvegardé dans ${STATE_FILE}`);
    console.log("[arrêt] pour reprendre: relance `node agent-loop.mjs` (l'état se recharge)");
    process.exit(0);
  };
  process.on("SIGINT", () => cleanStop("SIGINT (Ctrl+C)"));
  process.on("SIGTERM", () => cleanStop("SIGTERM"));

  while (true) {
    if (stopRequested()) {
      await cleanStop("fichier .stop-loop détecté");
    }

    iteration++;
    console.log(`\n========== Itération ${iteration} ==========`);

    try {
      const res = await runTurn(messages);
      if (res?.stop) {
        await cleanStop("fin demandée pendant le tour");
      }
    } catch (e) {
      console.error("\n[main] erreur non gérée:", e?.message ?? e);
      saveState(messages);
      console.log("[main] état sauvegardé, on attend 60s avant de reprendre");
      await sleep(60_000);
      continue;
    }

    // prune + sauvegarde entre les itérations
    messages = pruneMessages(messages);
    saveState(messages);

    // relance le tour suivant avec un prompt court
    messages.push({
      role: "user",
      content:
        "Itération suivante. Re-lis BACKLOG.md et LOOP-NOTES.md, choisis le prochain objectif, implémente, vérifie le build, mets à jour BACKLOG.md + PROGRESS.md + LOOP-NOTES.md, auto-critique. Continue.",
    });
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});