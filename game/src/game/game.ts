import { Audio } from "../core/audio";
import { Input } from "../core/input";
import { Rng, randomSeed } from "../core/rng";
import { loadJson, saveJson } from "../core/storage";
import { TILE } from "../world/tiles";
import { createWorld, type WorldMaps } from "../world/maps";
import type { GameMap, MapId, SerializedMap } from "../world/world";
import { Renderer, ZOOM } from "../render/renderer";
import { buildAtlas } from "../render/sprites";
import { Painter } from "../render/ui";
import { drawHud, drawToasts, hotbarSlotAt, TOAST_DURATION, type Toast } from "../render/hud";
import { Menus, type SaleLine } from "../ui/screens";
import { Inventory, HOTBAR_SIZE, type Slot } from "./inventory";
import { itemDef } from "./items";
import { Player } from "./player";
import { Clock } from "./time";
import { ShippingBin, shopStock } from "./economy";
import { npcsOnMap, dialogueFor, NPCS } from "./npc";
import { advanceDay, interact, useHeldItem, type ActionContext, type ActionOutcome } from "./actions";

type Mode = "title" | "play" | "inventory" | "bin" | "shop" | "dialogue" | "sleep" | "pause";

const SAVE_KEY = "save-v1";

interface SaveData {
  seed: number;
  currentMap: MapId;
  player: ReturnType<Player["serialize"]>;
  inventory: (Slot | null)[];
  selected: number;
  clock: ReturnType<Clock["serialize"]>;
  bin: Slot[];
  maps: Record<string, SerializedMap>;
}

export class Game {
  private readonly atlas = buildAtlas();
  private readonly renderer: Renderer;
  private readonly painter: Painter;
  private readonly menus: Menus;

  private maps: WorldMaps;
  private currentMap: MapId = "farm";
  private seed = randomSeed();
  private rng = new Rng(this.seed ^ 0x9e3779b9);

  readonly player = new Player();
  readonly inventory = new Inventory();
  readonly clock = new Clock();
  readonly bin = new ShippingBin();

  private mode: Mode = "title";
  private toasts: Toast[] = [];
  private cursorStack: Slot | null = null;
  private dialogue: { name: string; text: string; thenShop: boolean } | null = null;
  private sale: { lines: SaleLine[]; total: number; exhausted: boolean } | null = null;
  private justSaved = false;
  private elapsed = 0;
  private cssWidth = 0;
  private cssHeight = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly input: Input,
    private readonly audio: Audio,
  ) {
    this.maps = createWorld(this.seed);
    this.renderer = new Renderer(canvas, this.atlas);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Contexte 2D indisponible");
    this.painter = new Painter(ctx);
    this.menus = new Menus(this.painter);
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  get map(): GameMap {
    return this.maps[this.currentMap];
  }

  hasSave(): boolean {
    return loadJson<SaveData>(SAVE_KEY) !== null;
  }

  resize(): void {
    this.cssWidth = this.canvas.clientWidth || window.innerWidth;
    this.cssHeight = this.canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.resize(this.cssWidth, this.cssHeight, dpr);
    const ctx = this.canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.painter.setScale(this.cssHeight);
  }

  // ----------------------------------------------------------- cycle de vie

  newGame(): void {
    this.seed = randomSeed();
    this.rng = new Rng(this.seed ^ 0x9e3779b9);
    this.maps = createWorld(this.seed);
    this.currentMap = "farm";

    this.player.load({ x: 0, y: 0, facing: "down", energy: 100, maxEnergy: 100, money: 500, water: 40 });
    this.player.setTilePosition(8, 10);
    this.inventory.load(new Array(HOTBAR_SIZE * 3).fill(null));
    for (const tool of ["hoe", "can", "axe", "pickaxe", "scythe"]) this.inventory.add(tool, 1);
    this.inventory.add("seed_navet", 15);
    this.inventory.selected = 0;

    this.clock.load({ minutes: 6 * 60, day: 1, seasonIndex: 0, year: 1, raining: false });
    this.bin.load([]);
    this.toasts = [];
    this.mode = "play";
    this.audio.startMusic();
  }

  save(): void {
    const maps: Record<string, SerializedMap> = {};
    for (const [id, map] of Object.entries(this.maps)) maps[id] = map.serialize();
    const ok = saveJson(SAVE_KEY, {
      seed: this.seed,
      currentMap: this.currentMap,
      player: this.player.serialize(),
      inventory: this.inventory.serialize(),
      selected: this.inventory.selected,
      clock: this.clock.serialize(),
      bin: this.bin.serialize(),
      maps,
    } satisfies SaveData);
    this.justSaved = ok;
    if (!ok) this.toast("Sauvegarde impossible", this.player.x, this.player.y, "#e0655a");
  }

  loadGame(): boolean {
    const data = loadJson<SaveData>(SAVE_KEY);
    if (!data) return false;

    this.seed = data.seed;
    this.rng = new Rng(this.seed ^ 0x9e3779b9);
    this.maps = createWorld(this.seed);
    for (const [id, serialized] of Object.entries(data.maps)) {
      const map = this.maps[id as MapId];
      if (map) map.load(serialized);
    }
    this.currentMap = data.currentMap;
    this.player.load(data.player);
    this.inventory.load(data.inventory);
    this.inventory.selected = data.selected;
    this.clock.load(data.clock);
    this.bin.load(data.bin);
    this.mode = "play";
    this.audio.startMusic();
    return true;
  }

  // ----------------------------------------------------------- utilitaires

  private toast(text: string, x: number, y: number, color = "#f4ecd8"): void {
    this.toasts.push({ text, x, y, life: TOAST_DURATION, color });
    if (this.toasts.length > 12) this.toasts.shift();
  }

  private actionContext(): ActionContext {
    return {
      map: this.map,
      player: this.player,
      inventory: this.inventory,
      clock: this.clock,
      rng: this.rng,
      sfx: (name) => this.audio.play(name),
      toast: (text, tx, ty, color) => this.toast(text, tx * TILE + TILE / 2, ty * TILE, color),
    };
  }

  private handleOutcome(outcome: ActionOutcome): void {
    switch (outcome.type) {
      case "message":
        this.toast(outcome.text, this.player.x, this.player.y - 16, "#e8c25a");
        break;
      case "sleep":
        this.beginSleep(false);
        break;
      case "bin":
        this.mode = "bin";
        this.audio.play("select");
        break;
      case "shop": {
        const mira = NPCS[0];
        this.dialogue = { name: mira.name, text: dialogueFor(mira, this.clock.day), thenShop: true };
        this.mode = "dialogue";
        this.audio.play("select");
        break;
      }
      default:
        break;
    }
  }

  private beginSleep(exhausted: boolean): void {
    const settled = this.bin.settle();
    this.sale = { lines: settled.lines, total: settled.total, exhausted };
    this.mode = "sleep";
    this.audio.play("sleep");
  }

  private confirmSleep(): void {
    if (!this.sale) return;
    this.player.money += this.sale.total;
    if (this.sale.total > 0) this.audio.play("coin");

    advanceDay(Object.values(this.maps), this.clock, this.rng);
    this.clock.nextDay(this.rng.next());
    this.player.energy = this.sale.exhausted
      ? Math.round(this.player.maxEnergy * 0.5)
      : this.player.maxEnergy;
    this.player.water = this.player.waterMax;

    // Le réveil se fait toujours dans le lit.
    this.currentMap = "house";
    this.player.setTilePosition(3, 4);
    this.player.facing = "down";

    this.sale = null;
    this.mode = "play";
    this.save();
    if (this.clock.raining) this.toast("Il pleut sur la vallée", this.player.x, this.player.y - 20, "#5aa8e0");
  }

  private tryWarp(): void {
    const warp = this.map.warpAt(this.player.tileX, this.player.tileY);
    if (!warp) return;
    this.currentMap = warp.to;
    this.player.setTilePosition(warp.tx, warp.ty);
    this.audio.play("select");
    this.toast(this.map.name, this.player.x, this.player.y - 24, "#c3ad8c");
  }

  // ----------------------------------------------------------- mise à jour

  update(dt: number): void {
    this.elapsed += dt;
    this.input.pollGamepad();
    this.menus.setCursor(this.input.mouseX, this.input.mouseY);
    this.menus.updateHover(this.input.mouseX, this.input.mouseY);

    for (let i = this.toasts.length - 1; i >= 0; i--) {
      this.toasts[i].life -= dt;
      if (this.toasts[i].life <= 0) this.toasts.splice(i, 1);
    }

    switch (this.mode) {
      case "title":
        this.updateTitle();
        break;
      case "play":
        this.updatePlay(dt);
        break;
      case "inventory":
        this.updateInventory();
        break;
      case "bin":
        this.updateBin();
        break;
      case "shop":
        this.updateShop();
        break;
      case "dialogue":
        this.updateDialogue();
        break;
      case "sleep":
        this.updateSleepScreen();
        break;
      case "pause":
        this.updatePause();
        break;
    }
  }

  private clicked(id: string): boolean {
    return this.input.mouseFresh && this.menus.hit(this.input.mouseX, this.input.mouseY) === id;
  }

  private updateTitle(): void {
    if (!this.input.mouseFresh) return;
    const hit = this.menus.hit(this.input.mouseX, this.input.mouseY);
    if (hit === "title:new") {
      this.audio.play("select");
      this.newGame();
    } else if (hit === "title:continue") {
      this.audio.play("select");
      if (!this.loadGame()) this.newGame();
    }
  }

  private updatePlay(dt: number): void {
    const dirX = (this.input.pressed("right") ? 1 : 0) - (this.input.pressed("left") ? 1 : 0);
    const dirY = (this.input.pressed("down") ? 1 : 0) - (this.input.pressed("up") ? 1 : 0);

    const previousTile = `${this.player.tileX},${this.player.tileY}`;
    this.player.update(dt, dirX, dirY, this.map);
    if (`${this.player.tileX},${this.player.tileY}` !== previousTile) this.tryWarp();

    // Sélection d'objet : molette, chiffres, gâchettes.
    if (this.input.wheel !== 0) {
      this.inventory.selectRelative(this.input.wheel);
      this.audio.play("select");
    }
    if (this.input.hotbarRequest >= 0 && this.input.hotbarRequest < HOTBAR_SIZE) {
      this.inventory.selected = this.input.hotbarRequest;
      this.audio.play("select");
    }

    // Un clic sur la barre rapide sélectionne l'objet au lieu d'utiliser l'outil.
    let clickConsumed = false;
    if (this.input.mouseFresh || this.input.rightFresh) {
      const slot = hotbarSlotAt(this.painter, this.cssWidth, this.cssHeight, this.input.mouseX, this.input.mouseY);
      if (slot !== null) {
        this.inventory.selected = slot;
        this.audio.play("select");
        clickConsumed = true;
      }
    }

    if (!this.player.acting) {
      if (this.input.justPressed("use") || (this.input.mouseFresh && !clickConsumed)) {
        this.handleOutcome(useHeldItem(this.actionContext()));
      } else if (this.input.justPressed("interact") || (this.input.rightFresh && !clickConsumed)) {
        this.handleOutcome(interact(this.actionContext()));
      }
    }

    if (this.input.justPressed("inventory")) {
      this.mode = "inventory";
      this.audio.play("select");
    }
    if (this.input.justPressed("menu")) {
      this.mode = "pause";
      this.justSaved = false;
      this.audio.play("select");
    }

    if (this.clock.tick(dt)) this.beginSleep(true);
  }

  private updateInventory(): void {
    if (this.input.justPressed("inventory") || this.input.justPressed("menu")) {
      this.returnCursorStack();
      this.mode = "play";
      this.audio.play("cancel");
      return;
    }
    if (!this.input.mouseFresh) return;

    const hit = this.menus.hit(this.input.mouseX, this.input.mouseY);
    if (!hit?.startsWith("slot:")) return;
    const index = Number(hit.split(":")[1]);

    if (this.cursorStack) {
      this.cursorStack = this.inventory.placeAt(index, this.cursorStack);
    } else {
      this.cursorStack = this.inventory.takeAt(index);
    }
    this.audio.play("select");
  }

  /** Remet dans le sac la pile éventuellement tenue par le curseur. */
  private returnCursorStack(): void {
    if (!this.cursorStack) return;
    this.inventory.add(this.cursorStack.id, this.cursorStack.count);
    this.cursorStack = null;
  }

  private updateBin(): void {
    if (this.input.justPressed("menu") || this.input.justPressed("interact")) {
      this.mode = "play";
      this.audio.play("cancel");
      return;
    }
    if (!this.input.mouseFresh) return;

    const hit = this.menus.hit(this.input.mouseX, this.input.mouseY);
    if (!hit?.startsWith("bin:")) return;
    const index = Number(hit.split(":")[1]);
    const slot = this.inventory.slots[index];
    if (!slot) return;

    const def = itemDef(slot.id);
    if (def.kind === "tool" || def.sellPrice <= 0) {
      this.toast("Invendable", this.player.x, this.player.y - 16, "#e0655a");
      return;
    }
    this.bin.deposit(slot.id, slot.count);
    this.inventory.takeAt(index);
    this.audio.play("pickup");
  }

  private updateShop(): void {
    if (this.input.justPressed("menu") || this.input.justPressed("interact")) {
      this.mode = "play";
      this.audio.play("cancel");
      return;
    }

    const stock = shopStock(this.clock.season);
    const hit = this.menus.hit(this.input.mouseX, this.input.mouseY);

    if (this.input.mouseFresh && hit?.startsWith("buy:")) {
      const entry = stock[Number(hit.split(":")[1])];
      if (!entry) return;
      if (this.player.money < entry.price) {
        this.toast("Pas assez d'argent", this.player.x, this.player.y - 16, "#e0655a");
        this.audio.play("cancel");
        return;
      }
      if (!this.inventory.hasRoomFor(entry.id)) {
        this.toast("Sac plein", this.player.x, this.player.y - 16, "#e0655a");
        return;
      }
      this.player.money -= entry.price;
      this.inventory.add(entry.id, 1);
      this.audio.play("coin");
      return;
    }

    if ((this.input.mouseFresh || this.input.rightFresh) && hit?.startsWith("sell:")) {
      const index = Number(hit.split(":")[1]);
      const slot = this.inventory.slots[index];
      if (!slot) return;
      const def = itemDef(slot.id);
      if (def.kind === "tool" || def.sellPrice <= 0) {
        this.audio.play("cancel");
        return;
      }
      const amount = this.input.rightFresh ? slot.count : 1;
      const sold = this.inventory.remove(slot.id, amount);
      this.player.money += def.sellPrice * sold;
      this.audio.play("coin");
    }
  }

  private updateDialogue(): void {
    const advance =
      this.input.justPressed("confirm") ||
      this.input.justPressed("interact") ||
      this.input.mouseFresh;
    if (!advance) return;

    const thenShop = this.dialogue?.thenShop ?? false;
    this.dialogue = null;
    this.mode = thenShop ? "shop" : "play";
    this.audio.play("select");
  }

  private updateSleepScreen(): void {
    if (this.clicked("sleep:next") || this.input.justPressed("confirm")) this.confirmSleep();
  }

  private updatePause(): void {
    if (this.input.justPressed("menu")) {
      this.mode = "play";
      this.audio.play("cancel");
      return;
    }
    if (!this.input.mouseFresh) return;

    const hit = this.menus.hit(this.input.mouseX, this.input.mouseY);
    switch (hit) {
      case "pause:resume":
        this.mode = "play";
        this.audio.play("cancel");
        break;
      case "pause:save":
        this.save();
        this.audio.play("coin");
        break;
      case "pause:sound":
        this.audio.toggleMute();
        break;
      case "pause:quit":
        this.save();
        this.mode = "title";
        this.audio.play("cancel");
        break;
      default:
        break;
    }
  }

  // ----------------------------------------------------------- rendu

  render(): void {
    const width = this.cssWidth;
    const height = this.cssHeight;
    this.menus.begin();

    if (this.mode === "title") {
      this.menus.title(width, height, this.hasSave());
      return;
    }

    const held = this.inventory.held;
    const showTarget =
      this.mode === "play" && held !== null && itemDef(held.id).kind !== "produce";
    this.renderer.render(
      this.map,
      this.player,
      this.clock,
      npcsOnMap(this.currentMap),
      this.elapsed,
      showTarget ? this.player.facingTile() : null,
    );

    drawToasts(this.painter, this.toasts, (x, y) => this.renderer.worldToScreen(x, y));
    drawHud(this.painter, width, height, this.player, this.inventory, this.clock);

    switch (this.mode) {
      case "inventory":
        this.menus.inventoryScreen(width, height, this.inventory, this.cursorStack);
        break;
      case "bin":
        this.menus.shippingBin(width, height, this.inventory, this.bin.contents, this.bin.total());
        break;
      case "shop":
        this.menus.shop(width, height, this.inventory, shopStock(this.clock.season), this.player.money);
        break;
      case "dialogue":
        if (this.dialogue) this.menus.dialogue(width, height, this.dialogue.name, this.dialogue.text);
        break;
      case "sleep":
        if (this.sale) {
          this.menus.sleepSummary(
            width,
            height,
            this.clock.dateLabel(),
            this.sale.lines,
            this.sale.total,
            this.sale.exhausted,
          );
        }
        break;
      case "pause":
        this.menus.pause(width, height, this.audio.muted, this.justSaved);
        break;
      default:
        break;
    }
  }
}

export { ZOOM };
