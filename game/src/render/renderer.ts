import { clamp } from "../core/math";
import { TILE, Tile } from "../world/tiles";
import { OBJECTS } from "../world/objects";
import { CROP_BY_ID, isMature, stageOf } from "../world/crops";
import type { GameMap } from "../world/world";
import type { Player } from "../game/player";
import type { Clock } from "../game/time";
import type { Npc } from "../game/npc";
import { cropSprite } from "./icons";
import { makeCanvas, type Canvas, type Ctx, type SpriteAtlas } from "./sprites";

export const ZOOM = 3;

/** Hachage entier stable : choisit une variante de tuile sans motif visible. */
function tileVariant(x: number, y: number, count: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) % count;
}

interface Drawable {
  /** Ligne de base : sert au tri en profondeur (plus bas = dessiné devant). */
  baseline: number;
  draw: (ctx: Ctx) => void;
}

export class Renderer {
  private buffer: Canvas;
  private bctx: Ctx;
  cameraX = 0;
  cameraY = 0;
  viewWidth = 0;
  viewHeight = 0;
  private rainOffset = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly atlas: SpriteAtlas,
  ) {
    const made = makeCanvas(2, 2);
    this.buffer = made.canvas;
    this.bctx = made.ctx;
  }

  resize(cssWidth: number, cssHeight: number, dpr: number): void {
    this.canvas.width = Math.floor(cssWidth * dpr);
    this.canvas.height = Math.floor(cssHeight * dpr);
    this.viewWidth = Math.ceil(cssWidth / ZOOM);
    this.viewHeight = Math.ceil(cssHeight / ZOOM);
    this.buffer.width = this.viewWidth;
    this.buffer.height = this.viewHeight;
    this.bctx.imageSmoothingEnabled = false;
  }

  /** Convertit une position monde en position écran CSS (pour le HUD net). */
  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: (wx - this.cameraX) * ZOOM, y: (wy - this.cameraY) * ZOOM };
  }

  private updateCamera(map: GameMap, player: Player): void {
    const mapW = map.width * TILE;
    const mapH = map.height * TILE;
    const targetX = player.x - this.viewWidth / 2;
    const targetY = player.y - this.viewHeight / 2;

    // Une carte plus petite que la vue est centrée au lieu d'être collée à un bord.
    this.cameraX = mapW <= this.viewWidth ? (mapW - this.viewWidth) / 2 : clamp(targetX, 0, mapW - this.viewWidth);
    this.cameraY = mapH <= this.viewHeight ? (mapH - this.viewHeight) / 2 : clamp(targetY, 0, mapH - this.viewHeight);
    this.cameraX = Math.round(this.cameraX);
    this.cameraY = Math.round(this.cameraY);
  }

  private tileSprite(map: GameMap, x: number, y: number, waterFrame: number): Canvas {
    const t = map.tileAt(x, y);
    const { tiles } = this.atlas;
    switch (t) {
      case Tile.Grass:
        return tiles.grass[tileVariant(x, y, tiles.grass.length)];
      case Tile.Dirt:
        return tiles.dirt;
      case Tile.Tilled:
        return tiles.tilled;
      case Tile.TilledWet:
        return tiles.tilledWet;
      case Tile.Path:
        return tiles.path;
      case Tile.Road:
        return tiles.road;
      case Tile.Water:
        return tiles.water[waterFrame % tiles.water.length];
      case Tile.Sand:
        return tiles.sand;
      case Tile.Floor:
        return tiles.floor;
      case Tile.Rug:
        return tiles.rug;
      case Tile.Wall:
        return tiles.wall;
      case Tile.Flowers:
        return tiles.flowers[tileVariant(x, y, tiles.flowers.length)];
      case Tile.Cliff:
      default:
        return tiles.cliff;
    }
  }

  render(
    map: GameMap,
    player: Player,
    clock: Clock,
    npcs: readonly Npc[],
    elapsed: number,
    targetTile: { x: number; y: number } | null,
  ): void {
    this.updateCamera(map, player);
    const ctx = this.bctx;
    ctx.fillStyle = "#0d0b10";
    ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    const minX = Math.max(0, Math.floor(this.cameraX / TILE));
    const minY = Math.max(0, Math.floor(this.cameraY / TILE));
    const maxX = Math.min(map.width - 1, Math.ceil((this.cameraX + this.viewWidth) / TILE));
    const maxY = Math.min(map.height - 1, Math.ceil((this.cameraY + this.viewHeight) / TILE));
    const waterFrame = Math.floor(elapsed * 3);

    // --- sol
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        ctx.drawImage(
          this.tileSprite(map, x, y, waterFrame),
          x * TILE - this.cameraX,
          y * TILE - this.cameraY,
        );
      }
    }

    // --- tuile visée
    if (targetTile && map.inBounds(targetTile.x, targetTile.y)) {
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        targetTile.x * TILE - this.cameraX + 0.5,
        targetTile.y * TILE - this.cameraY + 0.5,
        TILE - 1,
        TILE - 1,
      );
    }

    // --- cultures (toujours sous les entités)
    for (const [key, instance] of map.crops) {
      const x = key % map.width;
      const y = Math.floor(key / map.width);
      if (x < minX || x > maxX || y < minY || y > maxY) continue;
      const crop = CROP_BY_ID.get(instance.cropId);
      if (!crop) continue;
      ctx.drawImage(
        cropSprite(crop.id, stageOf(crop, instance.growth), isMature(crop, instance.growth)),
        x * TILE - this.cameraX,
        y * TILE - this.cameraY,
      );
    }

    // --- entités triées en profondeur
    const drawables: Drawable[] = [];

    for (const decor of map.decor) {
      const sprite = this.atlas.buildings[decor.kind];
      const dx = decor.x * TILE - this.cameraX;
      const dy = (decor.y + decor.h) * TILE - sprite.height - this.cameraY;
      if (dx > this.viewWidth || dx + sprite.width < 0) continue;
      drawables.push({
        baseline: (decor.y + decor.h) * TILE,
        draw: (c) => c.drawImage(sprite, dx, dy),
      });
    }

    for (const [key, obj] of map.objects) {
      const x = key % map.width;
      const y = Math.floor(key / map.width);
      const def = OBJECTS[obj.kind];
      if (x < minX - 1 || x > maxX + 1 || y < minY - def.tallness || y > maxY + 1) continue;

      const sprite = this.objectSprite(obj.kind, obj.variant);
      const dx = x * TILE - this.cameraX - (sprite.width - TILE) / 2;
      const dy = (y + 1) * TILE - sprite.height - this.cameraY;
      drawables.push({ baseline: (y + 1) * TILE, draw: (c) => c.drawImage(sprite, dx, dy) });
    }

    for (const npc of npcs) {
      const set = this.atlas.villager[npc.facing];
      const sprite = set.walk[0];
      const dx = npc.tileX * TILE - this.cameraX - 0;
      const dy = (npc.tileY + 1) * TILE - sprite.height - this.cameraY + 2;
      drawables.push({ baseline: (npc.tileY + 1) * TILE, draw: (c) => c.drawImage(sprite, dx, dy) });
    }

    const set = this.atlas.player[player.facing];
    const playerSprite = player.acting ? set.act : set.walk[player.animFrame()];
    const pdx = Math.round(player.x - 8 - this.cameraX);
    const pdy = Math.round(player.y - 22 - this.cameraY);
    drawables.push({ baseline: player.y, draw: (c) => c.drawImage(playerSprite, pdx, pdy) });

    drawables.sort((a, b) => a.baseline - b.baseline);
    for (const d of drawables) d.draw(ctx);

    // --- météo et lumière
    if (clock.raining && !map.indoors) this.drawRain(ctx, elapsed);
    const dark = clock.darkness();
    if (dark > 0.001) {
      ctx.fillStyle = `rgba(24, 26, 68, ${dark})`;
      ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);
    }
    if (map.indoors) {
      ctx.fillStyle = "rgba(60, 40, 20, 0.10)";
      ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);
    }

    // --- mise à l'échelle finale, sans lissage : le pixel art reste net
    const out = this.canvas.getContext("2d");
    if (!out) return;
    out.imageSmoothingEnabled = false;
    out.clearRect(0, 0, this.canvas.width, this.canvas.height);
    out.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);
  }

  private objectSprite(kind: keyof SpriteAtlas["objects"], variant: number): Canvas {
    const entry = this.atlas.objects[kind];
    return Array.isArray(entry) ? entry[variant % entry.length] : entry;
  }

  private drawRain(ctx: Ctx, elapsed: number): void {
    this.rainOffset = (elapsed * 220) % 40;
    ctx.strokeStyle = "rgba(180, 205, 235, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 90; i++) {
      const x = ((i * 53) % (this.viewWidth + 40)) - 20 + this.rainOffset * 0.4;
      const y = ((i * 97 + this.rainOffset * 6) % (this.viewHeight + 40)) - 20;
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + 7);
    }
    ctx.stroke();
  }
}
