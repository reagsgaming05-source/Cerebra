# Cerebra — Backlog des 50 objectifs

Boucle autonome : on dépile ces 50 objectifs un par un (ou par petits lots cohérents) jusqu'à ce que Muhamad arrête. Chaque objectif = une feature ou amélioration concrète, build vérifié, tracé dans PROGRESS.md.

Légende : `[ ]` à faire · `[x]` fait · `[~]` partiellement fait

## Fondations / polish UX (déjà en cours)

1. [x] Corriger la formule de score du jeu d'association (matching)
2. [x] Confetti à 100% de progression d'un cours
3. [x] Toggle dark mode (next-themes + bouton header)
4. [x] Empty states soignés (aucun cours, aucune carte, aucun quiz, erreur parsing)
5. [x] Audit responsive mobile : tap targets ≥44px, paddings, overflow
6. [x] Bottom navigation mobile sur la page cours (style app native)
7. [x] Skeletons de chargement (résumé/cartes/quiz en génération)
8. [x] Page d'onboarding au premier lancement (valeur + démo upload)
9. [x] Animations de transition entre activités / onglets
10. [x] Feedback haptique (Vibration API) sur bonne/mauvaise réponse (mobile)

## Persistance / données

11. [x] Export des cours en JSON (sauvegarde)
12. [x] Import de cours depuis JSON
13. [x] Bouton reset / tout effacer (avec confirmation)
14. [x] Page Réglages (thème, objectif quotidien, export, reset, à propos)
15. [x] Recherche across cours (titre, contenu)
16. [x] Tri / filtre des cours (date, progression, XP)
17. [x] Pin / favoris sur les cours (épingler en haut)
18. [x] Stats par cours (meilleurs scores, nb tentatives, dernière étude)
19. [x] Compteur de streak (jours consécutifs d'étude)
20. [x] Objectif quotidien configurable + suivi

## Sources de contenu (au-delà du .pptx)

21. [x] Import .pdf (extraction texte)
22. [x] Import .docx (extraction texte)
23. [x] Créer un cours à partir de texte collé / notes brutes
24. [x] Création manuelle de flashcards (sans IA)
25. [x] Édition / suppression de flashcards individuelles
26. [x] Édition du titre et métadonnées d'un cours

## Activités / pédagogie

27. [x] Mode flashcards "tape la réponse" (input + correction)
28. [x] Spaced repetition (SRS) sur les flashcards ( Leitner boxes )
29. [x] Mode quiz : review des mauvaises réponses à la fin
30. [x] Mode quiz : timer par question (fix: reset entre questions)
31. [x] Défi rapidité : modes 60s et 90s (au lieu de 30s seul)
32. [x] Matching adapté mobile : tap-tap single-column au lieu de gauche/droite
33. [x] Niveaux de difficulté du matching (nb paires)
34. [x] Glossaire généré à partir du cours (basé sur flashcards + recherche)
35. [x] Résumé en plusieurs styles (puces / paragraphe / tableau)

## Gamification / rétention

36. [x] Système de badges / achievements (premier cours, 100%, streak 7j, etc.)
37. [x] Niveaux basés sur l'XP total (avec seuils et titres)
38. [x] Sonneries / effets sonores (correct, faux, complétion) + toggle
39. [x] Anneau de progression sur la carte de cours (visual)
40. [x] Animations de gain d'XP (compteur qui s'incrémente)

## PWA / feel app mobile

41. [x] Manifest PWA (installable, nom, couleurs, display standalone)
42. [x] Icônes app (192/512) pour le manifest (SVG)
43. [x] Service worker : cache offline des cours existants
44. [x] Mode offline : consulter cours sans connexion (via SW)
45. [x] Meta viewport + theme-color mobile déjà OK, auditer

## IA / qualité contenu

46. [x] Quiz généré à partir des flashcards seules (quand pas de slides)
47. [x] Adaptation automatique de difficulté selon perf passée
48. [x] Bouton "expliquer ce concept" (deep dive IA sur un terme)
49. [x] Détection de langage du cours (FR/EN) et output adapté
50. [x] README utilisateur final + captures pour rendu

## Passe design — sortir du template (`[DESIGN]`)

Fondation posée (itération 24, 2026-06-23) : palette clay, polices Bricolage/Hanken/DM Mono, primitives `.cb-*`, grain, animations. Voir `LOOP-NOTES.md` (direction artistique) et page de référence `/design-system`. Objectifs ci-dessous = appliquer cette passe écran par écran.

51. [DESIGN] [ ] Home : header Cerebra + chips streak/réglages, carte « Objectif du jour » sombre avec anneau de progression (SVG), recherche, chips de tri (remplacer le Select), cartes de cours tintées par matière (`.cb-tile` + icône) avec barre de progression + XP (étoile gold), zone upload dashed clay, toggle « colle du texte ».
52. [DESIGN] [ ] Course : header retour + titre éditable + picto matière, onglets en pilules `.cb-pill` (Parcours/Résumé/Cartes/Quiz/Stats), nœuds du parcours (ronds done/current/locked + lien vertical), cards résumé à bord latérale colorée, carte flashcard flip `.cb-card`, quiz options `.cb-btn`, bottom-nav native.
53. [DESIGN] [ ] Onboarding : écran d'accueil clay (stamp BIENVENUE, titre Bricolage, CTA import dashed clay, « Coller mes notes », « Voir un exemple »).
54. [DESIGN] [ ] Settings : sections « Apparence » (thèmes Clair/Sombre/Système), « Objectif quotidien » (stepper ±), « Données » (export/import/reset), « À propos » (v0.1.0).
55. [DESIGN] [ ] Cohérence : remplacer toute card/bouton shadcn brut restant par les primitives `.cb-*`, vérifier le contraste ink↔clay (light) et l'identité dark, ajouter le grain `.cb-grain` là où ça fait sens.

---

**Ordre de traitement :** on suit grosso modo l'ordre du fichier (priorité aux fondations et à la valeur immédiate), avec regroupements logiques quand ça évite du rework. Ajustable selon retours de Muhamad.