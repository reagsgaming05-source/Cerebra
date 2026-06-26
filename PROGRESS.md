# Cerebra — Journal de progression (loop autonome)

Boucle autonome lancée le 2026-06-22 pour améliorer Cerebra itération par itération.
Chaque entrée = une itération. Le plus récent en haut.

## Itération 26 — 2026-06-25 (boucle intensive : #36→#50, backlog 35→50)

**Contexte :** session de dev intensive pour rattraper les objectifs 36-50 du backlog.
Tous les objectifs de 30 à 50 sont maintenant implémentés.

**Fait :**
- **#36 Badges/achievements** : `src/lib/achievements.ts` (11 achievements, hook
  `useAchievements` avec vérification auto, notification toast au déblocage),
  `src/components/achievements-panel.tsx` (panneau pliable sur la home avec barre
  de progression et liste détaillée).
- **#37 Niveaux XP** : `src/lib/levels.ts` (10 niveaux de Débutant à Cerebra,
  hook `useLevel` avec progression vers le niveau suivant). Badge niveau + icône
  dans le header de la home.
- **#38 Effets sonores** : `src/lib/sounds.ts` (Web Audio API, 4 sons : correct,
  faux, flip, complétion). Intégré dans `haptics.ts` (son+joué à chaque haptic).
  Toggle dans la page Réglages. Son de complétion de cours dans `course-view.tsx`.
- **#39 Anneau de progression** : remplacement de la barre horizontale par un
  anneau SVG sur chaque carte de cours (home page).
- **#40 Animations XP** : `src/components/xp-popup.tsx` (popup flottante "+X XP"
  avec animation de fondu). Déclenché à chaque validation d'étape.
- **#41-45 PWA** : `public/manifest.json` (display standalone, thème, icônes SVG),
  `public/sw.js` (cache-first assets, network-first pages, fallback offline),
  `src/components/pwa-setup.tsx` (enregistrement SW). Meta theme-color dans layout.
- **#46 Quiz depuis flashcards** : `generateQuizFromFlashcards()` dans `ai.ts` +
  fallback déterministe. Route API `/api/quiz` accepte désormais `flashcards`.
  `QuizActivity` envoie les flashcards si pas de slides.
- **#47 Difficulté adaptative** : `QuizActivity` initialise la difficulté selon le
  meilleur score précédent (≥80% → hard, <50% → easy, sinon medium).
- **#48 Expliquer ce concept** : `explainConcept()` dans `ai.ts`. Route API
  `/api/explain-concept`. Bouton "Expliquer ce concept" dans chaque entrée du
  glossaire avec affichage inline de l'explication.
- **#49 Détection de langue** : `src/lib/lang-detect.ts` (détection FR/EN par
  mots fréquents). Badge de langue (FR/EN) dans l'en-tête du cours.
- **#50 README utilisateur** : réécriture complète du README.md (fr, fonctionnalités,
  démarrage, stack, licence).

**Avancement backlog : 50 / 50.** Tous les objectifs du backlog initial sont faits.

## Itération 27 — 2026-06-25 (roadmap phase 1 : difficulté, dashboard, CSV)

**Fait :**
- **Score de difficulté + temps estimé** (#17 roadmap) : `src/lib/difficulty.ts`,
  heuristique basée sur la densité de contenu et le nombre de slides. Badge
  (Facile/Moyen/Difficile/Exigeant) sur chaque carte de cours (home).
- **Dashboard agrégé multi-cours** (#10 roadmap) : section "Vue d'ensemble" sur
  la home avec 3 stats (Cours, Complétés, Total XP) en grille.
- **Export CSV Anki** (#14 roadmap) : bouton "Exporter les flashcards (CSV Anki)"
  dans la section Données des Réglages. Format front,back standard.

Prochaines étapes possibles : passe design (51-55), ou phase 2 de ROADMAP-AVANCE.md.

## Itération 25 — 2026-06-25 (audit backlog 30-55, fix #30, bottom-nav glossary)

**Contexte :** reprise du développement après consolidation du workspace. Audit des
objectifs 30-55 pour voir ce qui est vraiment à faire vs déjà fait.

**Fait :**
- **#30 Timer par question** : déjà implémenté (UI sélecteur + countdown + timeout
  auto). Bug : `timeLeft` n'était pas reset entre les questions → après un timeout,
  la question suivante timeout immédiatement. Fix : `setTimeLeft(timerSeconds)`
  dans `next()`.
- **#31 Modes 60s/90s** : déjà implémenté dans `SpeedActivity` (`SPEED_MODES`).
- **#32 Matching mobile** : déjà implémenté (section single-column `sm:hidden`).
- **#33 Niveaux de difficulté matching** : déjà implémenté (`MATCHING_LEVELS`).
- **#34 Glossaire** : déjà implémenté (composant `Glossary` basé sur flashcards +
  recherche, onglet déjà branché dans `course-view.tsx`).
- **#35 Résumé multi-styles** : déjà implémenté (toggle puces/paragraphe/tableau).
- **Bottom-nav** : `TabId` n'incluait pas "glossary" → erreur TS. Ajouté + icône
  `BookMarked`.

**Avancement backlog : 35 / 50.** Prochains cycles : #36 (badges/achievements),
#37 (niveaux XP), #38 (effets sonores), #39 (anneau progression), #40 (animations XP).

## Itération 24 — 2026-06-23 (design system — fondation clay, hors cycle /spec)

**Contexte :** import du projet Claude Design « Application à reproduire »
(`81cd0d01`, fichier `Cerebra.dc.html`) via le MCP design. Le design cible
définit une identité clay chaude, polices Bricolage/Hanken/DM Mono, ombres
offset néo-brutalistes et texture grain. Jusqu'ici l'app tournait sur le
template shadcn violet/Geist (exactement le piège à fuir, cf. LOOP-NOTES Partie 1).

**Fait — fondation visuelle uniquement (périmètre choisi : « système de design
seul », les écrans ne sont pas restylés, laissés aux itérations suivantes) :**
- `layout.tsx` : Geist → Bricolage Grotesque (--font-bricolage, titres),
  Hanken Grotesk (--font-hanken, corps), DM Mono (--font-dm-mono, mono) via
  `next/font/google`.
- `globals.css` : tokens `:root`/`.dark` remappés sur la palette clay (hex) ;
  ajout des tokens natifs du design (--bg/--surface/--surface-2/--ink/--ink-2/
  --line/--clay/--clay-deep/--gold/--sage/--crimson/--petrol) + easings
  (--ease-out/--ease-stamp). Mapping shadcn conservé (les composants existants
  héritent de l'identité sans rewrite).
- Primitives `@layer components` : `.cb-card` (offset encre), `.cb-card-line`
  (ombre douce clay), `.cb-btn` / `.cb-btn-primary`, `.cb-pill`, `.cb-stamp`
  (mono incliné), `.cb-grain` (overlay SVG noise multiply 5%), `.cb-tile`
  (pictogramme à coin coupé). Heading font par défaut = Bricolage. Press
  scale 0.97 au tap. Keyframes : cbFloat, cbPop, cbPulse, cbShimmer, cbSheet,
  cbFade, cbSpin (+ utilitaires `.animate-cb-*`).
- Nouvelle page de référence `src/app/design-system/page.tsx` (route
  `/design-system`) : palette, typographie, cartes, boutons/pilules, stamps,
  grain, animations — échantillon vivant pour garder la cohérence entre
  itérations.
- Miroir `.design-bundle/theme.css` resynchronisé sur la palette clay.
- Bug préexistant corrigé (régression de l'itération #30 en cours) :
  `activities.tsx` redéclarait `const answered` dans le scope de
  `QuizActivity` (lignes 414 + 583) → `tsc` cassé. Doublon retiré.
- Build vérifié : `npx tsc --noEmit` passe sans erreur. Zéro nouvelle dépendance.

**Reste (itérations suivantes) :** appliquer la passe design aux écrans — Home,
Course (parcours/résumé/cartes/quiz/stats), Onboarding, Settings — en suivant
les décisions figées dans LOOP-NOTES. Items ajoutés au backlog (tag `[DESIGN]`).

## Itération 23 — 2026-06-22 (cycle /spec /build /review, objectif #29)

**Fait :**
- **#29 Quiz : review des mauvaises réponses à la fin** : `QuizActivity` enregistre
  `answers[qi]` à chaque sélection, écran de fin enrichi d'un bouton "Voir mes erreurs (N)"
  (absent si 0 erreur) qui révèle la liste des questions ratées (énoncé, ta réponse, bonne
  réponse, explication déjà existante). "Nouveau quiz" réinitialise aussi `answers`.
  Review : 100% ✅.
- Build vérifié : `npx tsc --noEmit` passe sans erreur. Zéro nouvelle dépendance.

**Avancement backlog : 29 / 50.** Prochain cycle : #30 (timer par question).

## Itération 22 — 2026-06-22 (cycle /spec /build /review, objectif #28)

**Fait :**
- **#28 Spaced repetition (SRS Leitner)** :
  - `Flashcard` (types.ts) : champs optionnels `box?`/`dueDate?`.
  - `src/lib/srs.ts` (nouveau) : `LEITNER_INTERVAL_DAYS = [1,3,7,14,30]`, `reviewCard`,
    `isDue`, `dueCards`.
  - `FlashcardActivity` : `answer()` (partagée flip/tape) met à jour la boîte/dueDate de
    la carte courante et persiste sur `course.flashcards`. Badge "N cartes à réviser
    aujourd'hui" + bouton filtre "cartes dues uniquement", visible si `due.length > 0`.
  - Détail technique important : la session active utilise un **snapshot figé** (`deck`,
    state local) plutôt que de recalculer le filtre "dues" à chaque rendu — sinon une
    carte répondue pendant une session filtrée sortirait immédiatement du filtre et
    décalerait les index en cours d'itération. Snapshot pris au montage (lazy init) et
    réinitialisé une seule fois quand `loading` passe à `false` (génération IA terminée),
    avec un garde-fou (écran squelette) sur la frame de transition où `deck` n'est pas
    encore hydraté.
  - Review : 100% ✅ (carte jamais révisée = due immédiatement, box plafonnée à 5,
    désactivation du filtre = reset de session).
- Build vérifié : `npx tsc --noEmit` passe sans erreur. Zéro nouvelle dépendance.

**Avancement backlog : 28 / 50.** Prochain cycle : #29 (review des mauvaises réponses au quiz).

## Itération 21 — 2026-06-22 (cycle /spec /build /review, objectif #27)

**Fait :**
- **#27 Mode flashcards "tape la réponse"** : toggle Flip/Tape la réponse dans
  `FlashcardActivity` (`activities.tsx`). Mode tape : `Input` + comparaison via
  `normalize()` (déjà dans `search.ts`, insensible casse/accents/espaces) contre
  `card.back`, feedback correct/incorrect, même comptage `known`/`seen` et même
  `onComplete` que le mode flip. Changement de mode reset la session.
  Déviation documentée vs. la spec : le bouton "Valider" est désactivé sur réponse vide
  plutôt que de permettre une soumission vide comptée fausse — meilleure UX, comportement
  final identique sur le fond.
  Review : 100% ✅ (synonymes non reconnus assumé comme limitation, pas un bug).
- Build vérifié : `npx tsc --noEmit` passe sans erreur. Zéro nouvelle dépendance.

**Avancement backlog : 27 / 50.** Prochain cycle : #28 (SRS Leitner).

## Itération 20 — 2026-06-22 (cycle /spec /build /review, objectif #26)

**Fait :**
- **#26 Édition du titre et métadonnées d'un cours** : scope limité au titre (seule
  métadonnée libre sur `Course`, le reste est dérivé). Bouton crayon dans le header de
  `course-view.tsx` → `Input` inline pré-rempli, Enregistrer (désactivé si vide)/Annuler,
  `updateCourse({title})`. Zéro nouvelle dépendance.
  Review : 100% ✅.
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 26 / 50.** Prochain cycle : #27 (flashcards "tape la réponse").

## Itération 19 — 2026-06-22 (cycle /spec /build /review, objectif #25)

**Fait :**
- **#25 Édition / suppression de flashcards individuelles** :
  - Spec dans `specs/projet.md` (objectif #25).
  - `src/components/flashcard-list.tsx` (nouveau) : toggle "Voir mes N cartes" (masqué si
    0 carte), liste des cartes avec par ligne recto/verso tronqués + bouton éditer (passe
    la ligne en formulaire inline recto/verso pré-remplis, Enregistrer désactivé si vide) +
    bouton supprimer (`AlertDialog` de confirmation, même pattern que la suppression de
    cours sur la home). Édition/suppression via `updateCourse({flashcards: ...})`.
  - `src/components/course-view.tsx` : `<FlashcardList>` intégré dans l'onglet "Cartes",
    entre `<ManualFlashcardForm>` et l'activité d'étude existante.
  - Zéro nouvelle dépendance.
  - Review : 100% ✅ (toggle absent si 0 carte, édition vide bloquée, suppression de la
    dernière carte retombe sur les `EmptyState` déjà existants, lignes d'édition indépendantes).
- Build vérifié : `npx tsc --noEmit` passe sans erreur. Dev server (:3000) toujours up.

**Avancement backlog : 25 / 50.** Prochain cycle : #26 (édition du titre et métadonnées d'un cours).

## Itération 18 — 2026-06-22 (cycle /spec /build /review, objectif #24)

**Fait :**
- **#24 Création manuelle de flashcards (sans IA)** :
  - Spec dans `specs/projet.md` (objectif #24). Édition/suppression de cartes existantes
    explicitement hors scope (= BACKLOG #25, à traiter séparément).
  - `src/components/manual-flashcard-form.tsx` (nouveau) : toggle "+ Ajouter une carte"
    (fermé par défaut) → formulaire recto (`Input`) / verso (`Textarea`), bouton désactivé
    si un champ est vide, ajoute `{id: genId("fc"), front, back}` à la fin de
    `course.flashcards` (créé si `undefined`) via `updateCourse`, toast + reset après ajout.
  - `src/components/course-view.tsx` : `<ManualFlashcardForm>` intégré dans l'onglet
    "Cartes", au-dessus du rendu de `FlashcardActivity` (non modifiée).
  - Zéro nouvelle dépendance.
  - Review : 100% ✅. Une limitation a été documentée plutôt que corrigée (hors scope de
    cette itération) : si une génération IA de flashcards est en cours en parallèle pour le
    même cours au moment de l'ajout manuel, sa résolution peut écraser la carte ajoutée
    (race sur `updateCourse({flashcards:...})` dans `FlashcardActivity`/`MatchingActivity`/
    `SpeedActivity`, fenêtre de quelques centaines de ms, cas rare).
- Build vérifié : `npx tsc --noEmit` passe sans erreur. Dev server (:3000) toujours up.

**Avancement backlog : 24 / 50.** Prochain cycle : #25 (édition/suppression de flashcards individuelles).

## Itération 17 — 2026-06-22 (cycle /spec /build /review, objectif #23)

**Fait :**
- **#23 Créer un cours à partir de texte collé / notes brutes** :
  - Spec dans `specs/projet.md` (objectif #23).
  - `src/lib/paste-text.ts` (nouveau) : `parsePastedText(raw)`, pur client, découpe le texte
    en blocs séparés par ligne(s) vide(s), chaque bloc → `Slide` (titre = 1ère ligne ≤ 120,
    bullets = lignes suivantes). Si la 1ère ligne dépasse 120 caractères, le titre est tronqué
    mais la ligne complète est aussi poussée en bullet (aucune perte d'info).
  - `src/components/paste-text-zone.tsx` (nouveau) : lien "Ou colle du texte" sous l'upload,
    révèle un formulaire (titre optionnel + `Textarea`), bouton "Créer le cours" désactivé si
    texte vide/espaces, réutilise `genId`/`buildNodes`/`recomputeProgress`/`upsert` puis
    redirige vers `/course/[id]` (même pipeline que `upload-zone.tsx`, sans route serveur
    puisqu'il n'y a pas de fichier binaire à parser).
  - `src/app/page.tsx` : `<PasteTextZone />` intégré juste après `<UploadZone />`.
  - Zéro nouvelle dépendance.
  - Review : 100% ✅ (texte vide bloqué, bloc unique, multi-blocs sans plafond, titre tronqué
    avec contenu préservé, retours chariot Windows gérés, fallback "Nouveau cours").
- Build vérifié : `npx tsc --noEmit` passe sans erreur. Dev server déjà actif sur :3000,
  HTML de la home confirmé à jour ("Ou colle du texte" présent après hot-reload).

**Avancement backlog : 23 / 50.** Prochain cycle : #24 (création manuelle de flashcards sans IA).

## Itération 16 — 2026-06-22 (cycle /spec /build /review, objectif #22)

**Fait :**
- **#22 Import .docx (extraction texte)** : spec + code repris d'une session précédente
  arrêtée avant le `/review` ; revue complétée maintenant.
  - Spec dans `specs/projet.md` (objectif #22).
  - `src/lib/docx.ts` (nouveau) : `parseDocx(buffer)` via JSZip sur `word/document.xml`,
    extraction des `<w:p>`/`<w:t>` avec décodage des entités XML, détection des titres par
    `<w:pStyle>` (`Heading*`/`Titre*`/`Title`), découpage en slides par titre (préambule →
    "Introduction"), fallback 1 slide si aucun titre, `index` séquentiel.
  - `src/app/api/parse-docx/route.ts` (nouveau) : runtime nodejs, maxDuration 60, validation
    `.docx`, dérivation titre (ignore les titres génériques "Introduction"/"Section"/"Document",
    fallback nom de fichier), 422 si aucun texte, 400/500 gérés.
  - `src/components/upload-zone.tsx` : accepte `.pptx`/`.pdf`/`.docx`, endpoint choisi par
    extension, libellés mis à jour ("PowerPoint, PDF ou Word").
  - Zéro nouvelle dépendance (réutilise JSZip déjà installé pour le .pptx).
  - Review : 100% ✅ (tous les besoins, cas limites et critères de la spec vérifiés contre le
    code réel — fichier sans `word/document.xml`, document vide, sans titres, titre > 120 char,
    section sans bullet, entités XML, extension invalide).
- Build vérifié : `npx tsc --noEmit` passe sans erreur. Aucune dépendance imprévue ajoutée.

**Avancement backlog : 22 / 50.** Prochain cycle : #23 (créer un cours depuis texte collé).

## Itération 15 — 2026-06-22 (cycle /spec /build /review, objectif #21)

**Fait :**
- **#21 Import .pdf (extraction texte)** :
  - Spec dans `specs/projet.md` (objectif #21).
  - Dépendance `pdf-parse` ^2.4.5 ajoutée (justifiée : extraction PDF fiable impossible sans lib).
  - `src/lib/pdf.ts` (nouveau) : `parsePdf(buffer)` via `PDFParse({ data })` + `getText()` + `destroy()`, page → `Slide` (titre = 1ère ligne ≤ 120, bullets = suivantes, fallback `Page N`), pages sans texte ignorées, `index` séquentiel.
  - `src/app/api/parse-pdf/route.ts` (nouveau) : runtime nodejs, maxDuration 60, validation `.pdf`, dérivation titre (skip `Page N`, fallback nom de fichier), 422 si aucune page textuelle, 400/500 gérés.
  - `src/components/upload-zone.tsx` : `accept=".pptx,.pdf"`, validation regex, endpoint `/api/parse-pdf` ou `/api/parse-pptx` selon l'extension, libellés neutres ("PowerPoint ou PDF", "Analyse du document…").
  - Smoke test : PDF minimal généré → `parsePdf` renvoie bien titre + bullets (script retiré après validation).
  - Review : 100% ✅.
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 21 / 50.** Prochain cycle : #22 (import .docx).

## Itération 14 — 2026-06-22 (cycle /spec /build /review, objectif #20)

**Fait :**
- **#20 Objectif quotidien configurable + suivi** :
  - Spec dans `specs/projet.md` (objectif #20). Partie "configurable" déjà existante (`useDailyGoal`, page réglages).
  - `src/lib/daily-progress.ts` (nouveau) : `recordCompletion`, hook `useDailyProgress` (clé `study-app:daily-count:v1`, événement `study-app:daily-count-changed`, utilise `useDailyGoal` pour l'objectif, `pct` borné 0..100, `reached`).
  - `src/components/course-view.tsx` : `recordCompletion()` appelée dans `handleComplete` après `recordStudyDay`.
  - `src/app/page.tsx` : carte "Objectif du jour" (icône `Target`, today / goal, `Progress`, état "Atteint !" + pourcentage) entre l'upload et la liste des cours.
  - `src/app/settings/page.tsx` : copy mis à jour ("cartes" → "activités", mention "(à venir)" retirée).
  - `src/lib/settings.ts` : commentaire mis à jour ("activités par jour").
  - Review : 100% ✅ (cas limites objectif dépassé plafonné, changement de jour, SSR, objectif modifié).
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 20 / 50.** Prochain cycle : #21 (import .pdf).

## Itération 13 — 2026-06-22 (cycle /spec /build /review, objectif #19)

**Fait :**
- **#19 Compteur de streak** :
  - Spec dans `specs/projet.md` (objectif #19).
  - `src/lib/streak.ts` (nouveau) : `dayKey`, `recordStudyDay`, `computeStreak`, hook `useStreak` (clé `study-app:study-days:v1`, événement `study-app:study-days-changed`). Grâce d'un jour : si aujourd'hui non étudié mais hier oui, le streak conserve.
  - `src/components/course-view.tsx` : `recordStudyDay()` appelée dans `handleComplete` après `upsert`.
  - `src/app/page.tsx` : badge streak (icône `Flame`, "X jour(s)") dans l'en-tête "Mes cours", couleur `warning/gold` si streak > 0 sinon `muted`.
  - Review : 100% ✅ (cas limites premier usage, grâce d'un jour, dédup même jour, SSR, non-inclus export).
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 19 / 50.** Prochain cycle : #20 (objectif quotidien configurable + suivi).

## Itération 12 — 2026-06-22 (cycle /spec /build /review, objectif #18)

**Fait :**
- **#18 Stats par cours** :
  - Spec dans `specs/projet.md` (objectif #18).
  - `src/lib/types.ts` : champ `attempts?: number` sur `LearningNode`, `lastStudiedAt?: number` sur `Course`.
  - `src/lib/store.ts` : `completeNode` incrémente `attempts` du noeud complété et pose `lastStudiedAt = Date.now()` sur le cours.
  - `src/lib/format.ts` (nouveau) : `formatRelativeDate(ts)` → "Jamais" / "Aujourd'hui" / "Hier" / "Il y a X j" (≤7) / `YYYY-MM-DD`.
  - `src/components/course-stats.tsx` (nouveau) : `CourseStats({course})` avec 3 Stat (Dernière étude, Tentatives totales, Quiz générés) + liste par activité (titre, tentatives, meilleur score ou "—").
  - `src/components/course-view.tsx` : onglet "Stats" ajouté au TABS (icône `BarChart3`), `TabsList` passée en `grid-cols-5`, `TabsContent value="stats"` rendant `CourseStats`.
  - `src/components/bottom-nav.tsx` : item "Stats" ajouté (icône `BarChart3`), `TabId` étendu.
  - Review : 100% ✅ (cas limites cours jamais étudié, cours pré-existants sans `attempts`/`lastStudiedAt`, export/import, première complétion).
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 18 / 50.** Prochain cycle : #19.

## Itération 11 — 2026-06-22 (cycle /spec /build /review, objectif #17)

**Fait :**
- **#17 Pin / favoris des cours** :
  - Spec dans `specs/projet.md` (objectif #17).
  - `src/lib/types.ts` : champ `pinned?: boolean` sur `Course`.
  - `src/lib/store.ts` : `togglePin(id)` dans `useCourses`.
  - `src/lib/search.ts` : `sortCourses` met les cours épinglés en premier, puis applique le tri choisi dans chaque groupe.
  - `src/app/page.tsx` : bouton épingle (icône `Pin`, `fill-current` + couleur primaire quand épinglé, `aria-pressed`) à côté du bouton supprimer sur chaque carte.
  - Review : 100% ✅ du premier coup.
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 17 / 50.** Prochain cycle : #18 (stats par cours) ou #19 (compteur de streak).

## Itération 10 — 2026-06-22 (cycle /spec /build /review, objectif #16)

**Fait :**
- **#16 Tri des cours** :
  - Spec dans `specs/projet.md` (objectif #16).
  - `src/lib/search.ts` : `SortKey` + `sortCourses` (recent/progress/xp/title, tri stable, titre via `normalize` + `localeCompare`).
  - `src/lib/settings.ts` : hook `useSort` (localStorage `study-app:sort:v1`, défaut "recent", validation des valeurs).
  - `src/app/page.tsx` : Select de tri (composant Select existant, `aria-label`, h-11) dans le header "Mes cours", applique `sortCourses` sur la liste filtrée par la recherche. Compteur "X / Y cours" caché sur mobile.
  - Review : 100% ✅ du premier coup.
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 16 / 50.** Prochain cycle : #17 (pin/favoris) ou #19 (compteur de streak).

## Itération 9 — 2026-06-22 (cycle /spec /build /review, objectif #15)

**Fait :**
- **#15 Recherche across cours** :
  - Spec dans `specs/projet.md` (objectif #15).
  - `src/lib/search.ts` : `normalize` (NFD + retrait diacritiques + lowercase + collapse espaces) et `courseMatches` (cherche dans titre, slides title+bullets+notes, résumé plainText+sections+keyPoints, flashcards front+back).
  - `src/app/page.tsx` : input de recherche (role="search", aria-label, h-11) au-dessus de la grille, filtre temps réel via `useMemo`, bouton clear (X), EmptyState "Aucun cours ne correspond" avec la query, compteur "X / Y cours" quand recherche active.
  - Review : 100% ✅ du premier coup, aucune correction needed.
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 15 / 50.** Prochain cycle : #16 (tri/filtre des cours) ou #19 (compteur de streak).

## Itération 8 — 2026-06-22 (cycle /spec /build /review, objectif #14)

**Fait :**
- **#14 Page Réglages** :
  - Spec dans `specs/projet.md` (objectif #14).
  - `src/lib/settings.ts` : hook `useDailyGoal` (localStorage `study-app:daily-goal:v1`, défaut 20, clamp 1-200).
  - `src/app/settings/page.tsx` : nouvelle route `/settings` avec 4 sections : Apparence (3 boutons Clair/Sombre/Système via next-themes, guard mounted), Objectif quotidien (input numérique `inputMode="numeric"`, commit sur blur/Enter), Données (réutilise `DataSettings`), À propos (Cerebra v0.1.0, Jarvis Starter Kit).
  - `src/components/app-header.tsx` : bouton engrenage (icône `Settings`) lien vers `/settings` sur toutes les pages, via `render={<Link/>}` (pattern base-ui).
  - Review : 1 correction (next-themes ^0.4.6 n'expose pas `mounted` → état local). Re-revue 100% ✅.
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 14 / 50.** Prochain cycle : #15 (recherche across cours) ou #19 (compteur de streak).

## Itération 7 — 2026-06-22 (cycle /spec /build /review, objectif #9)

**Fait :**
- **#9 Animations de transition** :
  - Spec dans `specs/projet.md` (objectif #9).
  - `src/app/globals.css` : guard `prefers-reduced-motion` global (désactive animations/transitions).
  - `src/components/course-view.tsx` : `animate-float-up` (keyframe existant) sur les 4 Cards de TabsContent (path/summary/flashcards/quiz) + sur le panneau d'activité du Dialog (wrapper `key={activeNode.id}`).
  - Vérifié : base-ui `Tabs.Panel` a `keepMounted=false` par défaut, donc les panels inactifs sont démontés et l'animation se rejoue à chaque switch d'onglet (pas de regression d'état, comportement inchangé).
  - Review : 100% ✅ du premier coup, aucune correction needed.
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 13 / 50.** Prochain cycle : #14 (page Réglages) ou #15 (recherche across cours).

## Itération 6 — 2026-06-22 (cycle /spec /build /review, objectif #8)

Première itération en mode spec→build→review.

**Fait :**
- **#8 Onboarding au premier lancement** :
  - Spec rédigée dans `specs/projet.md` (objectif, besoins, cas limites, définition de fini).
  - `src/lib/onboarding.ts` : hook `useOnboarding` (flag localStorage `study-app:onboarded:v1`, affiche si mounted + ready + flag absent + aucun cours).
  - `src/components/onboarding.tsx` : écran plein écran, carrousel 3 étapes (Sparkles/BookOpen/GraduationCap), dots cliquables, skip, nav précédent/suivant, CTA final "Importer mon premier cours". Safe-area, tap targets ≥44px, aria-labels.
  - `src/app/page.tsx` : onboarding rendu en overlay, CTA final dismiss + scroll vers `#upload` (UploadZone). `scroll-mt-20` sur la section.
  - Review : 1 correction appliquée (skip button 36px → 44px, dots zone de tap élargie). Re-revue 100% ✅.
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 12 / 50.** Prochain cycle : #9 (animations de transition) ou #14 (page Réglages).

## Itération 5 — 2026-06-22 (lot #5 #6 #7)

**Fait :**
- **#5 Responsive mobile** : tap targets ≥44px sur les boutons du matching (`min-h-11`) et des options de quiz (`min-h-11`), `break-words` pour éviter l'overflow de texte long. Padding mobile `pb-28 sm:pb-8` sur la page cours pour laisser de la place à la bottom nav.
- **#6 Bottom navigation mobile** : composant `src/components/bottom-nav.tsx`, barre fixe en bas (`fixed bottom-0`, `sm:hidden`), 5 entrées (Accueil, Parcours, Résumé, Cartes, Quiz), `min-h-14` par item, `aria-current`, support `env(safe-area-inset-bottom)` pour les téléphones à encoche. Branchée dans `course-view.tsx`.
- **#7 Skeletons de chargement** : composant `src/components/ui/skeleton.tsx` (shadcn-style, `animate-pulse`). Remplace les spinners des états de chargement auto des flashcards, du matching et du speed par des skeletons qui imitent la forme réelle du contenu (carte, grille 2 colonnes, barres de progression).
- **Bonus fix** : corrigé les erreurs TypeScript pré-existantes dans `confetti.tsx` (`ctx` possibly null dans la closure de `requestAnimationFrame`) via une variable typée non-null. `npx tsc --noEmit` maintenant propre sur tout le projet.
- Build vérifié : `npx tsc --noEmit` passe sans erreur.

**Avancement backlog : 11 / 50.** Prochain lot logique : #8 onboarding + #9 transitions, ou #14 page Réglages.

## Itération 4 — 2026-06-22 (lot #10 #11 #12 #13)

Cadence accélérée sur demande : plusieurs objectifs par tour.

**Fait :**
- **#10 Haptiques** : `src/lib/haptics.ts` (API Vibration, no-op sur desktop). Branché sur quiz (bonne/mauvaise), flashcards (answer), matching (correct/erreur), speed (knew).
- **#11 Export JSON** : `downloadCoursesJson()` dans store.ts (blob + download). Bouton dans `DataSettings`.
- **#12 Import JSON** : `mergeCourses()` (ajoute les cours dont l'id n'existe pas, ignore les doublons). Bouton + input file dans `DataSettings`, toast avec nb ajoutés/ignorés.
- **#13 Reset** : `clearAllCourses()` + bouton "Tout effacer" avec AlertDialog de confirmation.
- Composant `src/components/data-settings.tsx` ajouté sur l'accueil (section sauvegarde).
- Build vérifié : compile propre, HTTP 200.

**Avancement backlog : 8 / 50.** Prochain lot : #5 responsive mobile + #6 bottom nav + #7 skeletons.

## Itération 3 — 2026-06-22 (objectif #4)

**Fait :**
- Créé `BACKLOG.md` : 50 objectifs concrets ordonnés pour faire de Cerebra la meilleure app mobile. 3 déjà cochés (ités 1-2).
- Composant `EmptyState` réutilisable (`src/components/empty-state.tsx`) : icône + titre + description + action.
- Appliqué aux états vides faibles :
  - Home (aucun cours) → EmptyState dans Card pointillée.
  - SummaryActivity : garde anti-slides-vides (cours sans texte exploitable).
  - FlashcardActivity : "Aucune carte générée" enrichi + suggestion.
  - MatchingActivity : "Pas assez de cartes" enrichi.
  - QuizActivity : garde anti-questions-vides (évite crash + EmptyState avec action refaire).
- Build vérifié : compile propre, HTTP 200.

**À faire (suite) :** voir BACKLOG.md. Prochain : #5 audit responsive mobile (tap targets, overflow).

## Itération 2 — 2026-06-22

**Fait :**
- Toggle dark mode fonctionnel.
  - Créé `src/components/theme-provider.tsx` (wrapper next-themes, `attribute="class"`, `defaultTheme="system"`, `enableSystem`).
  - Wrappé l'app dans `ThemeProvider` dans `src/app/layout.tsx`.
  - Ajouté un bouton thème (soleil/lune) dans `src/components/app-header.tsx`, avec garde `mounted` pour éviter le mismatch d'hydration.
  - Le CSS `.dark` était déjà défini dans `globals.css`, next-themes pose la classe sur `<html>`.
- Build vérifié : compile propre, HTTP 200 sur home + page cours.

**À faire (itérations suivantes) :**
- [ ] Empty states + responsive mobile (affinage)
- [ ] Export / import des cours (sauvegarde JSON)
- [ ] Valider le parsing sur un VRAI .pptx
- [ ] README utilisateur final

## Itération 1 — 2026-06-22

**Fait :**
- Corrigé la formule de score du jeu d'association (matching) dans `src/components/activities.tsx`.
  L'ancienne formule `(pairs.length / tries + 1) * 100 / ...` était incohérente et produisait des scores aberrants.
  Nouvelle logique : `score = round(pairs.length / totalTries * 100)`, plancher 40%, plafond 100%. Parfait = 100%, chaque erreur baisse le score.
- Ajouté un composant confetti léger sur canvas (`src/components/confetti.tsx`, sans dépendance externe).
- Branché le confetti sur le passage à 100% d'un cours dans `src/components/course-view.tsx` (déclenché une seule fois, quand `progress` passe sous 100 → 100).
- Build vérifié : dev server live, homepage et page cours compilent (HTTP 200).

**État du dev server :** tourne en arrière-plan, PID variable, http://localhost:3000.

**À faire (itérations suivantes) :**
- [ ] Toggle dark mode (next-themes déjà installé, CSS `.dark` déjà défini dans globals.css → juste le wiring : provider + bouton)
- [ ] Empty states + responsive mobile (affinage)
- [ ] Export / import des cours (sauvegarde JSON)
- [ ] Valider le parsing sur un VRAI .pptx
- [ ] README utilisateur final