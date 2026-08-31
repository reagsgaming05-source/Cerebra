import { CROP_BY_ID, type CropDef } from "../world/crops";
import { itemDef } from "../game/items";
import { PALETTE, makeCanvas, px, type Canvas, type Ctx } from "./sprites";

const cropCache = new Map<string, Canvas>();
const itemCache = new Map<string, Canvas>();

function draw16(paint: (ctx: Ctx) => void): Canvas {
  const { canvas, ctx } = makeCanvas(16, 16);
  paint(ctx);
  return canvas;
}

/**
 * Un plant est dessiné à partir de son stade : pousse, tige, feuillage, puis fruit.
 * Toutes les cultures partagent la même silhouette, seule la palette change.
 */
function paintCrop(ctx: Ctx, crop: CropDef, stage: number, mature: boolean): void {
  const { stem, leaf, fruit } = crop.palette;
  const stages = crop.stages.length;
  const t = Math.min(stage / stages, 1);

  if (stage === 0) {
    px(ctx, 7, 12, 2, 3, stem);
    px(ctx, 6, 11, 1, 1, leaf);
    px(ctx, 9, 11, 1, 1, leaf);
    return;
  }

  const height = Math.round(4 + t * 8);
  const top = 15 - height;
  px(ctx, 7, top, 2, height, stem);

  const spread = Math.round(1 + t * 3);
  for (let i = 0; i < 2 + stage; i++) {
    const y = top + 1 + Math.floor((i * height) / (2 + stage));
    if (y > 14) break;
    const side = i % 2 === 0 ? -1 : 1;
    const x = side < 0 ? 7 - spread : 9;
    px(ctx, x, y, spread, 2, leaf);
  }

  if (mature) {
    px(ctx, 5, top + 2, 6, 6, fruit);
    px(ctx, 6, top + 1, 4, 2, fruit);
    px(ctx, 6, top + 3, 2, 2, "#ffffff44");
  } else if (stage >= stages - 1) {
    px(ctx, 7, top + 3, 3, 3, fruit);
  }
}

export function cropSprite(cropId: string, stage: number, mature: boolean): Canvas {
  const key = `${cropId}:${stage}:${mature ? 1 : 0}`;
  const cached = cropCache.get(key);
  if (cached) return cached;

  const crop = CROP_BY_ID.get(cropId);
  const made = draw16((ctx) => {
    if (crop) paintCrop(ctx, crop, stage, mature);
  });
  cropCache.set(key, made);
  return made;
}

function paintTool(ctx: Ctx, id: string): void {
  const handle = PALETTE.wood;
  const metal = "#c9ccd4";
  px(ctx, 6, 4, 2, 11, handle);
  switch (id) {
    case "hoe":
      px(ctx, 8, 3, 5, 2, metal);
      px(ctx, 11, 3, 2, 4, metal);
      break;
    case "can":
      px(ctx, 3, 6, 8, 8, "#6f8fa8");
      px(ctx, 3, 6, 8, 2, "#8fb0c8");
      px(ctx, 11, 8, 3, 2, "#6f8fa8");
      px(ctx, 13, 6, 2, 3, "#8fb0c8");
      px(ctx, 5, 3, 5, 3, "#54748c");
      break;
    case "axe":
      px(ctx, 8, 2, 5, 6, metal);
      px(ctx, 12, 3, 2, 4, "#9a9da6");
      break;
    case "pickaxe":
      px(ctx, 3, 3, 11, 2, "#a9adb8");
      px(ctx, 2, 4, 2, 2, "#8d8f99");
      px(ctx, 13, 4, 2, 2, "#8d8f99");
      break;
    case "scythe":
      px(ctx, 3, 3, 10, 2, "#e2e5ec");
      px(ctx, 2, 5, 3, 2, "#c9ccd4");
      break;
    default:
      px(ctx, 5, 5, 6, 6, metal);
  }
}

function paintItem(ctx: Ctx, id: string): void {
  const def = itemDef(id);
  const [main, shade] = [def.colors[0], def.colors[1] ?? def.colors[0]];

  switch (def.kind) {
    case "tool":
      paintTool(ctx, id);
      return;
    case "seed":
      // Sachet de graines : toile beige et pastille de la couleur de la culture.
      px(ctx, 4, 4, 8, 10, "#d8c9a3");
      px(ctx, 4, 4, 8, 2, "#b8a880");
      px(ctx, 6, 7, 4, 4, main);
      px(ctx, 5, 13, 6, 1, shade);
      return;
    case "resource":
      if (id === "bois") {
        px(ctx, 2, 6, 12, 5, main);
        px(ctx, 2, 6, 12, 2, "#a2703a");
        px(ctx, 3, 11, 10, 2, shade);
      } else if (id === "fibre") {
        px(ctx, 4, 4, 2, 9, main);
        px(ctx, 7, 3, 2, 10, shade);
        px(ctx, 10, 5, 2, 8, main);
      } else {
        px(ctx, 4, 7, 9, 6, shade);
        px(ctx, 4, 5, 9, 4, main);
        px(ctx, 6, 6, 3, 2, "#ffffff33");
      }
      return;
    default: {
      // Récoltes et nourriture : une baie stylisée avec une feuille.
      px(ctx, 4, 6, 8, 8, main);
      px(ctx, 5, 5, 6, 2, main);
      px(ctx, 4, 12, 8, 2, shade);
      px(ctx, 5, 7, 2, 2, "#ffffff55");
      px(ctx, 8, 3, 3, 2, "#5b8f3a");
      px(ctx, 7, 4, 2, 2, "#4f8033");
    }
  }
}

export function itemIcon(id: string): Canvas {
  const cached = itemCache.get(id);
  if (cached) return cached;
  const made = draw16((ctx) => paintItem(ctx, id));
  itemCache.set(id, made);
  return made;
}
