# Cerebra — Loop Notes

Mémoire de la boucle autonome : mission permanente (à respecter à chaque itération) + décisions de direction artistique et technique prises au fil du temps. Ne jamais perdre cette cohérence entre itérations.

---

## Mission permanente

### Partie 1 — Design : sortir du template

**Le problème à éviter activement**
Les apps "vibe codées" se reconnaissent en 2 secondes : palette violet/bleu/indigo par défaut, fond blanc ou gris clair uniforme, cards avec border-radius 12px et shadow-sm partout, boutons shadcn jamais customisés, typographie Inter/Geist sans hiérarchie forte, zéro texture, zéro grain, zéro personnalité. C'est exactement ce que Cerebra doit éviter.

**Direction artistique à construire et faire évoluer**
- Choisis (et documente ci-dessous) une identité visuelle DISTINCTIVE et tiens-y : une palette de 2-3 couleurs signature qui ne soit PAS le violet/bleu par défaut de shadcn (explore : terracotta + crème, vert sapin + or, noir encre + jaune signal, etc.)
- Système de couleurs sémantique cohérent (succès, erreur, warning, accent) dérivé de cette palette signature, pas des couleurs Tailwind par défaut (green-500, red-500 bruts)
- Typographie : au moins une police d'accroche avec du caractère pour les titres, hiérarchie typographique marquée (tailles, poids, tracking) entre titres, sous-titres, corps de texte
- Casse les angles droits et les radius uniformes : varie les formes selon le contexte, explore les formes organiques, les angles coupés, les blobs pour les éléments de fond
- Ombres et profondeur : ombres colorées (teintées de la couleur signature), bordures épaisses style néo-brutalisme, ou superpositions avec offset, selon la direction choisie
- Micro-interactions et motion : chaque action importante (bonne réponse, complétion, level up) a une animation signature et mémorable (framer-motion ou CSS, spring physics, overshoot, easing personnalisé)
- Illustrations/iconographie : pas 100% Lucide par défaut sans retouche — varie l'épaisseur de trait, touches dessinées à la main pour états vides/célébrations, ou style d'icône cohérent et choisi
- Dark mode : sa propre identité de couleurs, pas juste l'inversion mécanique du light mode
- Texture et grain : envisager une subtile texture de fond (grain, noise SVG, motif discret) plutôt qu'un aplat de couleur plat

**Process à chaque itération design**
1. Avant de coder un écran/composant : "est-ce que ça ressemble à un template shadcn par défaut qu'on voit sur 50 autres sites ?" Si oui, retravaille.
2. Documente ici les décisions de direction artistique (palette exacte en hex, police choisie, style d'ombre, etc.) pour rester cohérent entre itérations.
3. Si un écran existant est resté "template par défaut" sans passe design, ajoute-le au backlog avec le tag `[DESIGN]`.
4. Vérifie la cohérence : un nouvel écran doit utiliser les mêmes tokens de couleur, les mêmes patterns d'ombre/radius que les écrans déjà stylés.

### Partie 2 — Features : enrichir en continu

**Catégories à explorer en permanence** (au-delà du backlog initial, à puiser quand il s'épuise ou en parallèle) :

*Mini-jeux d'apprentissage* (au-delà quiz/flashcards/matching déjà présents)
- Speed round avec combo/multiplicateur de score
- Jeu de tri/classement (drag & drop, ordre chronologique)
- Mode duel ou défi chronométré avec classement
- Construction de phrase à trous (fill-in-the-blank) sur les définitions
- Jeu mémoire visuel (paires) thématisé au cours
- Mini-jeu type "qui veut gagner des millions" avec paliers et joker

*Nouvelles pages / templates*
- Page de profil élève avec stats visuelles marquantes
- Page Classement / leaderboard si plusieurs utilisateurs/défis partagés
- Dashboard repensé régulièrement pour rester engageant
- Templates de fiches de révision, plusieurs styles visuels au choix
- Page Trophées/Achievements en vitrine soignée
- Écran de victoire mémorable en fin de cours (pas un toast générique)

*Profondeur pédagogique*
- Formats de question au-delà du QCM (association, ordre, zones cliquables sur image/schéma)
- Difficulté adaptative selon la performance
- Explications "pourquoi c'est faux", pas juste "pourquoi c'est vrai"

*Couche sociale/motivation*
- Défis entre amis sur un même cours
- Partage d'un résultat/trophée en image générée (shareable card)
- Citations/encouragements qui varient selon l'heure ou la séquence de réussite

**Process à chaque itération feature**
1. Vérifie un VRAI bénéfice pédagogique ou d'engagement avant d'ajouter une feature, pas de complexité gratuite.
2. Toute nouvelle feature reçoit immédiatement le traitement design de la Partie 1 — jamais une feature "brute".
3. Si une feature touche au scoring/XP/progression, vérifie la cohérence avec le système existant (pas deux systèmes parallèles incohérents).

### Partie 3 — Design & features pour les pages de type site (si applicable)

Si une partie du projet est plutôt un site (vitrine, marketing, landing) qu'une app, applique la même exigence de sortir du template, avec des pièges spécifiques :

**À éviter** : hero plein écran dégradé violet/bleu + titre centré + 2 boutons, sections features en 3 colonnes identiques, témoignages en cards rondes + étoiles, footer 4 colonnes générique, Inter/Geist partout, fade-in-on-scroll identique partout, mockup dashboard flottant avec ombre.

**Direction propre au web** : casser la grille centrée (asymétrie, superposition, diagonale, bleed), scroll storytelling avec rythme varié et une touche de scroll originale et unique au projet, typographie comme élément graphique, curseur/hover personnalisés (magnetic buttons, distorsion, reveal), transitions de page signature, palette/ambiance variée par page tout en restant cohérente, visuels custom plutôt que stock photos, footer travaillé.

**Pages à explorer** : à propos avec timeline visuelle, comparaison concurrents avec tableau retravaillé, cas d'usage en mini-étude de cas visuelle, 404 avec identité propre, pricing avec accroche visuelle, landing pages par campagne, blog avec traitement éditorial (cards de tailles variables).

**Features spécifiques** : formulaires avec UX soignée (validation temps réel, micro-feedback), recherche/filtre fluide, dark mode cohérent, animations de scroll qui racontent quelque chose, lecteur vidéo custom, SEO/perf (pages légères, meta tags, sémantique correcte).

**Process** : avant de construire une section, "pourrait-elle être copiée-collée sur n'importe quel autre site sans qu'on remarque la différence ?" Si oui, retravailler. Vérifier la cohérence du système de design entre pages tout en variant le rythme.

### Règles de la boucle

- 1 à 3 objectifs max par itération, mélange backlog existant + objectifs design/feature auto-identifiés selon les critères ci-dessus
- Toute itération UI s'accompagne d'une vérification de cohérence avec la direction artistique déjà documentée ici — pas de retour vers du shadcn par défaut non retouché
- Build vérifié (`npx tsc --noEmit`) avant de cocher un objectif comme fait
- Mettre à jour `BACKLOG.md` (coche + nouveaux objectifs), `PROGRESS.md` (résumé daté), et ce fichier (décisions de direction artistique, pièges, choix techniques) à chaque itération
- Si le backlog initial est épuisé, ne pas s'arrêter : générer de nouveaux objectifs depuis les catégories ci-dessus, en gardant la Partie 1 comme filtre qualité sur tout ce qui touche au visuel

---

## Décisions de direction artistique (App)

Identité **clay chaud / crème**, figée depuis le design `Cerebra.dc.html` (itération 24, 2026-06-23). Source de vérité : `globals.css` (tokens) + page de référence `/design-system`.

**Palette (light)**
- `--bg #F2E9DA` · `--surface #FBF6EC` · `--surface-2 #F3E9D6`
- `--ink #221C17` · `--ink-2 #473A2E` · `--muted #7A6B5C` · `--line #E6DAC6`
- Signature : `--clay #CC6B43` · `--clay-deep #B0512E`
- Sémantique : `--gold #E5A52C` (streak/XP) · `--sage #4E8B57` (succès) · `--crimson #BE3A2B` (erreur) · `--petrol #2B6C68` (alt/chart)

**Palette (dark)** — sa propre identité, pas une inversion mécanique :
`--bg #191310` · `--surface #241B15` · `--surface-2 #2E231B` · `--ink #F4EBDC`
· `--muted #A8957F` · `--line #3A2C22` · `--clay #E2855C` · `--clay-deep #C96A41`
· `--gold #F0BA50` · `--sage #6FB06E` · `--crimson #E0685A` · `--petrol #4FA39C`.
Sur clay/sage/gold en dark, le texte est `--bg` (encre sombre) pour le contraste.

**Typographie** — hiérarchie marquée :
- Titres/display : **Bricolage Grotesque** (800/700, tracking serré, `font-heading`).
- Corps : **Hanken Grotesk** (400-700).
- Labels/stamps/code : **DM Mono** (`.cb-mono`).
- `h1..h5` utilisent Bricolage par défaut (base layer).

**Ombres & radius (néo-brutalisme doux)** — bordures épaisses + ombres offset colorées, jamais `shadow-sm` uniforme :
- Carte signature `.cb-card` : bordure `2px var(--ink)` + ombre `5px 5px 0 var(--ink)`.
- Variante douce `.cb-card-line` : bordure `1.5px var(--line)` + ombre teintée clay `0 6px 18px -10px`.
- Bouton `.cb-btn` : bordure `2.5px var(--ink)` + ombre offset `4px 4px 0 var(--clay)` (s'enfonce à `1px 1px 0` au tap).
- Radius variés : coins coupés sur les pictos (`.cb-tile` → `16px 16px 16px 6px`, rotation -2°), stamps inclinés (`rotate(-1.5deg)`), pilules `999px`. Pas de radius uniforme.

**Micro-interactions / motion** — `--ease-out cubic-bezier(.21,.71,.18,1)`, `--ease-stamp`. Tap = `scale(.97)`. Keyframes `cbFloat`/`cbPop`/`cbPulse`/`cbShimmer`/`cbSheet`/`cbFade`/`cbSpin` (utilitaires `.animate-cb-*`). `prefers-reduced-motion` déjà géré (zéro animation).

**Texture / grain** — `.cb-grain` superpose un noise SVG fractal en `multiply` à 5% (utiliser sur un parent positionné). Pas d'aplat plat.

**Icônes** — Lucide accepté mais varier épaisseur de trait et préférer les stamps/pictos tintés (`.cb-tile` sur couleur signature) plutôt que des icônes brutes sur fond `primary/10` générique.

**Pièges à respecter entre itérations :** un nouvel écran DOIT utiliser ces tokens et primitives (pas revenir au violet/Geist, pas de cards `shadow-sm` radius 12 uniformes). Vérifier le contraste ink↔clay en light (texte big sur clay : privilégier cream `#FBF6EC` pour grands titres).

---

## Décisions de direction artistique (Site, si applicable)

_À remplir si une partie du projet est un site distinct de l'app : grille, rythme de scroll, traitement typographique propre au web._

(Non applicable pour l'instant — Cerebra est une app.)

---

## Pièges identifiés / choix techniques

_À remplir au fil des itérations._
