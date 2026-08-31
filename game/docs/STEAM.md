# Publier Val d'Ambre sur Steam

Procédure complète, de l'inscription à la mise en vente. Les points marqués
**⚠️** sont ceux qui bloquent le plus souvent une sortie.

## 1. Ouvrir le compte Steamworks

1. Créer un compte partenaire sur <https://partner.steamgames.com>.
2. Payer les frais **Steam Direct : 100 $ US par jeu**, remboursables (crédités
   sur le compte partenaire) une fois **1 000 $ de recettes brutes** atteints.
3. Fournir l'identité fiscale et les coordonnées bancaires. ⚠️ La validation
   fiscale prend souvent plusieurs jours ouvrés, et rien ne peut sortir avant.
4. Steam attribue alors un **AppID** (le jeu) et des **DepotIDs** (les paquets
   de fichiers, un par plateforme).

## 2. Construire les exécutables

Il n'existe pas de compilation croisée fiable pour Tauri : **chaque système doit
être compilé sur lui-même**. Le workflow `.github/workflows/game-desktop.yml`
s'en charge sur les trois runners GitHub et publie les artefacts.

En local :

```bash
cd game
npm ci
npm run desktop:build
```

Prérequis par plateforme :

| Plateforme | Prérequis |
| --- | --- |
| Linux | `libwebkit2gtk-4.1-dev`, `librsvg2-dev`, `libgtk-3-dev`, `patchelf` |
| Windows | Visual Studio Build Tools (C++), WebView2 (présent sur Windows 10/11) |
| macOS | Xcode Command Line Tools |

Le binaire se trouve dans `game/src-tauri/target/release/`, les installeurs dans
`game/src-tauri/target/release/bundle/`.

⚠️ **Pour Steam, on téléverse le binaire brut et ses fichiers d'accompagnement,
pas l'installeur** (`.msi`, `.deb`, `.dmg`). Steam gère lui-même l'installation.

## 3. Organiser les depots

Trois depots, un par plateforme, avec un dossier de contenu chacun :

```
build/
  content/
    windows/   val-dambre.exe + WebView2Loader.dll éventuel
    linux/     val-dambre (exécutable, bit +x conservé)
    macos/     Val d'Ambre.app/
  scripts/
    app_build_2000000.vdf
    depot_build_2000001.vdf   (windows)
    depot_build_2000002.vdf   (linux)
    depot_build_2000003.vdf   (macos)
```

`app_build_2000000.vdf` (remplacer les identifiants par les vôtres) :

```vdf
"appbuild"
{
  "appid"    "2000000"
  "desc"     "Val d'Ambre 0.1.0"
  "buildoutput" "../output"
  "contentroot" "../content"
  "setlive"  ""              // laisser vide : on promeut la branche à la main
  "depots"
  {
    "2000001" "depot_build_2000001.vdf"
    "2000002" "depot_build_2000002.vdf"
    "2000003" "depot_build_2000003.vdf"
  }
}
```

`depot_build_2000001.vdf` :

```vdf
"DepotBuild"
{
  "DepotID" "2000001"
  "contentroot" "../content/windows"
  "FileMapping"
  {
    "LocalPath" "*"
    "DepotPath" "."
    "recursive" "1"
  }
  "FileExclusion" "*.pdb"
}
```

## 4. Téléverser avec SteamPipe

```bash
steamcmd +login <compte_partenaire> \
         +run_app_build ../build/scripts/app_build_2000000.vdf \
         +quit
```

Puis, dans Steamworks → *Builds*, promouvoir le build sur la branche `default`.

⚠️ Le compte partenaire utilisé par `steamcmd` doit avoir la permission
« Modifier les métadonnées de l'application » et le Steam Guard doit être
pré-autorisé sur la machine (sinon le CI reste bloqué sur la demande de code).

## 5. Page boutique et validation

- Renseigner : nom, description courte et longue, tags, classification d'âge,
  configuration requise, langues.
- Fournir les visuels : capsules **616×353**, **462×174**, **1920×620**,
  en-tête **460×215**, plus au moins 5 captures d'écran et une bande-annonce.
- Soumettre le build **et** la page boutique à la revue Valve : comptez
  **1 à 5 jours ouvrés**.
- ⚠️ Une fois la page boutique approuvée, Steam impose **au moins 2 semaines**
  de visibilité publique avant la date de sortie. Prévoyez ce délai.

## 6. Succès et intégration Steamworks (optionnel)

Le jeu tourne aujourd'hui sans le SDK Steam. Pour ajouter les succès, le cloud
ou les classements, brancher [`steamworks`](https://crates.io/crates/steamworks)
côté Rust et l'exposer au jeu par des commandes Tauri :

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn unlock_achievement(client: tauri::State<steamworks::Client>, name: String) {
    let stats = client.user_stats();
    stats.achievement(&name).set().ok();
    stats.store_stats().ok();
}
```

Côté TypeScript, appeler `invoke("unlock_achievement", { name: "premiere_recolte" })`
depuis les endroits pertinents (`confirmSleep`, récolte, première vente…).

Succès naturels au vu de la boucle de jeu actuelle :
`premiere_recolte`, `premiere_vente`, `1000_pieces`, `saison_complete`,
`toutes_les_cultures`, `arbre_abattu`, `nuit_blanche` (s'endormir à 2 h).

⚠️ Un jeu qui utilise le SDK doit être lancé **par Steam** pour que l'API
s'initialise. Prévoir un repli propre quand `SteamAPI_Init` échoue, afin que le
jeu reste lançable hors Steam pendant le développement.

## 7. Liste de contrôle avant soumission

- [ ] Le jeu se lance sur une machine vierge, sans dépendance manquante.
- [ ] La sauvegarde survit à une fermeture brutale de la fenêtre.
- [ ] Les résolutions 1280×720, 1920×1080 et 2560×1440 sont lisibles.
- [ ] La manette permet de jouer une partie complète.
- [ ] Un moyen de quitter le jeu existe depuis le menu.
- [ ] Les crédits et la licence des dépendances sont affichés.
