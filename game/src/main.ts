import { Audio } from "./core/audio";
import { GameLoop } from "./core/loop";
import { Input } from "./core/input";
import { Game } from "./game/game";

const canvas = document.getElementById("screen") as HTMLCanvasElement | null;
const boot = document.getElementById("boot");
if (!canvas) throw new Error("Canvas introuvable");

const audio = new Audio();
const input = new Input(canvas);
const game = new Game(canvas, input, audio);

// Le contexte audio ne peut démarrer qu'après un geste de l'utilisateur.
const unlock = (): void => {
  audio.unlock();
  window.removeEventListener("pointerdown", unlock);
  window.removeEventListener("keydown", unlock);
};
window.addEventListener("pointerdown", unlock);
window.addEventListener("keydown", unlock);

const loop = new GameLoop(
  1 / 60,
  (dt) => {
    game.update(dt);
    input.endFrame();
  },
  () => game.render(),
);

// En développement uniquement : accès à la partie depuis la console et les tests.
if (import.meta.env.DEV) {
  (window as unknown as { __game?: Game }).__game = game;
}

boot?.remove();
loop.start();

// Sauvegarde de secours si l'onglet ou la fenêtre se ferme en pleine partie.
window.addEventListener("beforeunload", () => game.save());
