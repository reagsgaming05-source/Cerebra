import { TILE } from "../world/tiles";

export type Canvas = HTMLCanvasElement;
export type Ctx = CanvasRenderingContext2D;

export function makeCanvas(w: number, h: number): { canvas: Canvas; ctx: Ctx } {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Contexte 2D indisponible");
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

/** Rectangle plein aux coordonnées entières : la brique de base du pixel art. */
export function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function sprite(w: number, h: number, draw: (ctx: Ctx) => void): Canvas {
  const { canvas, ctx } = makeCanvas(w, h);
  draw(ctx);
  return canvas;
}

/** Bruit déterministe pour texturer les tuiles sans stocker de motif. */
function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export const PALETTE = {
  grass: ["#5f9440", "#639846", "#5b8f3c", "#61963f"],
  grassDetail: "#7cb650",
  dirt: ["#8a6a44", "#7c5e3c"],
  tilled: ["#6d4f30", "#5d4228"],
  tilledWet: ["#4a3320", "#3d2a1a"],
  path: ["#a8916d", "#94805f"],
  road: ["#9a8f7d", "#877d6d"],
  sand: ["#d8c48d", "#c6b27c"],
  water: ["#3f7fb5", "#4e91c8", "#2f6a9c"],
  floor: ["#b98d5c", "#a87d4f"],
  rug: ["#8d4a52", "#7a3f46"],
  wall: ["#5d4636", "#4a382b"],
  cliff: ["#6b6357", "#575046"],
  flowerColors: ["#e8d24a", "#e07b9a", "#d8e0f0", "#c86ad8"],
  skin: "#e8b795",
  skinShade: "#c99270",
  hair: "#6b4226",
  hairLight: "#8a5a33",
  shirt: "#4a7fb5",
  shirtShade: "#35608f",
  pants: "#3d4a63",
  shoes: "#40301f",
  ink: "#2a2118",
  wood: "#8a5a2b",
  woodDark: "#6b4420",
  leaf: ["#3f7a35", "#4e8f3f", "#356b2c"],
  stone: "#8d8f99",
  stoneDark: "#6d6f78",
} as const;

// ---------------------------------------------------------------- tuiles

function tileSprite(draw: (ctx: Ctx) => void): Canvas {
  return sprite(TILE, TILE, draw);
}

function speckled(ctx: Ctx, base: string, speck: string, seed: number, density = 0.16): void {
  px(ctx, 0, 0, TILE, TILE, base);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      if (hash(x + seed * 31, y + seed * 17) < density) px(ctx, x, y, 1, 1, speck);
    }
  }
}

export interface TileSprites {
  grass: Canvas[];
  dirt: Canvas;
  tilled: Canvas;
  tilledWet: Canvas;
  path: Canvas;
  road: Canvas;
  sand: Canvas;
  water: Canvas[];
  floor: Canvas;
  rug: Canvas;
  wall: Canvas;
  cliff: Canvas;
  flowers: Canvas[];
}

function buildTiles(): TileSprites {
  // Huit variantes très proches : assez pour casser la répétition sans créer de damier.
  const grass = [0, 1, 2, 3, 4, 5, 6, 7].map((v) =>
    tileSprite((ctx) => {
      speckled(ctx, PALETTE.grass[0], PALETTE.grass[2], v + 1, 0.1);
      for (let i = 0; i < 4; i++) {
        const x = Math.floor(hash(i * 3 + v * 7, i + v) * (TILE - 2)) + 1;
        const y = Math.floor(hash(i + v, i * 5 + v * 11) * (TILE - 3)) + 1;
        px(ctx, x, y, 1, 2, PALETTE.grassDetail);
      }
    }),
  );

  const dirt = tileSprite((ctx) => speckled(ctx, PALETTE.dirt[0], PALETTE.dirt[1], 4, 0.2));

  const tilledSprite = (base: string, dark: string): Canvas =>
    tileSprite((ctx) => {
      px(ctx, 0, 0, TILE, TILE, base);
      for (let y = 1; y < TILE; y += 4) px(ctx, 0, y, TILE, 2, dark);
      for (let y = 0; y < TILE; y += 4) px(ctx, 0, y, TILE, 1, base);
    });

  // Pas de liseré en bord de tuile : il créerait des rayures sur les grandes surfaces.
  const path = tileSprite((ctx) => speckled(ctx, PALETTE.path[0], PALETTE.path[1], 9, 0.22));

  const road = tileSprite((ctx) => {
    speckled(ctx, PALETTE.road[0], PALETTE.road[1], 12, 0.18);
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(hash(i * 5, i * 13) * 12) + 2;
      const y = Math.floor(hash(i * 7, i * 3) * 12) + 2;
      px(ctx, x, y, 2, 2, PALETTE.stoneDark);
    }
  });

  const sand = tileSprite((ctx) => speckled(ctx, PALETTE.sand[0], PALETTE.sand[1], 6, 0.15));

  const water = [0, 1, 2].map((frame) =>
    tileSprite((ctx) => {
      px(ctx, 0, 0, TILE, TILE, PALETTE.water[0]);
      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const wave = Math.sin((x + frame * 2) * 0.6 + y * 0.9) + Math.cos(y * 0.7 - frame);
          if (wave > 1.35) px(ctx, x, y, 1, 1, PALETTE.water[1]);
          else if (wave < -1.35) px(ctx, x, y, 1, 1, PALETTE.water[2]);
        }
      }
    }),
  );

  const floor = tileSprite((ctx) => {
    px(ctx, 0, 0, TILE, TILE, PALETTE.floor[0]);
    px(ctx, 0, TILE - 2, TILE, 2, PALETTE.floor[1]);
    px(ctx, 0, 6, TILE, 1, PALETTE.floor[1]);
  });

  const rug = tileSprite((ctx) => {
    px(ctx, 0, 0, TILE, TILE, PALETTE.rug[0]);
    px(ctx, 0, 0, TILE, 1, PALETTE.rug[1]);
    px(ctx, 0, 0, 1, TILE, PALETTE.rug[1]);
  });

  const wall = tileSprite((ctx) => speckled(ctx, PALETTE.wall[0], PALETTE.wall[1], 3, 0.2));

  const cliff = tileSprite((ctx) => {
    speckled(ctx, PALETTE.cliff[0], PALETTE.cliff[1], 8, 0.25);
    px(ctx, 0, 0, TILE, 2, PALETTE.cliff[1]);
  });

  const flowers = PALETTE.flowerColors.map((color, i) =>
    tileSprite((ctx) => {
      ctx.drawImage(grass[i % grass.length], 0, 0);
      for (let f = 0; f < 3; f++) {
        const x = 2 + Math.floor(hash(f * 9 + i, f) * 11);
        const y = 3 + Math.floor(hash(f, f * 4 + i) * 10);
        px(ctx, x, y, 2, 2, color);
        px(ctx, x, y + 2, 1, 2, PALETTE.grass[2]);
      }
    }),
  );

  return { grass, dirt, tilled: tilledSprite(PALETTE.tilled[0], PALETTE.tilled[1]), tilledWet: tilledSprite(PALETTE.tilledWet[0], PALETTE.tilledWet[1]), path, road, sand, water, floor, rug, wall, cliff, flowers };
}

// ---------------------------------------------------------------- personnage

export type Facing = "down" | "up" | "left" | "right";
export const FACINGS: readonly Facing[] = ["down", "up", "left", "right"];

const CHAR_W = 16;
const CHAR_H = 24;

interface CharColors {
  hair: string;
  hairLight: string;
  shirt: string;
  shirtShade: string;
  pants: string;
}

/**
 * Personnage dessiné par blocs plutôt que stocké en atlas :
 * la même fonction sert au héros et aux villageois via `colors`.
 */
function drawCharacter(ctx: Ctx, facing: Facing, frame: number, colors: CharColors, acting: boolean): void {
  const { ink, skin, skinShade, shoes } = PALETTE;
  // frame 0 et 2 = pose neutre, 1 et 3 = jambes écartées en alternance.
  const step = frame % 2 === 1 ? (frame === 1 ? 1 : -1) : 0;
  const bob = frame % 2 === 1 ? 1 : 0;
  const top = 2 + bob;

  // Tête
  px(ctx, 4, top, 8, 8, skin);
  px(ctx, 4, top + 7, 8, 1, skinShade);
  // Cheveux
  px(ctx, 3, top - 1, 10, 3, colors.hair);
  px(ctx, 3, top - 1, 10, 1, colors.hairLight);
  if (facing !== "up") {
    px(ctx, 3, top + 1, 1, 4, colors.hair);
    px(ctx, 12, top + 1, 1, 4, colors.hair);
  } else {
    px(ctx, 3, top + 1, 10, 5, colors.hair);
  }
  // Visage
  if (facing === "down") {
    px(ctx, 6, top + 4, 1, 2, ink);
    px(ctx, 9, top + 4, 1, 2, ink);
  } else if (facing === "left") {
    px(ctx, 5, top + 4, 1, 2, ink);
  } else if (facing === "right") {
    px(ctx, 10, top + 4, 1, 2, ink);
  }

  // Torse
  const bodyY = top + 8;
  px(ctx, 4, bodyY, 8, 7, colors.shirt);
  px(ctx, 4, bodyY + 5, 8, 2, colors.shirtShade);

  // Bras : levés pendant l'utilisation d'un outil.
  if (acting) {
    px(ctx, 2, bodyY - 3, 2, 6, skin);
    px(ctx, 12, bodyY - 3, 2, 6, skin);
  } else {
    px(ctx, 2, bodyY + 1 - step, 2, 5, skin);
    px(ctx, 12, bodyY + 1 + step, 2, 5, skin);
  }

  // Jambes
  const legY = bodyY + 7;
  px(ctx, 5, legY - step, 3, 4, colors.pants);
  px(ctx, 8, legY + step, 3, 4, colors.pants);
  px(ctx, 5, legY + 4 - step, 3, 2, shoes);
  px(ctx, 8, legY + 4 + step, 3, 2, shoes);
}

export type CharacterSet = Record<Facing, { walk: Canvas[]; act: Canvas }>;

function buildCharacter(colors: CharColors): CharacterSet {
  const set = {} as CharacterSet;
  for (const facing of FACINGS) {
    set[facing] = {
      walk: [0, 1, 2, 3].map((frame) =>
        sprite(CHAR_W, CHAR_H, (ctx) => drawCharacter(ctx, facing, frame, colors, false)),
      ),
      act: sprite(CHAR_W, CHAR_H, (ctx) => drawCharacter(ctx, facing, 0, colors, true)),
    };
  }
  return set;
}

// ---------------------------------------------------------------- objets

/** Profil de largeur du houppier, ligne par ligne : donne une silhouette arrondie. */
const CANOPY_PROFILE = [8, 14, 18, 22, 24, 26, 26, 26, 24, 22, 18, 12];
const TREE_W = 32;

function drawTree(ctx: Ctx, variant: number): void {
  const leaf = PALETTE.leaf[variant % PALETTE.leaf.length];
  const leafLight = PALETTE.leaf[1];
  const leafDark = PALETTE.leaf[2];

  const cx = TREE_W / 2;
  px(ctx, cx - 2, 30, 4, 18, PALETTE.woodDark);
  px(ctx, cx - 2, 30, 2, 18, PALETTE.wood);

  CANOPY_PROFILE.forEach((w, i) => {
    const y = 8 + i * 2;
    const color = i < 3 ? leafLight : i > 8 ? leafDark : leaf;
    px(ctx, cx - w / 2, y, w, 2, color);
  });
  // Quelques touches de lumière fixes : le feuillage ne paraît pas plat.
  px(ctx, cx - 7 + (variant % 3), 14, 4, 4, leafLight);
  px(ctx, cx + 2, 24, 3, 3, leafLight);
  px(ctx, cx - 4, 30, 8, 2, leafDark);
}

export interface ObjectSprites {
  tree: Canvas[];
  stump: Canvas;
  rock: Canvas[];
  boulder: Canvas;
  weed: Canvas[];
  branch: Canvas;
  bush: Canvas[];
  bin: Canvas;
  bed: Canvas;
  counter: Canvas;
  sign: Canvas;
}

function buildObjects(): ObjectSprites {
  const tree = [0, 1, 2].map((v) => sprite(TREE_W, 48, (ctx) => drawTree(ctx, v)));

  const stump = sprite(16, 16, (ctx) => {
    px(ctx, 3, 8, 10, 7, PALETTE.woodDark);
    px(ctx, 3, 6, 10, 4, PALETTE.wood);
    px(ctx, 5, 7, 6, 2, "#a2703a");
  });

  const rock = [0, 1, 2].map((v) =>
    sprite(16, 16, (ctx) => {
      const w = 9 + (v % 2);
      px(ctx, 4, 7, w, 7, PALETTE.stoneDark);
      px(ctx, 4, 5, w, 4, PALETTE.stone);
      px(ctx, 6, 6, 3, 2, "#b0b2ba");
    }),
  );

  const boulder = sprite(16, 32, (ctx) => {
    px(ctx, 1, 14, 14, 16, PALETTE.stoneDark);
    px(ctx, 2, 8, 12, 10, PALETTE.stone);
    px(ctx, 4, 10, 4, 3, "#b0b2ba");
    px(ctx, 9, 20, 4, 4, "#787a84");
  });

  const weed = [0, 1, 2].map((v) =>
    sprite(16, 16, (ctx) => {
      const color = PALETTE.leaf[v % 3];
      px(ctx, 7, 8, 2, 7, color);
      px(ctx, 4, 10, 3, 2, color);
      px(ctx, 9, 9, 3, 2, color);
      px(ctx, 6, 6, 2, 3, PALETTE.grassDetail);
    }),
  );

  const branch = sprite(16, 16, (ctx) => {
    px(ctx, 3, 11, 10, 2, PALETTE.wood);
    px(ctx, 6, 9, 2, 2, PALETTE.woodDark);
    px(ctx, 10, 13, 3, 2, PALETTE.woodDark);
  });

  const bush = [0, 1].map((v) =>
    sprite(16, 32, (ctx) => {
      px(ctx, 2, 18, 12, 12, PALETTE.leaf[2]);
      px(ctx, 3, 14, 10, 10, PALETTE.leaf[v % 2]);
      for (let i = 0; i < 4; i++) {
        px(ctx, 4 + i * 3, 18 + ((i * 5) % 7), 2, 2, "#8f3f63");
      }
    }),
  );

  const bin = sprite(16, 32, (ctx) => {
    px(ctx, 2, 14, 12, 16, PALETTE.woodDark);
    px(ctx, 3, 15, 10, 14, PALETTE.wood);
    px(ctx, 2, 12, 12, 4, "#a2703a");
    px(ctx, 4, 13, 8, 2, "#4a3520");
    px(ctx, 3, 22, 10, 1, PALETTE.woodDark);
  });

  const bed = sprite(32, 32, (ctx) => {
    px(ctx, 1, 6, 30, 25, PALETTE.woodDark);
    px(ctx, 2, 8, 28, 22, "#c7d3e8");
    px(ctx, 2, 8, 28, 8, "#f2f0e4");
    px(ctx, 4, 10, 10, 5, "#ffffff");
    px(ctx, 2, 20, 28, 10, "#8f5a72");
    px(ctx, 1, 4, 30, 3, PALETTE.wood);
  });

  const counter = sprite(16, 24, (ctx) => {
    px(ctx, 0, 8, 16, 16, PALETTE.woodDark);
    px(ctx, 0, 6, 16, 4, PALETTE.wood);
    px(ctx, 1, 12, 14, 1, "#a2703a");
  });

  const sign = sprite(16, 24, (ctx) => {
    px(ctx, 7, 14, 2, 10, PALETTE.woodDark);
    px(ctx, 2, 6, 12, 9, PALETTE.wood);
    px(ctx, 3, 7, 10, 7, "#c39a5c");
    px(ctx, 5, 9, 6, 1, PALETTE.woodDark);
    px(ctx, 5, 11, 4, 1, PALETTE.woodDark);
  });

  return { tree, stump, rock, boulder, weed, branch, bush, bin, bed, counter, sign };
}

// ---------------------------------------------------------------- bâtiments

export interface BuildingSprites {
  farmhouse: Canvas;
  store: Canvas;
  cottage: Canvas;
}

function drawHouse(ctx: Ctx, w: number, h: number, wallColor: string, roofColor: string, doorX: number): void {
  const roofH = Math.floor(h * 0.45);
  px(ctx, 0, roofH, w, h - roofH, wallColor);
  // Bardage horizontal + ombre portée du toit : le mur ne reste pas un aplat.
  for (let y = roofH + 4; y < h - 3; y += 5) px(ctx, 0, y, w, 1, "#00000022");
  px(ctx, 0, roofH, w, 3, "#00000038");
  px(ctx, 0, h - 3, w, 3, "#3a2b20");
  // Toit en escalier : faîtage étroit en haut, avant-toit large en bas.
  for (let i = 0; i < roofH; i++) {
    const inset = Math.floor(((roofH - 1 - i) * 2) / 3);
    px(ctx, inset, i, w - inset * 2, 1, i > roofH - 4 ? "#8f4a3c" : roofColor);
  }
  px(ctx, doorX, h - 14, 14, 14, "#5a3a22");
  px(ctx, doorX + 1, h - 13, 12, 13, "#7a5230");
  px(ctx, doorX + 10, h - 8, 2, 2, "#e8d24a");
  for (const wx of [doorX - 22, doorX + 22]) {
    if (wx < 2 || wx + 12 > w - 2) continue;
    px(ctx, wx, h - 26, 12, 12, "#3a2b20");
    px(ctx, wx + 1, h - 25, 10, 10, "#9ec6e0");
    px(ctx, wx + 1, h - 25, 10, 4, "#c3dcee");
  }
}

function buildBuildings(): BuildingSprites {
  return {
    farmhouse: sprite(8 * TILE, 5 * TILE + 24, (ctx) =>
      drawHouse(ctx, 8 * TILE, 5 * TILE + 24, "#c9a978", "#a85a44", 3 * TILE + 1),
    ),
    store: sprite(9 * TILE, 6 * TILE + 24, (ctx) => {
      drawHouse(ctx, 9 * TILE, 6 * TILE + 24, "#d3b98c", "#4a7a8f", 4 * TILE + 1);
      px(ctx, 20, 44, 104, 12, "#3a2b20");
      px(ctx, 22, 46, 100, 8, "#e8d9b5");
    }),
    cottage: sprite(7 * TILE, 5 * TILE + 24, (ctx) =>
      drawHouse(ctx, 7 * TILE, 5 * TILE + 24, "#bfa47f", "#7a5a44", 3 * TILE + 1),
    ),
  };
}

// ---------------------------------------------------------------- assemblage

export interface SpriteAtlas {
  tiles: TileSprites;
  player: CharacterSet;
  villager: CharacterSet;
  objects: ObjectSprites;
  buildings: BuildingSprites;
}

export function buildAtlas(): SpriteAtlas {
  return {
    tiles: buildTiles(),
    player: buildCharacter({
      hair: PALETTE.hair,
      hairLight: PALETTE.hairLight,
      shirt: PALETTE.shirt,
      shirtShade: PALETTE.shirtShade,
      pants: PALETTE.pants,
    }),
    villager: buildCharacter({
      hair: "#3d2a20",
      hairLight: "#5a3f2e",
      shirt: "#9c5a8f",
      shirtShade: "#7a4370",
      pants: "#4a4238",
    }),
    objects: buildObjects(),
    buildings: buildBuildings(),
  };
}
