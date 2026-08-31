import { clamp } from "../core/math";
import { TILE } from "../world/tiles";
import type { GameMap } from "../world/world";
import type { Facing } from "../render/sprites";

const SPEED = 68;
const EXHAUSTED_SPEED = 40;
const ACT_DURATION = 0.36;
/** Boîte de collision aux pieds : le buste peut chevaucher les décors du dessus. */
const BODY_W = 10;
const BODY_H = 8;

export class Player {
  x = 0;
  y = 0;
  facing: Facing = "down";
  energy = 100;
  maxEnergy = 100;
  money = 500;
  water = 40;
  waterMax = 40;
  /** Temps restant de l'animation d'utilisation d'outil. */
  actTimer = 0;
  private animTime = 0;
  private moving = false;

  get exhausted(): boolean {
    return this.energy <= 0;
  }

  get tileX(): number {
    return Math.floor(this.x / TILE);
  }

  get tileY(): number {
    return Math.floor(this.y / TILE);
  }

  setTilePosition(tx: number, ty: number): void {
    this.x = tx * TILE + TILE / 2;
    this.y = ty * TILE + TILE - 2;
  }

  /** Tuile visée par les outils : celle juste devant le personnage. */
  facingTile(): { x: number; y: number } {
    const dx = this.facing === "left" ? -1 : this.facing === "right" ? 1 : 0;
    const dy = this.facing === "up" ? -1 : this.facing === "down" ? 1 : 0;
    return { x: this.tileX + dx, y: this.tileY + dy };
  }

  beginAct(facing?: Facing): void {
    if (facing) this.facing = facing;
    this.actTimer = ACT_DURATION;
  }

  get acting(): boolean {
    return this.actTimer > 0;
  }

  update(dt: number, dirX: number, dirY: number, map: GameMap): void {
    if (this.actTimer > 0) {
      this.actTimer = Math.max(0, this.actTimer - dt);
      this.moving = false;
      return;
    }

    const length = Math.hypot(dirX, dirY);
    this.moving = length > 0;
    if (!this.moving) {
      this.animTime = 0;
      return;
    }

    const nx = dirX / length;
    const ny = dirY / length;
    // La direction horizontale prime : elle correspond au sprite le plus lisible.
    if (Math.abs(nx) > Math.abs(ny)) this.facing = nx < 0 ? "left" : "right";
    else this.facing = ny < 0 ? "up" : "down";

    const speed = this.exhausted ? EXHAUSTED_SPEED : SPEED;
    this.animTime += dt;
    this.moveAxis(nx * speed * dt, 0, map);
    this.moveAxis(0, ny * speed * dt, map);
  }

  /** Déplacement séparé par axe : le joueur glisse le long des murs au lieu de rester bloqué. */
  private moveAxis(dx: number, dy: number, map: GameMap): void {
    if (dx === 0 && dy === 0) return;
    const nextX = this.x + dx;
    const nextY = this.y + dy;
    const left = nextX - BODY_W / 2;
    const right = nextX + BODY_W / 2 - 0.01;
    const top = nextY - BODY_H;
    const bottom = nextY - 0.01;

    for (const [cx, cy] of [
      [left, top],
      [right, top],
      [left, bottom],
      [right, bottom],
    ]) {
      if (map.blocked(Math.floor(cx / TILE), Math.floor(cy / TILE))) return;
    }

    this.x = clamp(nextX, BODY_W / 2, map.width * TILE - BODY_W / 2);
    this.y = clamp(nextY, BODY_H, map.height * TILE);
  }

  /** Indice de la frame de marche (cycle à 4 temps). */
  animFrame(): number {
    if (!this.moving) return 0;
    return Math.floor(this.animTime * 8) % 4;
  }

  spendEnergy(amount: number): void {
    this.energy = Math.max(0, this.energy - amount);
  }

  restoreEnergy(amount: number): void {
    this.energy = clamp(this.energy + amount, 0, this.maxEnergy);
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      facing: this.facing,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      money: this.money,
      water: this.water,
    };
  }

  load(data: ReturnType<Player["serialize"]>): void {
    this.x = data.x;
    this.y = data.y;
    this.facing = data.facing;
    this.energy = data.energy;
    this.maxEnergy = data.maxEnergy;
    this.money = data.money;
    this.water = data.water;
  }
}
