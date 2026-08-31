export type Season = "printemps" | "ete" | "automne" | "hiver";

export interface CropDef {
  id: string;
  name: string;
  seedId: string;
  produceId: string;
  /** Nombre de jours passés dans chaque stade avant de changer d'apparence. */
  stages: readonly number[];
  seasons: readonly Season[];
  /** Si défini, la plante reste en terre et redonne un fruit tous les N jours. */
  regrowDays?: number;
  seedPrice: number;
  sellPrice: number;
  /** Rendement à la récolte (min, max inclus). */
  yield: readonly [number, number];
  /** Couleurs du plant : tige, feuillage, fruit. */
  palette: { stem: string; leaf: string; fruit: string };
}

export const CROPS: readonly CropDef[] = [
  {
    id: "navet",
    name: "Navet",
    seedId: "seed_navet",
    produceId: "navet",
    stages: [1, 1, 1, 1],
    seasons: ["printemps"],
    seedPrice: 20,
    sellPrice: 42,
    yield: [1, 1],
    palette: { stem: "#4e7a37", leaf: "#77b04a", fruit: "#f2f0e4" },
  },
  {
    id: "patate",
    name: "Pomme de terre",
    seedId: "seed_patate",
    produceId: "patate",
    stages: [1, 1, 1, 2, 1],
    seasons: ["printemps"],
    seedPrice: 50,
    sellPrice: 90,
    yield: [1, 2],
    palette: { stem: "#4a6b33", leaf: "#6d9c45", fruit: "#b98a52" },
  },
  {
    id: "fraise",
    name: "Fraise",
    seasons: ["printemps"],
    seedId: "seed_fraise",
    produceId: "fraise",
    stages: [1, 1, 2, 2, 2],
    regrowDays: 4,
    seedPrice: 100,
    sellPrice: 130,
    yield: [1, 2],
    palette: { stem: "#3f7a35", leaf: "#5fae4a", fruit: "#e0364c" },
  },
  {
    id: "tomate",
    name: "Tomate",
    seedId: "seed_tomate",
    produceId: "tomate",
    stages: [2, 2, 2, 2, 3],
    seasons: ["ete"],
    regrowDays: 4,
    seedPrice: 50,
    sellPrice: 72,
    yield: [1, 1],
    palette: { stem: "#3d6b2f", leaf: "#5f9b3f", fruit: "#d8402f" },
  },
  {
    id: "piment",
    name: "Piment",
    seedId: "seed_piment",
    produceId: "piment",
    stages: [1, 1, 1, 1, 1],
    seasons: ["ete"],
    regrowDays: 3,
    seedPrice: 40,
    sellPrice: 48,
    yield: [1, 1],
    palette: { stem: "#3f6b30", leaf: "#639b41", fruit: "#e05a1f" },
  },
  {
    id: "melon",
    name: "Melon",
    seedId: "seed_melon",
    produceId: "melon",
    stages: [1, 2, 3, 3, 3],
    seasons: ["ete"],
    seedPrice: 80,
    sellPrice: 300,
    yield: [1, 1],
    palette: { stem: "#41722f", leaf: "#6aa63f", fruit: "#8fbf5a" },
  },
  {
    id: "mais",
    name: "Maïs",
    seedId: "seed_mais",
    produceId: "mais",
    stages: [2, 3, 3, 3, 3],
    seasons: ["ete", "automne"],
    regrowDays: 4,
    seedPrice: 150,
    sellPrice: 62,
    yield: [1, 1],
    palette: { stem: "#4d7a2c", leaf: "#79ad3c", fruit: "#f0c33c" },
  },
  {
    id: "citrouille",
    name: "Citrouille",
    seedId: "seed_citrouille",
    produceId: "citrouille",
    stages: [1, 2, 3, 4, 3],
    seasons: ["automne"],
    seedPrice: 100,
    sellPrice: 380,
    yield: [1, 1],
    palette: { stem: "#456b2c", leaf: "#6d9c3a", fruit: "#e5822a" },
  },
];

export const CROP_BY_ID = new Map(CROPS.map((c) => [c.id, c]));
export const CROP_BY_SEED = new Map(CROPS.map((c) => [c.seedId, c]));

export const totalGrowthDays = (crop: CropDef): number =>
  crop.stages.reduce((sum, d) => sum + d, 0);

/** Stade visuel (0..stages.length) atteint après `growth` jours d'arrosage. */
export const stageOf = (crop: CropDef, growth: number): number => {
  let remaining = growth;
  for (let i = 0; i < crop.stages.length; i++) {
    if (remaining < crop.stages[i]) return i;
    remaining -= crop.stages[i];
  }
  return crop.stages.length;
};

export const isMature = (crop: CropDef, growth: number): boolean =>
  growth >= totalGrowthDays(crop);
