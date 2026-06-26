# Cerebra — Reprendre le travail

App d'étude gamifiée : upload PowerPoint → résumé, flashcards, quiz + parcours d'apprentissage type Duolingo (0→100%).

## Relancer l'app

```bash
cd "C:/Users/Momoo/Desktop/Ressources - Templates/jarvis-starter-kit/jarvis-starter-kit/study-app"
npm run dev
```

Puis ouvre http://localhost:3000

- Build de production : `npm run build && npm start`
- Lint : `npm run lint`

## Activer la vraie IA (optionnel)

Par défaut, l'app génère résumés/cartes/quiz avec un **fallback local** (pas de clé requise).
Pour utiliser Gemini (qualité bien supérieure), crée un fichier `.env.local` à la racine de `study-app` :

```
GEMINI_API_KEY=AIza...
```

Relance `npm run dev`. Sans clé, le fallback prend automatiquement le relais.

## Où trouver quoi

```
src/
├─ app/
│  ├─ page.tsx              # Accueil (upload + liste des cours)
│  ├─ course/[id]/page.tsx  # Page d'un cours
│  └─ api/
│     ├─ parse-pptx/        # Extraction du texte du .pptx
│     ├─ summarize/         # Résumé IA
│     ├─ flashcards/        # Cartes mémoire IA
│     └─ quiz/              # QCM IA
├─ lib/
│  ├─ types.ts              # Modèle de données
│  ├─ store.ts              # Persistance localStorage + parcours
│  ├─ pptx.ts               # Parsing PPTX (JSZip + XML)
│  ├─ ai.ts                 # Service IA (Claude + fallback)
│  └─ fallback.ts           # Génération locale sans clé
└─ components/
   ├─ app-header.tsx
   ├─ upload-zone.tsx
   ├─ course-view.tsx       # Vue tabbed d'un cours
   ├─ learning-path.tsx     # Arbre gamifié
   └─ activities.tsx        # Les 5 activités (résumé, cartes, quiz, matching, speed)
```

## Ce qui est fait

- Upload .pptx + parsing server-side
- Résumé, flashcards (flip), quiz (nb questions + difficulté), jeu d'association, défi rapidité 30s
- Arbre de parcours gamifié (6 étapes, déblocage progressif, XP, progression 0→100%)
- Persistance navigateur (localStorage)

## À continuer

- [ ] Valider le parsing sur de VRAIS .pptx (testé seulement sur fallback)
- [ ] Corriger la formule de score du jeu d'association
- [ ] Confetti / célébration à 100%
- [ ] Toggle dark mode
- [ ] Empty states + responsive mobile
- [ ] Export / import des cours (sauvegarde)

## Reprise avec Claude

Ouvre une session Claude Code dans le dossier `jarvis-starter-kit` (ou `study-app`) et dis simplement :
> "Continue Cerebra" (ou lance `/prime` puis demande de reprendre Cerebra).

Claude a une fiche mémoire sur ce projet (chemin, stack, ce qui est fait / à faire) et peut repartir directement.