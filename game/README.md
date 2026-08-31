# Val d'Ambre

Jeu de ferme et de vie de village en pixel art, dans l'esprit de *Stardew Valley*.
Écrit en TypeScript, rendu sur `<canvas>`, empaqueté en application desktop avec
[Tauri](https://v2.tauri.app) pour une distribution sur Steam.

**Aucun asset externe** : tous les sprites sont dessinés par le code au démarrage
et tous les sons sont synthétisés en WebAudio. Le jeu complet pèse ~60 ko de JS.

## Démarrer

```bash
cd game
npm install
npm run dev          # http://localhost:5180
```

Autres commandes :

| Commande | Effet |
| --- | --- |
| `npm run build` | Vérifie les types puis produit `dist/` |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm run desktop:dev` | Lance la fenêtre desktop Tauri |
| `npm run desktop:build` | Produit l'exécutable et les installeurs |
| `node tools/generate-icon.mjs` | Régénère `src-tauri/icons/icon.png` |

## Commandes en jeu

| Touche | Action |
| --- | --- |
| `ZQSD` / `WASD` / flèches | Se déplacer |
| `Espace` ou clic gauche | Utiliser l'outil tenu sur la tuile devant soi |
| `E` ou clic droit | Récolter, parler, dormir, ouvrir la caisse, manger |
| `1`…`0`, `-`, `=` / molette | Changer d'objet dans la barre rapide |
| `I` ou `Tab` | Ouvrir le sac |
| `Échap` | Menu (sauvegarde, son, retour au titre) |

La manette est gérée (stick gauche, A = outil, X = interagir, gâchettes = barre rapide).

## Boucle de jeu

1. **Laboure** la terre à la houe, **sème**, **arrose** à l'arrosoir (à remplir à la mare).
2. **Dors** dans le lit de la ferme : la nuit fait pousser les cultures arrosées et
   vend ce qui est dans la caisse d'expédition.
3. **Récolte**, **expédie**, et rachète des semences au magasin général du village.

Autres systèmes : 4 saisons de 28 jours, pluie qui arrose à ta place, énergie
consommée par les outils (et rendue par la nourriture), cycle jour/nuit,
bois et minerais à récolter, sauvegarde automatique chaque matin.

### Cultures

| Culture | Saison | Jours | Graines | Vente | Repousse |
| --- | --- | --- | --- | --- | --- |
| Navet | Printemps | 4 | 20 | 42 | — |
| Pomme de terre | Printemps | 6 | 50 | 90 | — |
| Fraise | Printemps | 8 | 100 | 130 | 4 j |
| Tomate | Été | 11 | 50 | 72 | 4 j |
| Piment | Été | 5 | 40 | 48 | 3 j |
| Melon | Été | 12 | 80 | 300 | — |
| Maïs | Été / Automne | 14 | 150 | 62 | 4 j |
| Citrouille | Automne | 13 | 100 | 380 | — |

## Architecture

```
src/
  core/      boucle à pas fixe, entrées, audio synthétisé, RNG, stockage
  world/     tuiles, cartes, objets du décor, définitions des cultures
  game/      joueur, inventaire, outils, horloge, économie, PNJ, orchestrateur
  render/    atlas de sprites généré par code, rendu du monde, HUD
  ui/        écrans (titre, sac, boutique, caisse, dialogue, bilan, pause)
src-tauri/   application desktop (Rust + Tauri v2)
tools/       générateur d'icône PNG sans dépendance
```

Le monde est rendu dans un tampon en basse résolution (×3) puis agrandi sans
lissage, ce qui garantit des pixels nets ; l'interface est dessinée par-dessus à
la résolution native de l'écran pour que le texte reste lisible.

## Distribution Steam

Voir [`docs/STEAM.md`](docs/STEAM.md) pour la procédure complète (compte
Steamworks, depots, SteamPipe, succès).
