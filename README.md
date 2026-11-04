# Cerebra — Apprends, joue, progresse

> Transforme tes cours (PowerPoint, PDF, Word, notes) en activités interactives : résumé, flashcards, quiz, jeux d'association, et plus encore.

---

## Fonctionnalités

### Import de cours
- **PowerPoint (.pptx)** — import et extraction automatique du texte
- **PDF (.pdf)** — extraction du contenu textuel
- **Word (.docx)** — extraction du texte structuré
- **Texte collé** — colle tes notes brutes, Cerebra les transforme en cours
- **Création manuelle** — ajoute des flashcards à la main

### Activités d'apprentissage
- **Résumé** — génération IA d'un résumé structuré avec points clés (3 styles : paragraphe, puces, tableau)
- **Flashcards** — mode flip ou "tape la réponse" avec correction IA
- **Quiz** — QCM avec timer par question, difficulté adaptable, revue des erreurs
- **Association** — jeu de matching terme ↔ définition (3 niveaux)
- **Défi rapidité** — réponds à un max de cartes en 30s/60s/90s
- **Mélange-mots** — reconstitue les termes à partir de leur définition
- **Texte à trous** — complète les phrases du cours
- **Carte conceptuelle** — replace les concepts dans le schéma

### Suivi et progression
- **Objectif quotidien** — configure ton nombre d'activités par jour
- **Streak** — série de jours consécutifs d'étude
- **XP et niveaux** — gagne de l'XP à chaque activité, monte en niveau (10 niveaux)
- **Succès** — 11 badges à débloquer (premier cours, 100%, streak 7j, etc.)
- **Stats par cours** — dernière étude, tentatives, meilleurs scores
- **Recherche** — trouve un cours par titre ou contenu
- **Tri et favoris** — trie par date/XP/progrès, épingle tes cours

### Personnalisation
- **Thème** — clair, sombre, ou automatique
- **Effets sonores** — sons au fil des réponses (activable/désactivable)
- **Feedback haptique** — vibration sur mobile pour les réponses

### Données
- **100% local** — tout est stocké dans ton navigateur (localStorage)
- **Export/Import JSON** — sauvegarde et restaure tes cours
- **Mode hors ligne** — les cours sont disponibles sans connexion (PWA)
- **Installable** — ajoute Cerebra à ton écran d'accueil

---

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

### Clé API Gemini (optionnelle)

Sans clé, Cerebra utilise des générations déterministes (fallback). Pour l'IA complète :

```bash
# Crée un fichier .env.local à la racine du projet
echo "GEMINI_API_KEY=ta_cle_ici" > .env.local
```

Obtiens une clé gratuitement sur [Google AI Studio](https://aistudio.google.com/apikey).

En ligne (Netlify) : ajoute `GEMINI_API_KEY` dans *Site configuration → Environment variables*, puis redéploie.
Pour vérifier que l'IA est bien branchée, ouvre `/api/ai-status` : la réponse doit contenir `"ok": true`.
Le modèle par défaut est `gemini-flash-latest` ; la variable `GEMINI_MODEL` permet d'en choisir un autre.

---

## Stack technique

- **Framework** : Next.js 16 (App Router), TypeScript, Tailwind v4
- **IA** : Google Gemini Flash, offre gratuite (via `@google/genai`)
- **Persistance** : localStorage navigateur (aucune base de données)
- **PWA** : manifest + service worker pour installation et offline
- **Dépendances principales** : `lucide-react` (icônes), `sonner` (toasts), `next-themes` (thème)

---

## Licence

Projet personnel — Muhamad, Chernex, Suisse.
