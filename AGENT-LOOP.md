# Cerebra — agent-loop (boucle autonome)

Script Node qui fait tourner Claude en continu sur Cerebra, avec contexte persistant
et mémoire durable sur disque. C'est l'option "vraie boucle while-true sur ta machine".

## Ce qu'il fait

- Lit `BACKLOG.md`, `LOOP-NOTES.md`, `PROGRESS.md` pour savoir où on en est.
- À chaque itération : choisit 1 à 3 objectifs, les implémente (read/write/edit/bash),
  vérifie le build (`npx tsc --noEmit`), met à jour `BACKLOG.md` + `PROGRESS.md` +
  `LOOP-NOTES.md`, puis auto-critique son rendu.
- Garde le contexte en mémoire entre les itérations (tableau `messages`), prune quand
  ça dépasse ~60k tokens, et sauve l'état sur disque après chaque tour (reprise après
  crash ou Ctrl+C).
- Ne s'arrête que quand tu kill le process ou que tu crées le fichier `.stop-loop`.

## Lancement

```powershell
cd "C:\Users\Momoo\Desktop\Ressources - Templates\jarvis-starter-kit\jarvis-starter-kit\study-app"
$env:GEMINI_API_KEY="AIza..."   # ta clé API Google AI Studio (Gemini)
node agent-loop.mjs
```

> La clé n'est pas dans le code ni commitée. Mets-la dans l'env de la session
> PowerShell qui lance le script.

## Arrêt

- `Ctrl+C` dans le terminal : termine proprement après l'itération en cours, sauve
  l'état.
- Ou crée le fichier `study-app/.stop-loop` : le script s'arrête au prochain cycle.

## Reprise

Relance `node agent-loop.mjs` : l'état (contexte) se recharge depuis
`.agent-loop-state.json`. Tu repars où tu t'es arrêté.

Pour repartir de zéro (contexte vierge) : supprime `.agent-loop-state.json`.

## Coût

Le script consomme du budget API tant qu'il tourne. Modèle `claude-opus-4-8`.
Surveille ta consommation. Si tu veux réduire le coût, change `MODEL` en
`claude-sonnet-4-6` dans `agent-loop.mjs` (moins cher, un peu moins fort).

## Ne pas faire tourner en double

Ne lance pas ce script ET la session `/loop` Claude Code en même temps : ils
éditeraient les mêmes fichiers en parallèle (conflits). Quand tu lances le script,
dis-le à Claude (session) pour qu'il arrête sa propre boucle.