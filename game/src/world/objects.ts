export type ObjectKind =
  | "tree"
  | "stump"
  | "rock"
  | "boulder"
  | "weed"
  | "branch"
  | "bush"
  | "bin"
  | "bed"
  | "counter"
  | "sign";

export interface Drop {
  id: string;
  min: number;
  max: number;
  chance: number;
}

export interface ObjectDef {
  solid: boolean;
  /** 0 = indestructible (mobilier). */
  hp: number;
  /** Outil requis pour l'entamer. */
  tool: "axe" | "pickaxe" | "scythe" | null;
  drops: readonly Drop[];
  /** Hauteur du sprite en tuiles (un arbre déborde sur la tuile du dessus). */
  tallness: number;
}

export const OBJECTS: Record<ObjectKind, ObjectDef> = {
  tree: {
    solid: true,
    hp: 5,
    tool: "axe",
    tallness: 3,
    drops: [
      { id: "bois", min: 2, max: 4, chance: 1 },
      { id: "seve", min: 1, max: 1, chance: 0.2 },
    ],
  },
  stump: {
    solid: true,
    hp: 3,
    tool: "axe",
    tallness: 1,
    drops: [{ id: "bois", min: 2, max: 3, chance: 1 }],
  },
  rock: {
    solid: true,
    hp: 2,
    tool: "pickaxe",
    tallness: 1,
    drops: [
      { id: "pierre", min: 1, max: 2, chance: 1 },
      { id: "charbon", min: 1, max: 1, chance: 0.08 },
      { id: "minerai_cuivre", min: 1, max: 1, chance: 0.12 },
    ],
  },
  boulder: {
    solid: true,
    hp: 5,
    tool: "pickaxe",
    tallness: 2,
    drops: [
      { id: "pierre", min: 4, max: 6, chance: 1 },
      { id: "minerai_cuivre", min: 1, max: 2, chance: 0.25 },
    ],
  },
  weed: {
    solid: false,
    hp: 1,
    tool: "scythe",
    tallness: 1,
    drops: [{ id: "fibre", min: 1, max: 1, chance: 0.65 }],
  },
  branch: {
    solid: false,
    hp: 1,
    tool: "axe",
    tallness: 1,
    drops: [{ id: "bois", min: 1, max: 1, chance: 1 }],
  },
  bush: { solid: true, hp: 0, tool: null, tallness: 2, drops: [] },
  bin: { solid: true, hp: 0, tool: null, tallness: 2, drops: [] },
  bed: { solid: true, hp: 0, tool: null, tallness: 2, drops: [] },
  counter: { solid: true, hp: 0, tool: null, tallness: 1, drops: [] },
  sign: { solid: true, hp: 0, tool: null, tallness: 1, drops: [] },
};

export interface WorldObject {
  kind: ObjectKind;
  hp: number;
  /** Petite variation d'apparence, stable dans le temps. */
  variant: number;
  /** Pour les buissons : jour de la dernière cueillette. */
  lastHarvestDay?: number;
}
