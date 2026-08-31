import { Tile, isSolid } from "./tiles";
import { OBJECTS, type WorldObject } from "./objects";

export type MapId = "farm" | "village" | "house" | "shop";

export interface CropInstance {
  cropId: string;
  /** Jours de croissance accumulés (n'avance que si la plante a été arrosée). */
  growth: number;
  watered: boolean;
}

export type DecorKind = "farmhouse" | "store" | "cottage";

export interface Decor {
  kind: DecorKind;
  /** Coin haut-gauche, en tuiles. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Warp {
  x: number;
  y: number;
  w: number;
  h: number;
  to: MapId;
  tx: number;
  ty: number;
}

export interface SerializedMap {
  tiles: number[];
  objects: [number, WorldObject][];
  crops: [number, CropInstance][];
}

export class GameMap {
  readonly tiles: Uint8Array;
  readonly objects = new Map<number, WorldObject>();
  readonly crops = new Map<number, CropInstance>();
  readonly warps: Warp[] = [];
  readonly decor: Decor[] = [];

  constructor(
    readonly id: MapId,
    readonly name: string,
    readonly width: number,
    readonly height: number,
    readonly indoors: boolean,
    fill: Tile,
  ) {
    this.tiles = new Uint8Array(width * height).fill(fill);
  }

  key(x: number, y: number): number {
    return y * this.width + x;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  tileAt(x: number, y: number): Tile {
    if (!this.inBounds(x, y)) return Tile.Cliff;
    return this.tiles[this.key(x, y)] as Tile;
  }

  setTile(x: number, y: number, tile: Tile): void {
    if (this.inBounds(x, y)) this.tiles[this.key(x, y)] = tile;
  }

  fillRect(x: number, y: number, w: number, h: number, tile: Tile): void {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) this.setTile(i, j, tile);
    }
  }

  objectAt(x: number, y: number): WorldObject | undefined {
    return this.objects.get(this.key(x, y));
  }

  addObject(x: number, y: number, obj: WorldObject): void {
    if (this.inBounds(x, y)) this.objects.set(this.key(x, y), obj);
  }

  removeObject(x: number, y: number): void {
    this.objects.delete(this.key(x, y));
  }

  cropAt(x: number, y: number): CropInstance | undefined {
    return this.crops.get(this.key(x, y));
  }

  /** Une tuile est bloquée par son type ou par un objet solide posé dessus. */
  blocked(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return true;
    if (isSolid(this.tileAt(x, y))) return true;
    const obj = this.objectAt(x, y);
    return obj !== undefined && OBJECTS[obj.kind].solid;
  }

  warpAt(x: number, y: number): Warp | undefined {
    return this.warps.find(
      (w) => x >= w.x && x < w.x + w.w && y >= w.y && y < w.y + w.h,
    );
  }

  serialize(): SerializedMap {
    return {
      tiles: Array.from(this.tiles),
      objects: [...this.objects.entries()],
      crops: [...this.crops.entries()],
    };
  }

  load(data: SerializedMap): void {
    this.tiles.set(data.tiles.slice(0, this.tiles.length));
    this.objects.clear();
    for (const [k, v] of data.objects) this.objects.set(k, v);
    this.crops.clear();
    for (const [k, v] of data.crops) this.crops.set(k, v);
  }
}
