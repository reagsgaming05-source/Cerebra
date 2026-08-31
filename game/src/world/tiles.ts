export const TILE = 16;

export const enum Tile {
  Grass = 0,
  Dirt = 1,
  Tilled = 2,
  TilledWet = 3,
  Path = 4,
  Water = 5,
  Sand = 6,
  Floor = 7,
  Rug = 8,
  Wall = 9,
  Road = 10,
  Cliff = 11,
  Flowers = 12,
}

interface TileDef {
  /** Bloque le déplacement du joueur. */
  solid: boolean;
  /** Peut être labouré à la houe. */
  tillable: boolean;
  /** Permet de remplir l'arrosoir en se tenant à côté. */
  waterSource: boolean;
}

const DEF: Record<Tile, TileDef> = {
  [Tile.Grass]: { solid: false, tillable: true, waterSource: false },
  [Tile.Dirt]: { solid: false, tillable: true, waterSource: false },
  [Tile.Tilled]: { solid: false, tillable: false, waterSource: false },
  [Tile.TilledWet]: { solid: false, tillable: false, waterSource: false },
  [Tile.Path]: { solid: false, tillable: false, waterSource: false },
  [Tile.Water]: { solid: true, tillable: false, waterSource: true },
  [Tile.Sand]: { solid: false, tillable: true, waterSource: false },
  [Tile.Floor]: { solid: false, tillable: false, waterSource: false },
  [Tile.Rug]: { solid: false, tillable: false, waterSource: false },
  [Tile.Wall]: { solid: true, tillable: false, waterSource: false },
  [Tile.Road]: { solid: false, tillable: false, waterSource: false },
  [Tile.Cliff]: { solid: true, tillable: false, waterSource: false },
  [Tile.Flowers]: { solid: false, tillable: true, waterSource: false },
};

export const isSolid = (t: Tile): boolean => DEF[t].solid;
export const isTillable = (t: Tile): boolean => DEF[t].tillable;
export const isWaterSource = (t: Tile): boolean => DEF[t].waterSource;
