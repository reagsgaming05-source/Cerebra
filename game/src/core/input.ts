export type Action =
  | "up"
  | "down"
  | "left"
  | "right"
  | "use"
  | "interact"
  | "inventory"
  | "menu"
  | "confirm"
  | "map";

const KEY_BINDINGS: Record<string, Action> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "use",
  KeyE: "interact",
  KeyI: "inventory",
  Tab: "inventory",
  Escape: "menu",
  Enter: "confirm",
  KeyM: "map",
};

/**
 * Entrées clavier / souris / manette.
 * `pressed` = maintenu, `justPressed` = déclenché sur cette frame uniquement.
 */
export class Input {
  private readonly down = new Set<Action>();
  private readonly fresh = new Set<Action>();
  private readonly rawDown = new Set<string>();

  mouseX = 0;
  mouseY = 0;
  mouseDown = false;
  mouseFresh = false;
  rightDown = false;
  rightFresh = false;
  wheel = 0;
  /** Slot de la barre rapide demandé au clavier (1-12), -1 si aucun. */
  hotbarRequest = -1;

  private gamepadIndex: number | null = null;
  private readonly prevGamepadButtons = new Set<number>();

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    canvas.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("gamepadconnected", this.onGamepadConnected);
    window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    // Tab et Espace font défiler ou activer la page : on garde le focus sur le jeu.
    if (e.code === "Tab" || e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
    if (e.repeat) return;

    const digit = this.digitSlot(e.code);
    if (digit >= 0) this.hotbarRequest = digit;

    this.rawDown.add(e.code);
    const action = KEY_BINDINGS[e.code];
    if (action !== undefined && !this.down.has(action)) {
      this.down.add(action);
      this.fresh.add(action);
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.rawDown.delete(e.code);
    const action = KEY_BINDINGS[e.code];
    if (action !== undefined) this.down.delete(action);
  };

  /** Digit1..Digit9 puis Digit0 = slots 0..9, moins/égal = slots 10 et 11. */
  private digitSlot(code: string): number {
    if (code === "Digit0") return 9;
    if (code === "Minus") return 10;
    if (code === "Equal") return 11;
    if (code.startsWith("Digit")) return Number(code.slice(5)) - 1;
    return -1;
  }

  private onBlur = (): void => {
    this.down.clear();
    this.rawDown.clear();
    this.mouseDown = false;
    this.rightDown = false;
  };

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  };

  private onMouseDown = (e: MouseEvent): void => {
    e.preventDefault();
    if (e.button === 0) {
      if (!this.mouseDown) this.mouseFresh = true;
      this.mouseDown = true;
    } else if (e.button === 2) {
      if (!this.rightDown) this.rightFresh = true;
      this.rightDown = true;
    }
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) this.mouseDown = false;
    else if (e.button === 2) this.rightDown = false;
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.wheel += Math.sign(e.deltaY);
  };

  private onGamepadConnected = (e: GamepadEvent): void => {
    this.gamepadIndex = e.gamepad.index;
  };

  private onGamepadDisconnected = (): void => {
    this.gamepadIndex = null;
    this.prevGamepadButtons.clear();
  };

  /** À appeler en début de frame : injecte l'état manette dans les actions. */
  pollGamepad(): void {
    if (this.gamepadIndex === null || !navigator.getGamepads) return;
    const pad = navigator.getGamepads()[this.gamepadIndex];
    if (!pad) return;

    const axisX = pad.axes[0] ?? 0;
    const axisY = pad.axes[1] ?? 0;
    const DEADZONE = 0.35;
    this.setFromPad("left", axisX < -DEADZONE || this.padButton(pad, 14));
    this.setFromPad("right", axisX > DEADZONE || this.padButton(pad, 15));
    this.setFromPad("up", axisY < -DEADZONE || this.padButton(pad, 12));
    this.setFromPad("down", axisY > DEADZONE || this.padButton(pad, 13));
    this.setFromPad("use", this.padButton(pad, 0));
    this.setFromPad("interact", this.padButton(pad, 2));
    this.setFromPad("inventory", this.padButton(pad, 3));
    this.setFromPad("menu", this.padButton(pad, 9));
    this.setFromPad("confirm", this.padButton(pad, 0));

    // Gâchettes : navigation dans la barre rapide.
    if (this.padButton(pad, 4) && !this.prevGamepadButtons.has(4)) this.wheel -= 1;
    if (this.padButton(pad, 5) && !this.prevGamepadButtons.has(5)) this.wheel += 1;

    this.prevGamepadButtons.clear();
    pad.buttons.forEach((b, i) => {
      if (b.pressed) this.prevGamepadButtons.add(i);
    });
  }

  private padButton(pad: Gamepad, index: number): boolean {
    return pad.buttons[index]?.pressed === true;
  }

  private setFromPad(action: Action, isDown: boolean): void {
    if (isDown) {
      if (!this.down.has(action)) {
        this.down.add(action);
        this.fresh.add(action);
      }
    } else if (this.padPressedLastFrame(action)) {
      this.down.delete(action);
    }
  }

  /** Une action maintenue au clavier ne doit pas être relâchée par la manette. */
  private padPressedLastFrame(action: Action): boolean {
    for (const [code, mapped] of Object.entries(KEY_BINDINGS)) {
      if (mapped === action && this.rawDown.has(code)) return false;
    }
    return true;
  }

  pressed(action: Action): boolean {
    return this.down.has(action);
  }

  justPressed(action: Action): boolean {
    return this.fresh.has(action);
  }

  /** À appeler en fin de frame : purge les événements « une seule fois ». */
  endFrame(): void {
    this.fresh.clear();
    this.mouseFresh = false;
    this.rightFresh = false;
    this.wheel = 0;
    this.hotbarRequest = -1;
  }
}
