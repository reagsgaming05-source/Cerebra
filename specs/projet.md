# Quiz : timer par question

> Spec auto-générée depuis BACKLOG.md #30.

## Objectif

Ajouter une pression de temps par question pour simuler des conditions d'examen et
empêcher de réfléchir indéfiniment.

## Besoins exacts

- `QuizActivity` : constante `QUESTION_SECONDS = 20`. État `timeLeft`, décompte chaque
  seconde via un effet (même pattern que le countdown déjà existant dans `SpeedActivity`),
  actif seulement si la question courante n'est pas encore répondue.
- À 0 seconde sans réponse : la question est marquée répondue avec une réponse sentinelle
  (`selected = -1`, aucune option ne correspond), ce qui déclenche le même affichage de
  révélation que pour une réponse choisie (bonne réponse en vert), sans incrémenter `correct`.
  Enregistré dans `answers[qi] = -1` pour la revue des erreurs (#29).
- Affichage d'un badge timer (icône `Timer`, déjà importée) près de l'en-tête
  "Question X / Y", couleur d'alerte si `timeLeft <= 5`.
- `timeLeft` réinitialisé à `QUESTION_SECONDS` à chaque nouvelle question (`next()`) et au
  lancement d'un nouveau quiz.

## Cas limites

- Temps écoulé sans sélection : comptée incorrecte, bonne réponse révélée, bouton
  "Question suivante" devient cliquable normalement (pas d'avance automatique).
- Réponse donnée juste avant 0 : le décompte s'arrête (effet désactivé dès `answered`).
- Changement de question : timer repart à `QUESTION_SECONDS`, pas de report du temps restant.

## Définition de "terminé"

- Chaque question affiche un compte à rebours qui, à 0, révèle la bonne réponse sans
  sélection de l'utilisateur et compte comme une erreur.
- `npx tsc --noEmit` passe sans erreur. Zéro nouvelle dépendance.
