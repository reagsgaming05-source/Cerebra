import { Rng } from "../core/rng";
import { Tile } from "./tiles";
import { OBJECTS, type ObjectKind } from "./objects";
import { GameMap, type DecorKind, type MapId } from "./world";

export const FARM_HOUSE_DOOR = { x: 8, y: 8 };
const STORE_DOOR = { x: 18, y: 12 };

/** Pose un bâtiment plein (murs solides) avec une porte franchissable. */
function building(
  map: GameMap,
  x: number,
  y: number,
  w: number,
  h: number,
  doorX: number,
  kind: DecorKind = "cottage",
): void {
  map.fillRect(x, y, w, h, Tile.Wall);
  map.setTile(doorX, y + h - 1, Tile.Path);
  map.decor.push({ kind, x, y, w, h });
}

function scatter(
  map: GameMap,
  rng: Rng,
  kind: ObjectKind,
  count: number,
  allowed: (x: number, y: number) => boolean,
): void {
  const def = OBJECTS[kind];
  let placed = 0;
  let guard = count * 40;
  while (placed < count && guard-- > 0) {
    const x = rng.int(1, map.width - 2);
    const y = rng.int(1, map.height - 2);
    if (map.blocked(x, y) || map.objectAt(x, y) || !allowed(x, y)) continue;
    map.addObject(x, y, { kind, hp: def.hp, variant: rng.int(0, 2) });
    placed++;
  }
}

function createFarm(rng: Rng): GameMap {
  const map = new GameMap("farm", "Ferme du Val", 52, 42, false, Tile.Grass);

  // Falaises sur trois côtés ; la sortie vers le village est à droite.
  map.fillRect(0, 0, map.width, 1, Tile.Cliff);
  map.fillRect(0, map.height - 1, map.width, 1, Tile.Cliff);
  map.fillRect(0, 0, 1, map.height, Tile.Cliff);
  map.fillRect(map.width - 1, 0, 1, map.height, Tile.Cliff);

  // Mare : source d'eau pour l'arrosoir.
  map.fillRect(4, 28, 11, 8, Tile.Sand);
  map.fillRect(5, 29, 9, 6, Tile.Water);
  map.fillRect(6, 30, 7, 4, Tile.Water);

  // Maison de la ferme et ses abords.
  building(map, 5, 4, 8, 5, FARM_HOUSE_DOOR.x, "farmhouse");
  map.fillRect(FARM_HOUSE_DOOR.x, 9, 1, 4, Tile.Path);
  map.fillRect(FARM_HOUSE_DOOR.x, 12, 14, 1, Tile.Path);
  map.warps.push({
    x: FARM_HOUSE_DOOR.x,
    y: FARM_HOUSE_DOOR.y,
    w: 1,
    h: 1,
    to: "house",
    tx: 7,
    ty: 8,
  });

  // Caisse d'expédition, à droite du perron.
  map.addObject(11, 10, { kind: "bin", hp: 0, variant: 0 });
  map.addObject(6, 10, { kind: "sign", hp: 0, variant: 0 });

  // Route vers le village.
  map.fillRect(21, 12, 1, 9, Tile.Path);
  map.fillRect(21, 20, map.width - 22, 2, Tile.Road);
  map.warps.push({ x: map.width - 2, y: 20, w: 1, h: 2, to: "village", tx: 2, ty: 15 });

  const isOpenGround = (x: number, y: number): boolean => {
    const t = map.tileAt(x, y);
    return t === Tile.Grass || t === Tile.Dirt;
  };
  // Zone cultivable dégagée devant la maison : le joueur peut planter dès le jour 1.
  const isPlot = (x: number, y: number): boolean =>
    x >= 14 && x <= 26 && y >= 4 && y <= 11;

  scatter(map, rng, "tree", 46, (x, y) => isOpenGround(x, y) && !isPlot(x, y));
  scatter(map, rng, "boulder", 6, (x, y) => isOpenGround(x, y) && !isPlot(x, y));
  scatter(map, rng, "rock", 30, (x, y) => isOpenGround(x, y) && !isPlot(x, y));
  scatter(map, rng, "branch", 22, isOpenGround);
  scatter(map, rng, "weed", 60, isOpenGround);
  scatter(map, rng, "bush", 7, (x, y) => isOpenGround(x, y) && !isPlot(x, y));

  return map;
}

function createVillage(rng: Rng): GameMap {
  const map = new GameMap("village", "Val d'Ambre", 44, 32, false, Tile.Grass);

  map.fillRect(0, 0, map.width, 1, Tile.Cliff);
  map.fillRect(0, map.height - 1, map.width, 1, Tile.Cliff);
  map.fillRect(0, 0, 1, map.height, Tile.Cliff);
  map.fillRect(map.width - 1, 0, 1, map.height, Tile.Cliff);

  // Grand-route est-ouest et place centrale pavée.
  map.fillRect(1, 15, map.width - 2, 2, Tile.Road);
  map.fillRect(16, 14, 12, 6, Tile.Path);
  map.warps.push({ x: 1, y: 15, w: 1, h: 2, to: "farm", tx: 49, ty: 20 });

  // Magasin général.
  building(map, 14, 7, 9, 6, STORE_DOOR.x, "store");
  map.fillRect(STORE_DOOR.x, 13, 1, 2, Tile.Path);
  map.warps.push({ x: STORE_DOOR.x, y: STORE_DOOR.y, w: 1, h: 1, to: "shop", tx: 8, ty: 9 });
  map.addObject(16, 13, { kind: "sign", hp: 0, variant: 1 });

  // Maisons de villageois (décor solide).
  building(map, 4, 6, 7, 5, 7);
  building(map, 28, 6, 7, 5, 31);
  building(map, 8, 21, 7, 5, 11);
  building(map, 30, 21, 7, 5, 33);

  const isDecorGround = (x: number, y: number): boolean => map.tileAt(x, y) === Tile.Grass;
  scatter(map, rng, "tree", 34, isDecorGround);
  scatter(map, rng, "bush", 10, isDecorGround);
  scatter(map, rng, "weed", 26, isDecorGround);

  for (let i = 0; i < 40; i++) {
    const x = rng.int(2, map.width - 3);
    const y = rng.int(2, map.height - 3);
    if (map.tileAt(x, y) === Tile.Grass && !map.objectAt(x, y)) map.setTile(x, y, Tile.Flowers);
  }

  return map;
}

function createHouse(): GameMap {
  const map = new GameMap("house", "Maison", 15, 10, true, Tile.Floor);

  map.fillRect(0, 0, map.width, 2, Tile.Wall);
  map.fillRect(0, map.height - 1, map.width, 1, Tile.Wall);
  map.fillRect(0, 0, 1, map.height, Tile.Wall);
  map.fillRect(map.width - 1, 0, 1, map.height, Tile.Wall);
  map.fillRect(5, 4, 5, 4, Tile.Rug);

  map.addObject(2, 3, { kind: "bed", hp: 0, variant: 0 });

  // Porte de sortie, alignée sur le perron de la ferme.
  map.setTile(7, map.height - 1, Tile.Floor);
  map.warps.push({
    x: 7,
    y: map.height - 1,
    w: 1,
    h: 1,
    to: "farm",
    tx: FARM_HOUSE_DOOR.x,
    ty: FARM_HOUSE_DOOR.y + 1,
  });

  return map;
}

function createShop(): GameMap {
  const map = new GameMap("shop", "Magasin général", 17, 12, true, Tile.Floor);

  map.fillRect(0, 0, map.width, 2, Tile.Wall);
  map.fillRect(0, map.height - 1, map.width, 1, Tile.Wall);
  map.fillRect(0, 0, 1, map.height, Tile.Wall);
  map.fillRect(map.width - 1, 0, 1, map.height, Tile.Wall);
  map.fillRect(2, 2, 13, 3, Tile.Rug);

  for (let x = 4; x <= 12; x++) map.addObject(x, 5, { kind: "counter", hp: 0, variant: 0 });

  map.setTile(8, map.height - 1, Tile.Floor);
  map.warps.push({
    x: 8,
    y: map.height - 1,
    w: 1,
    h: 1,
    to: "village",
    tx: STORE_DOOR.x,
    ty: STORE_DOOR.y + 1,
  });

  return map;
}

export type WorldMaps = Record<MapId, GameMap>;

export function createWorld(seed: number): WorldMaps {
  const rng = new Rng(seed);
  return {
    farm: createFarm(rng),
    village: createVillage(rng),
    house: createHouse(),
    shop: createShop(),
  };
}
