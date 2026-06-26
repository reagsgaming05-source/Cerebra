# Cerebra — Roadmap des 20 fonctionnalités avancées

> Document d'exploration et de planification. **Rien n'est implémenté.** Chaque fiche
> est cadrée par rapport à l'architecture réelle du projet (voir section Stack ci-dessous).
> À valider/prioriser avec Muhamad avant tout `/spec`.

## Stack actuel (vérifié dans le code, pas supposé)

- **Framework** : Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui sur base-ui (pas Radix).
- **LLM** : Google Gemini `gemini-2.5-flash` via `@google/genai` (`src/lib/ai.ts`). Free tier Google AI Studio, sans carte bancaire. Appels non-streamés, prompts qui demandent du JSON brut, parsés à la main (`extractJson`). **Aucun call vision/multimodal aujourd'hui** (texte seulement).
- **Fallback IA** : chaque génération (`generateSummary`, `generateFlashcards`, `generateQuiz`) a un équivalent déterministe gratuit dans `src/lib/fallback.ts`, utilisé automatiquement si `GEMINI_API_KEY` est absent. C'est un invariant fort du projet ("l'app marche sans clé API").
- **Base de données : aucune.** Persistance 100% `localStorage` navigateur (`study-app:courses:v1` + clés séparées pour réglages/streak/objectif/tri/onboarding/thème). Réactivité via `CustomEvent` + `window.addEventListener`, pas de lib d'état.
- **Stockage fichiers : aucun.** Les `.pptx`/`.pdf` uploadés sont parsés en mémoire côté serveur (route API) puis jetés. Seul le texte extrait (`Slide[]`) survit, côté client.
- **Auth : aucune.** Un seul utilisateur implicite par navigateur, pas de compte, pas de sync multi-appareil.
- **Sources de contenu actuelles** : `.pptx` (JSZip + XML, `src/lib/pptx.ts`) et `.pdf` (`pdf-parse`, `src/lib/pdf.ts`), normalisés en `Slide[]` (title/bullets/notes) commun.
- **Modèle de données** (`src/lib/types.ts`) : `Course` a `slides`, `summary?`, `flashcards?`, `quizRuns` (compteur seulement — **les questions de quiz ne sont jamais persistées**, aucune n'est taguée par notion), et un parcours gamifié de 6 `LearningNode` (xp/unlocked/completed/bestScore/attempts).
- **Conventions établies** à réutiliser : un hook `use*` par feature localStorage (`useDailyGoal`, `useSort`, `useStreak`…), une fonction IA + son fallback en miroir, des composants maison plutôt que des libs lourdes (confetti canvas custom, parcours en CSS custom plutôt que React Flow).

### Conséquence directe sur les 20 fiches

Il n'y a **aucune base de données serveur, aucune auth, aucun stockage de fichier binaire,
aucun job planifié, aucun service externe (TTS/OCR/email/push/OAuth)**. Beaucoup de
fonctionnalités "normales" dans une app SaaS demandent ici de poser une fondation qui
n'existe pas du tout. Je le signale fonctionnalité par fonctionnalité plutôt que de le
cacher dans la complexité.

### Chevauchement avec BACKLOG.md (déjà planifié, pas encore construit)

`BACKLOG.md` a déjà 29 objectifs non faits (#22 à #50). Plusieurs recoupent directement
les 20 fonctionnalités demandées ici — à fusionner plutôt qu'à dupliquer :

| Fonctionnalité demandée | Item BACKLOG.md existant |
|---|---|
| #1 Quiz auto-généré | #29 review des erreurs, #30 timer/question, #46 quiz sans slides, #47 difficulté adaptative |
| #2 Flashcards SRS | #28 — **identique**, déjà écrit mot pour mot dans BACKLOG.md |
| #6 Explique-moi simplement | #48 "expliquer ce concept" — cousin proche |
| #9 Extraction dates/formules/définitions | #34 glossaire généré — cousin proche, fusionnable |
| #10 Suivi de progression | #18 stats par cours — **déjà fait** pour la vue par cours ; ici il manque la vue agrégée multi-cours |

---

## Les 20 fiches

### 1. Quiz auto-généré (feedback immédiat + revue des erreurs)

- **Objectif** : transformer la lecture passive en rappel actif.
- **Constat** : le feedback immédiat par question **existe déjà** (`QuizActivity`, `src/components/activities.tsx:407-453` montre correct/incorrect + explication dès le clic). Ce qui manque vraiment : citer le passage source, et un écran de revue des erreurs en fin de quiz (= BACKLOG #29).
- **Parcours** : génère le quiz → réponds question par question (déjà fait) → écran de fin actuel (score) → **nouveau** : liste des questions ratées avec explication + lien vers la section du résumé concernée.
- **Technique** : ajouter `sourceSlideIndex?: number` à `QuizQuestion` (types.ts), demander au prompt `generateQuiz` de le renseigner, idem dans `fallbackQuiz`. Stocker les réponses de la tentative en cours en state local (déjà le cas via `qi`/`selected`) pour construire l'écran de revue — pas besoin de persistance pour ça seul.
- **Complexité** : **S**. Dépendance : aucune avec les 19 autres, mais bloquant pour #19 (tagging par notion, voir plus bas) si on veut aller plus loin.
- **Risques** : le LLM peut mal référencer le slide source ; fallback simple (pas de référencement) acceptable en v1.

### 2. Flashcards avec répétition espacée (SRS)

- **Objectif** : mémorisation long terme (= BACKLOG #28, à fusionner).
- **Parcours** : génération existante des flashcards (`Flashcard.front/back`) → ajout d'un mode "réviser" avec swipe 3 états → recalcul de la date de prochaine révision → nouvelle carte sur la home "À réviser aujourd'hui" agrégeant tous les cours (pattern identique à la carte "Objectif du jour" déjà sur `src/app/page.tsx`).
- **Technique** : étendre `Flashcard` (types.ts) avec `interval?, easeFactor?, dueDate?, repetitions?`. SM-2 simplifié en pur TS (`src/lib/srs.ts`, aucune dépendance). Hook `useDueFlashcards()` style `useDailyGoal`, lit tous les cours via `useCourses()` et filtre `dueDate <= today`.
- **Complexité** : **M**. Dépendance : aucune. Attention à la régénération des flashcards : aujourd'hui elles ne sont générées qu'une fois (`!course.flashcards`) et jamais recréées — bon point, ça préserve la progression SRS par défaut, mais l'édition individuelle (#25) devra préserver les champs SRS lors d'un edit.
- **Risques** : si on régénère un jour les cartes (changement de prompt, etc.), tout l'historique SRS est perdu — prévoir un garde-fou explicite (ne jamais écraser `course.flashcards` si déjà présent, déjà le comportement actuel).

### 3. Carte mentale (mindmap)

- **Objectif** : vue d'ensemble visuelle pour apprenants visuels.
- **Parcours** : nouvel onglet/bouton "Carte mentale" → arbre généré (thème → sous-thèmes → détails) → noeuds cliquables renvoyant à la section du résumé → export image.
- **Technique** : nouvelle fonction `generateMindmap(slides, summary)` dans `ai.ts` (+ fallback déterministe basé sur `sections`/`keyPoints` existants, structure JSON arbre profondeur ≤ 4). Rendu : étant donné le style du projet (composants maison plutôt que libs lourdes, ex. `LearningPath` en CSS pur sans lib de graphe), je recommande un **arbre récursif collapsible custom** (`<MindmapNode>`) avant de réflexe vers React Flow — plus léger, plus cohérent avec le reste du code. Export image via `html-to-image` (canvas) ou capture native.
- **Complexité** : **M**. Dépendance : réutilise `summary` (donc #1 logiquement après génération du résumé).
- **Risques** : cours très longs → arbre illisible, regrouper par section existante plutôt que par slide brut.

### 4. Fiche de révision condensée (export PDF)

- **Objectif** : document imprimable d'une page pour révision de dernière minute.
- **Parcours** : bouton "Générer ma fiche" → choix 1 page dense / 2 pages aérées → condensé ultra-synthétique → aperçu → export PDF.
- **Technique** : nouvelle fonction `generateCheatsheet(slides, summary)` (même pattern ai.ts+fallback). **Pour le PDF lui-même**, le projet n'a aucune lib de rendu PDF (seulement `pdf-parse` pour *lire*). Plutôt que d'ajouter Puppeteer (lourd, Chromium headless, mauvais fit serverless) ou react-pdf (mise en page limitée), je recommande en v1 une **page dédiée avec CSS `@media print`** + `window.print()` côté client — zéro nouvelle dépendance, cohérent avec "pas d'infra ajoutée si évitable".
- **Complexité** : **S** (version impression navigateur) / **L** (vrai PDF serveur pixel-perfect avec formules LaTeX).
- **Risques** : rendu impression incohérent entre navigateurs ; formules math nécessitent KaTeX (nouvelle dépendance, voir #9).

### 5. Détection et surlignage des notions clés

- **Objectif** : repérer l'important sans tout relire.
- **Parcours** : dans l'onglet Résumé, termes surlignés par catégorie (définition/date/formule/nom propre), tooltip au survol/clic.
- **Technique** : nouvelle fonction IA qui retourne les notions avec leur position texte + catégorie. Rendu en texte enrichi : découper `section.content` aux positions retournées, wrapper en `<span>` avec `Tooltip` (déjà dans `src/components/ui/tooltip.tsx` — composant existant, juste à réutiliser).
- **Complexité** : **M**. Dépendance forte avec #9 (même extraction de notions, voir bricks partagées) — à construire ensemble plutôt que deux fois.
- **Risques** : positions retournées par le LLM peuvent ne pas matcher exactement le texte (offsets faux) → préférer un matching par sous-chaîne côté serveur plutôt que de faire confiance aux index bruts du LLM.

### 6. Mode "explique-moi simplement"

- **Objectif** : reformulation adaptée au niveau de l'élève.
- **Parcours** : slider niveau (collège/lycée/approfondi) sur chaque section du résumé → reformulation à la demande, mise en cache.
- **Technique** : nécessite un **id stable par section** — `SummarySection` (types.ts) n'en a pas aujourd'hui (juste `heading`/`content`), à ajouter en prérequis. Cache par `(sectionId, niveau)` : un nouveau champ `Course.simplifications?: Record<string, string>` plutôt qu'un cache global, pour rester dans le modèle 100% localStorage existant.
- **Complexité** : **M**. Recoupe BACKLOG #35 (résumé en plusieurs styles) — même mécanisme (résumé paramétré + cache), à fusionner.
- **Risques** : coût LLM si pas de cache — le cache par cours (pas par session) limite déjà bien le risque puisqu'il n'y a qu'un seul "utilisateur" par navigateur ici (pas de multi-élèves sur le même cours, donc pas de sur-génération inter-utilisateurs comme dans une vraie SaaS multi-tenant).

### 7. Chat avec le cours (RAG)

- **Objectif** : questions précises sans tout relire.
- **Parcours** : zone de chat → question → réponse citant le passage source → lien vers le document.
- **Technique** : nécessite chunking + embeddings + recherche de similarité + base vectorielle. **C'est la fonctionnalité qui casse le plus l'architecture actuelle** : Cerebra n'a aucune base de données serveur aujourd'hui. Ajouter pgvector (ou managé) = introduire la première vraie persistance serveur du projet.
- **Complexité** : **XL**. Dépendance structurelle : aucune des 19 autres fonctionnalités n'a besoin d'une vraie base de données — si on construit cette brique pour #7, elle peut aussi débloquer #11 (notifs), #18 (collab), #14 (OAuth) à moindre coût marginal. À traiter comme une décision d'infra, pas juste une feature.
- **Risques** : coût + latence par message, hallucinations si contexte insuffisant (toujours forcer "je ne trouve pas cette info dans le cours" si le score de similarité est faible).

### 8. Génération d'examens blancs avec corrigé

- **Objectif** : conditions proches de l'évaluation réelle, questions ouvertes.
- **Parcours** : "Générer un examen blanc" → durée/nb questions → mode sans aide (timer, pas de retour) → corrigé détaillé + barème.
- **Technique** : nouvelle fonction `generateExam` (même pattern), réutilise le moteur de timer déjà existant (`SpeedActivity` a déjà un countdown `setTimeout` — pattern à copier). La correction de réponses rédigées par le LLM est un nouvel usage : appel IA *après coup* qui reçoit la réponse de l'élève + le corrigé attendu et retourne une note + commentaire.
- **Complexité** : **L**. Dépendance : partage la génération de questions avec #1/#19 (brick commune).
- **Risques** : notation LLM incohérente d'une tentative à l'autre pour une même réponse — prévoir une option "demander une relecture" plutôt que de présenter la note comme définitive.

### 9. Extraction de dates/formules/définitions

- **Objectif** : répertoire factuel séparé du texte narratif.
- **Parcours** : onglet "Éléments clés" en 3 sections, recherche/filtre.
- **Technique** : fonction `generateKeyFacts(slides)` (ai.ts + fallback), sortie JSON catégorisée `{dates, formulas, definitions}`. Recoupe BACKLOG #34 (glossaire) — à fusionner en une seule fonctionnalité "extraction structurée".
- **Complexité** : **M**. Partage la brick d'extraction avec #5 (surlignage).
- **Risques** : rendu de formules scientifiques nécessite un moteur LaTeX (KaTeX, nouvelle dépendance, ~250kb) — sans ça, les formules s'afficheront en texte brut illisible. À évaluer si vraiment nécessaire pour le public cible avant d'ajouter la dépendance.

### 10. Suivi de progression par cours/matière (dashboard agrégé)

- **Objectif** : vue d'ensemble maîtrisé vs à revoir.
- **Constat** : la version *par cours* existe déjà entièrement (`CourseStats`, BACKLOG #18, fait). Ce qui manque ici est uniquement la **vue agrégée multi-cours/matière** sur la home.
- **Parcours** : nouvelle section sur `src/app/page.tsx`, cartes regroupées par "matière" (concept qui n'existe pas encore dans `Course` — à ajouter, ex. `subject?: string` libre ou tags).
- **Technique** : calcul dérivé de `nodes`/`progress`/`bestScore` déjà présents sur chaque `Course`, agrégé côté client (pas besoin de nouvelle persistance, juste un `useMemo` sur `useCourses()`).
- **Complexité** : **S**. Dépendance : nécessite de décider d'un concept "matière" (impacte aussi #35 organisation des cours, hors scope des 20 mais à anticiper).
- **Risques** : formule de score composite perçue comme arbitraire — en discuter avant de coder (déjà un risque que tu as toi-même identifié).

### 11. Rappels de révision intelligents

- **Objectif** : relancer au bon moment (courbe de l'oubli).
- **Parcours v1 (sans nouvelle infra)** : badge/bannière dans l'app au prochain lancement ("Tu as 3 cours à réviser aujourd'hui"), calculé localement depuis les dues SRS (#2) et `lastStudiedAt` (déjà sur `Course`, BACKLOG #18). **Parcours v2 (vraie notif push/email)** : nécessite service worker + Push API + (email via Resend ou push navigateur) + un cron — aucun de ces éléments n'existe aujourd'hui (BACKLOG #41-44 PWA pas encore fait).
- **Technique v1** : hook `useReminders()` purement client, zéro service externe. **v2** : job planifié, ce qui suppose un backend qui tourne en continu — incompatible avec "app 100% statique/localStorage" sans réflexion préalable sur l'hébergement.
- **Complexité** : **S** (v1 in-app) / **XL** (v2 vraies notifications). Dépendance : v2 bloquée par #41-44 (PWA/service worker) du BACKLOG.
- **Risques** : spam perçu — réglage de fréquence dans Réglages (page existante, juste un champ à ajouter).

### 12. Fusion/comparaison de cours qui se recoupent

- **Objectif** : éviter la redondance entre cours similaires.
- **Parcours** : à l'upload, détection de similarité → suggestion de fusion → vue comparative.
- **Technique** : la vraie version demande des embeddings (aucune lib de ce type aujourd'hui). **v1 moins chère** : heuristique texte (titre + `normalize()` déjà dans `search.ts` + overlap de `keyPoints`) avant d'investir dans des embeddings, cohérent avec la philosophie fallback du projet (logique déterministe d'abord, IA lourde seulement si ça ne suffit pas).
- **Complexité** : **L** (la vraie demande de l'utilisateur — comparaison sémantique fine — reste XL).
- **Risques** : faux positifs de similarité ; à placer en fin de roadmap comme le suggère le user lui-même.

### 13. OCR amélioré pour notes manuscrites/photo

- **Objectif** : couvrir la photo de tableau/notes manuscrites.
- **Constat important** : aujourd'hui il n'y a **aucun chemin d'upload image du tout** (seulement `.pptx`/`.pdf` dans `upload-zone.tsx`). C'est une fonctionnalité entièrement nouvelle, pas une amélioration.
- **Technique** : bonne nouvelle — `gemini-2.5-flash` (déjà le modèle utilisé) supporte la vision/multimodal, donc pas besoin d'un service OCR tiers : envoyer l'image directement à l'API Gemini déjà connectée (`ai.ts`). Nouvelle route `/api/parse-photo`, nouvelle fonction `parsePhoto(image)`.
- **Complexité** : **L**.
- **Risques** : **c'est la seule des 20 fonctionnalités sans fallback gratuit possible** — il n'existe pas d'OCR déterministe local dans le projet, donc sans `GEMINI_API_KEY`, cette fonctionnalité ne peut tout simplement pas marcher. Ça casse l'invariant "l'app marche sans clé API" pour ce cas précis — à assumer explicitement (message clair à l'élève plutôt qu'un échec silencieux) plutôt qu'à cacher.

### 14. Export vers Anki / Notion / Google Docs

- **Objectif** : continuer à utiliser ses outils habituels.
- **Parcours** : "Exporter" → CSV/Anki en premier (le plus simple), Notion/Google Docs en option plus tard.
- **Technique** : export CSV = même pattern que `downloadCoursesJson()` déjà dans `store.ts` (Blob + lien de téléchargement), juste un nouveau formateur 2 colonnes front/back. `.apkg` réel = nouvelle dépendance (`anki-apkg-export` ou équivalent, sqlite côté JS). Notion/Google Docs = OAuth, **infra d'auth qui n'existe pas du tout aujourd'hui**.
- **Complexité** : **S** (CSV) / **M** (.apkg) / **XL** (OAuth Notion/Google).
- **Risques** : ne pas se lancer dans l'OAuth avant d'avoir un vrai besoin validé — le CSV couvre 80% du besoin pour 5% du coût.

### 15. Mode audio (résumé en podcast)

- **Objectif** : réviser sans écran.
- **Parcours** : "Écouter le résumé" → TTS, éventuellement format dialogue à deux voix → lecteur avec vitesse ajustable, offline.
- **Technique** : aucun service TTS aujourd'hui (ElevenLabs/OpenAI TTS/Google TTS — tous à ajouter). Script audio = nouvelle fonction ai.ts (reformulation orale). **Problème de stockage** : l'app n'a que `localStorage` (texte uniquement, ~5-10 Mo) — un fichier audio ne peut pas y vivre. Il faudrait soit re-générer à chaque écoute (coût TTS répété), soit ajouter IndexedDB pour cacher le blob audio (nouvelle techno de persistance, jamais utilisée dans le projet).
- **Complexité** : **L**.
- **Risques** : coût par minute générée — mise en cache (IndexedDB) quasi obligatoire pour rester soutenable, donc le "vrai" coût inclut cette brique de stockage en plus du TTS lui-même.

### 16. Génération de schémas/diagrammes

- **Objectif** : visualiser processus/timelines/hiérarchies.
- **Parcours** : détection auto du contenu qui s'y prête → diagramme généré, intégré au résumé.
- **Technique** : Mermaid.js (suggestion de l'utilisateur, pertinente) — nouvelle dépendance, rendu uniquement client (`"use client"`, import dynamique, pas de SSR — cohérent avec le pattern déjà utilisé pour next-themes/Dialog).
- **Complexité** : **M**. Partage la détection de structure avec #3 (mindmap) — bricks proches, à concevoir ensemble.
- **Risques** : limites de mise en page Mermaid sur gros contenus — prévoir un fallback texte (liste à puces) si le rendu échoue, même logique que les `EmptyState` déjà utilisés partout dans le projet pour les échecs de génération.

### 17. Score de difficulté + estimation du temps de révision

- **Objectif** : aider à planifier le temps de révision.
- **Parcours** : badge "Difficulté : élevée", "Temps estimé : 45 min" sur chaque cours.
- **Technique** : heuristique simple en v1 (nombre de slides, densité de bullets, longueur du texte — calculable immédiatement depuis `Slide[]` existant, zéro IA nécessaire). Pas besoin de données agrégées d'autres élèves (n'existent pas, pas de multi-tenant).
- **Complexité** : **S**.
- **Risques** : cadrer comme indicatif dans l'UI (déjà la bonne intuition du brief) pour ne pas décourager.

### 18. Partage collaboratif (groupe d'étude)

- **Objectif** : réviser en groupe.
- **Parcours** : "Partager" → lien/invite → résumé/quiz partagé, scores comparés.
- **Constat** : nécessite des comptes et une base de données partagée — **aucun des deux n'existe**. C'est la fonctionnalité la plus dépendante d'une fondation manquante de tout le lot (avec #7).
- **Complexité** : **XL**, confirmée par l'utilisateur lui-même qui la place en fin de roadmap. Dépendance directe avec #7 (si la brique backend/DB est posée pour le RAG, #18 devient nettement moins cher à construire après).
- **Risques** : gestion des droits, modération si contenu partagé publiquement — à ne pas sous-estimer une fois l'infra posée.

### 19. Détection de lacunes basée sur les erreurs aux quiz

- **Objectif** : cibler les révisions sur les points faibles.
- **Parcours** : onglet "Mes points faibles" agrégeant les erreurs par notion → mini-résumé + flashcards ciblées.
- **Constat** : aujourd'hui les questions de quiz **ne sont pas persistées du tout** (`Course.quizRuns` n'est qu'un compteur) et aucune question n'est taguée par notion. Cette fonctionnalité dépend entièrement de #1 (ajouter un tag de notion à chaque question, dès la génération) **et** d'un nouveau journal d'attempts à persister (`Course.quizAttempts?: {questionTag, correct, ts}[]`, avec un risque de croissance illimitée du localStorage à gérer — prévoir un plafond/agrégation glissante plutôt qu'un log brut infini).
- **Complexité** : **L**. Dépendance forte et explicite avec #1 — à construire dans le même chantier, pas séparément (la fiche utilisateur le dit déjà bien).
- **Risques** : qualité du tagging LLM des questions — biais si le LLM tague mal, la fonctionnalité entière devient peu fiable.

### 20. Mode "session de révision" guidée (Pomodoro)

- **Objectif** : structurer une session complète, réduire la procrastination du choix.
- **Parcours** : "Lancer une session" → enchaînement timé résumé → flashcards → quiz → fiche → pauses → récap final.
- **Technique** : pure orchestration front, machine à états simple (`useReducer` ou state machine légère) qui pilote les composants déjà existants (`SummaryActivity`, `FlashcardActivity`, `QuizActivity` réutilisés tels quels) + la fiche condensée (#4). Aucune nouvelle brique IA ou serveur.
- **Complexité** : **M**, mais **dépendance dure** : ne peut être construite qu'après #1 (quiz), #2 (flashcards déjà existant), #4 (fiche) — confirmé par le brief utilisateur lui-même ("à construire en dernier").
- **Risques** : aucun risque technique notable, juste l'ordre de construction à respecter.

---

## Synthèse

### Bricks techniques partagées (factoriser plutôt que dupliquer)

| Brick | Fonctionnalités concernées |
|---|---|
| Génération de questions taguées par notion | #1, #8, #19 (le user l'avait déjà vu) |
| Extraction structurée de notions depuis les slides | #5, #9, #16 (détection de structure), recoupe BACKLOG #34 |
| Résumé paramétré + cache par section | #6, recoupe BACKLOG #35 |
| Téléchargement de fichier généré côté client (pattern `downloadCoursesJson`) | #4 (impression), #14 (CSV) |
| Hook localStorage "agrégation multi-cours" (pattern `useDailyGoal`/`useStreak`) | #2 (dues SRS), #10 (dashboard), #11 (rappels v1) |
| Fondation backend réelle (DB + auth) | #7, #18, #14 (OAuth), #11 (v2) — la même décision d'infra débloque les quatre |

### Ordre d'implémentation en 3 phases

**Phase 1 — Quick wins (zéro nouvelle infra, dans l'architecture actuelle)**
#17 (score difficulté), #10 (dashboard agrégé), #1 (quiz : source + revue erreurs), #9 (extraction dates/formules, sans LaTeX au départ), #5 (surlignage, même brick que #9), #14 CSV (export Anki simple), #4 v1 (fiche en CSS print).

**Phase 2 — Cœur de valeur (nouvelle dépendance front ou nouvelle fonction IA, toujours sans backend serveur)**
#2 (SRS flashcards), #6 (explique simplement), #3 (mindmap), #16 (schémas Mermaid), #8 (examens blancs), #19 (lacunes — après #1), #20 (session guidée — après #1/#2/#4), #11 v1 (rappels in-app), #13 (OCR/photo, en assumant l'absence de fallback gratuit).

**Phase 3 — Avancé/XL (demande une vraie fondation backend : DB, auth, ou service externe coûteux)**
#7 (chat RAG — pose la fondation DB), #18 (collaboratif — profite de la fondation posée par #7), #14 OAuth (Notion/Google), #11 v2 (vraies notifs push/email), #15 (audio/TTS + IndexedDB), #12 (fusion/comparaison sémantique).

### Estimation Phase 1

Sur la base du rythme observé dans `PROGRESS.md` (1 objectif BACKLOG ≈ 1 cycle spec→build→review,
en général une demi-journée de travail agentique), les 7 items de Phase 1 sont d'ampleur S/M
similaire aux itérations déjà faites. **Estimation réaliste : 5 à 7 sessions de dev**, en
regroupant #9+#5 (même brick) et #4+#14 (même pattern de téléchargement) en 2 sessions au lieu
de 4 — donc plutôt 5 sessions si les regroupements sont faits, 7 si traités un par un.

---

## Important

Rien dans ce document n'a été codé. Avant de lancer un `/spec` sur la priorisation
retenue, vérifier l'état du backlog (`BACKLOG.md`) et fusionner les doublons identifiés
ci-dessus (#2↔#28, #6↔#48/#35, #9↔#34, #10↔#18) pour ne pas planifier la même chose deux fois.
