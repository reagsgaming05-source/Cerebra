import { CROPS } from "../world/crops";

export type ItemKind = "tool" | "seed" | "produce" | "resource" | "food";

export interface ItemDef {
  id: string;
  name: string;
  kind: ItemKind;
  /** Prix de revente à la caisse d'expédition. 0 = invendable. */
  sellPrice: number;
  /** Prix d'achat au magasin. undefined = non vendu. */
  buyPrice?: number;
  stack: number;
  /** Énergie rendue si l'objet est consommé. */
  energy?: number;
  /** Couleurs utilisées par le générateur d'icônes. */
  colors: readonly string[];
}

const TOOLS: ItemDef[] = [
  { id: "hoe", name: "Houe", kind: "tool", sellPrice: 0, stack: 1, colors: ["#8a5a2b", "#c9ccd4"] },
  { id: "can", name: "Arrosoir", kind: "tool", sellPrice: 0, stack: 1, colors: ["#6f8fa8", "#c9ccd4"] },
  { id: "axe", name: "Hache", kind: "tool", sellPrice: 0, stack: 1, colors: ["#8a5a2b", "#d8dbe2"] },
  { id: "pickaxe", name: "Pioche", kind: "tool", sellPrice: 0, stack: 1, colors: ["#8a5a2b", "#a9adb8"] },
  { id: "scythe", name: "Faux", kind: "tool", sellPrice: 0, stack: 1, colors: ["#8a5a2b", "#e2e5ec"] },
];

const RESOURCES: ItemDef[] = [
  { id: "bois", name: "Bois", kind: "resource", sellPrice: 4, stack: 999, colors: ["#8a5a2b", "#6b4420"] },
  { id: "pierre", name: "Pierre", kind: "resource", sellPrice: 5, stack: 999, colors: ["#8d8f99", "#6d6f78"] },
  { id: "fibre", name: "Fibre", kind: "resource", sellPrice: 3, stack: 999, colors: ["#7fae52", "#5d8a3a"] },
  { id: "seve", name: "Sève", kind: "resource", sellPrice: 12, stack: 999, colors: ["#d9a441", "#a97a25"] },
  { id: "charbon", name: "Charbon", kind: "resource", sellPrice: 22, stack: 999, colors: ["#3a3a42", "#22222a"] },
  {
    id: "minerai_cuivre",
    name: "Minerai de cuivre",
    kind: "resource",
    sellPrice: 30,
    stack: 999,
    colors: ["#c8763c", "#8d4f26"],
  },
];

const FOOD: ItemDef[] = [
  {
    id: "baie",
    name: "Baie sauvage",
    kind: "food",
    sellPrice: 10,
    stack: 999,
    energy: 18,
    colors: ["#8f3f63", "#5f2742"],
  },
  {
    id: "pain",
    name: "Pain de campagne",
    kind: "food",
    sellPrice: 30,
    buyPrice: 60,
    stack: 999,
    energy: 55,
    colors: ["#c99a55", "#8f6a33"],
  },
];

/** Semences et récoltes sont dérivées des définitions de cultures : une seule source de vérité. */
const CROP_ITEMS: ItemDef[] = CROPS.flatMap((crop) => [
  {
    id: crop.seedId,
    name: `Graines de ${crop.name.toLowerCase()}`,
    kind: "seed" as const,
    sellPrice: Math.floor(crop.seedPrice / 2),
    buyPrice: crop.seedPrice,
    stack: 999,
    colors: [crop.palette.leaf, crop.palette.stem],
  },
  {
    id: crop.produceId,
    name: crop.name,
    kind: "produce" as const,
    sellPrice: crop.sellPrice,
    stack: 999,
    energy: Math.max(12, Math.round(crop.sellPrice / 4)),
    colors: [crop.palette.fruit, crop.palette.leaf],
  },
]);

export const ITEMS: readonly ItemDef[] = [...TOOLS, ...CROP_ITEMS, ...RESOURCES, ...FOOD];

const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

export function itemDef(id: string): ItemDef {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`Objet inconnu : ${id}`);
  return def;
}

export const isTool = (id: string): boolean => itemDef(id).kind === "tool";
