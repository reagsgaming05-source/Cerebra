import type { Rng } from "../core/rng";
import { Tile, isTillable, isWaterSource } from "../world/tiles";
import { OBJECTS, type WorldObject } from "../world/objects";
import { CROP_BY_ID, CROP_BY_SEED, isMature, stageOf } from "../world/crops";
import type { GameMap } from "../world/world";
import { itemDef } from "./items";
import type { Inventory } from "./inventory";
import type { Player } from "./player";
import type { Clock } from "./time";

export const ENERGY_COST: Record<string, number> = {
  hoe: 2,
  can: 2,
  axe: 4,
  pickaxe: 4,
  scythe: 1,
};

export type ActionOutcome =
  | { type: "none" }
  | { type: "message"; text: string }
  | { type: "sleep" }
  | { type: "bin" }
  | { type: "shop" };

export interface ActionContext {
  map: GameMap;
  player: Player;
  inventory: Inventory;
  clock: Clock;
  rng: Rng;
  sfx: (name: Parameters<import("../core/audio").Audio["play"]>[0]) => void;
  toast: (text: string, x: number, y: number, color?: string) => void;
}

/** Ajoute un butin à l'inventaire et affiche le gain au-dessus de la tuile. */
function grant(ctx: ActionContext, id: string, count: number, tx: number, ty: number): void {
  if (count <= 0) return;
  const left = ctx.inventory.add(id, count);
  const taken = count - left;
  if (taken > 0) ctx.toast(`+${taken} ${itemDef(id).name}`, tx, ty, "#f4ecd8");
  if (left > 0) ctx.toast("Sac plein !", tx, ty, "#e8a04a");
}

function rollDrops(ctx: ActionContext, obj: WorldObject, tx: number, ty: number): void {
  for (const drop of OBJECTS[obj.kind].drops) {
    if (!ctx.rng.chance(drop.chance)) continue;
    grant(ctx, drop.id, ctx.rng.int(drop.min, drop.max), tx, ty);
  }
}

function damageObject(ctx: ActionContext, tx: number, ty: number, obj: WorldObject): boolean {
  obj.hp -= 1;
  if (obj.hp > 0) return true;

  ctx.map.removeObject(tx, ty);
  rollDrops(ctx, obj, tx, ty);
  // Un arbre abattu laisse une souche à déraciner.
  if (obj.kind === "tree") {
    ctx.map.addObject(tx, ty, { kind: "stump", hp: OBJECTS.stump.hp, variant: obj.variant });
  }
  return true;
}

function useHoe(ctx: ActionContext, tx: number, ty: number): ActionOutcome {
  const tile = ctx.map.tileAt(tx, ty);
  if (ctx.map.objectAt(tx, ty)) return { type: "message", text: "Il y a quelque chose ici." };
  if (tile === Tile.Tilled || tile === Tile.TilledWet) {
    if (ctx.map.cropAt(tx, ty)) return { type: "message", text: "Une plante pousse ici." };
    ctx.map.setTile(tx, ty, Tile.Dirt);
    ctx.sfx("hoe");
    return { type: "none" };
  }
  if (!isTillable(tile)) return { type: "message", text: "Ce sol ne se laboure pas." };
  ctx.map.setTile(tx, ty, Tile.Tilled);
  ctx.sfx("hoe");
  return { type: "none" };
}

function useWateringCan(ctx: ActionContext, tx: number, ty: number): ActionOutcome {
  if (isWaterSource(ctx.map.tileAt(tx, ty))) {
    ctx.player.water = ctx.player.waterMax;
    ctx.sfx("water");
    ctx.toast("Arrosoir rempli", tx, ty, "#8fd0f0");
    return { type: "none" };
  }
  const tile = ctx.map.tileAt(tx, ty);
  if (tile !== Tile.Tilled && tile !== Tile.TilledWet) {
    return { type: "message", text: "Rien à arroser ici." };
  }
  if (tile === Tile.TilledWet) return { type: "none" };
  if (ctx.player.water <= 0) return { type: "message", text: "Arrosoir vide — va le remplir à la mare." };

  ctx.player.water -= 1;
  ctx.map.setTile(tx, ty, Tile.TilledWet);
  const crop = ctx.map.cropAt(tx, ty);
  if (crop) crop.watered = true;
  ctx.sfx("water");
  return { type: "none" };
}

function useCuttingTool(
  ctx: ActionContext,
  tx: number,
  ty: number,
  tool: "axe" | "pickaxe" | "scythe",
): ActionOutcome {
  const obj = ctx.map.objectAt(tx, ty);
  if (!obj) return { type: "message", text: "Rien à travailler ici." };

  const def = OBJECTS[obj.kind];
  if (def.tool !== tool) {
    return { type: "message", text: `Il faut un autre outil pour ça.` };
  }
  ctx.sfx(tool === "axe" ? "chop" : tool === "pickaxe" ? "mine" : "cut");
  damageObject(ctx, tx, ty, obj);
  return { type: "none" };
}

function plantSeed(ctx: ActionContext, tx: number, ty: number, seedId: string): ActionOutcome {
  const crop = CROP_BY_SEED.get(seedId);
  if (!crop) return { type: "none" };

  const tile = ctx.map.tileAt(tx, ty);
  if (tile !== Tile.Tilled && tile !== Tile.TilledWet) {
    return { type: "message", text: "Il faut d'abord labourer la terre." };
  }
  if (ctx.map.cropAt(tx, ty)) return { type: "message", text: "Il y a déjà une plante ici." };
  if (!crop.seasons.includes(ctx.clock.season)) {
    return { type: "message", text: `${crop.name} ne pousse pas en cette saison.` };
  }

  ctx.inventory.consumeSelected(1);
  ctx.map.crops.set(ctx.map.key(tx, ty), {
    cropId: crop.id,
    growth: 0,
    watered: tile === Tile.TilledWet,
  });
  ctx.sfx("plant");
  return { type: "none" };
}

/** Point d'entrée « clic gauche » : applique l'objet tenu sur la tuile visée. */
export function useHeldItem(ctx: ActionContext): ActionOutcome {
  const held = ctx.inventory.held;
  if (!held) return { type: "message", text: "Les mains vides." };

  const { x: tx, y: ty } = ctx.player.facingTile();
  if (!ctx.map.inBounds(tx, ty)) return { type: "none" };

  const def = itemDef(held.id);
  if (def.kind === "seed") {
    ctx.player.beginAct();
    return plantSeed(ctx, tx, ty, held.id);
  }
  if (def.kind !== "tool") return { type: "none" };

  const cost = ENERGY_COST[held.id] ?? 0;
  if (ctx.player.energy < cost) {
    return { type: "message", text: "Trop épuisé pour ça. Va dormir." };
  }

  ctx.player.beginAct();
  let outcome: ActionOutcome;
  switch (held.id) {
    case "hoe":
      outcome = useHoe(ctx, tx, ty);
      break;
    case "can":
      outcome = useWateringCan(ctx, tx, ty);
      break;
    case "axe":
      outcome = useCuttingTool(ctx, tx, ty, "axe");
      break;
    case "pickaxe":
      outcome = useCuttingTool(ctx, tx, ty, "pickaxe");
      break;
    case "scythe":
      outcome = useCuttingTool(ctx, tx, ty, "scythe");
      break;
    default:
      outcome = { type: "none" };
  }

  // L'énergie n'est dépensée que si l'action a réellement abouti.
  if (outcome.type === "none") ctx.player.spendEnergy(cost);
  return outcome;
}

function harvestCrop(ctx: ActionContext, tx: number, ty: number): ActionOutcome {
  const instance = ctx.map.cropAt(tx, ty);
  if (!instance) return { type: "none" };
  const crop = CROP_BY_ID.get(instance.cropId);
  if (!crop || !isMature(crop, instance.growth)) {
    return { type: "message", text: "Pas encore mûr." };
  }

  const amount = ctx.rng.int(crop.yield[0], crop.yield[1]);
  grant(ctx, crop.produceId, amount, tx, ty);
  ctx.sfx("harvest");

  if (crop.regrowDays !== undefined) {
    // La plante reste en terre et repart quelques jours en arrière.
    const total = crop.stages.reduce((s, d) => s + d, 0);
    instance.growth = Math.max(0, total - crop.regrowDays);
  } else {
    ctx.map.crops.delete(ctx.map.key(tx, ty));
    ctx.map.setTile(tx, ty, Tile.Tilled);
  }
  return { type: "none" };
}

/** Point d'entrée « E » : récolte, mobilier, cueillette, ou consommation de l'objet tenu. */
export function interact(ctx: ActionContext): ActionOutcome {
  const { x: tx, y: ty } = ctx.player.facingTile();

  if (ctx.map.cropAt(tx, ty)) return harvestCrop(ctx, tx, ty);

  const obj = ctx.map.objectAt(tx, ty);
  if (obj) {
    switch (obj.kind) {
      case "bed":
        return { type: "sleep" };
      case "bin":
        return { type: "bin" };
      case "counter":
        return { type: "shop" };
      case "sign":
        return {
          type: "message",
          text: "Ferme du Val — laboure, sème, arrose, récolte. Dépose tes récoltes dans la caisse.",
        };
      case "bush": {
        if (obj.lastHarvestDay === ctx.clock.day) {
          return { type: "message", text: "Ce buisson a déjà été cueilli aujourd'hui." };
        }
        obj.lastHarvestDay = ctx.clock.day;
        grant(ctx, "baie", ctx.rng.int(1, 2), tx, ty);
        ctx.sfx("pickup");
        return { type: "none" };
      }
      default:
        break;
    }
  }

  // Rien devant soi : on mange ce que l'on tient, si c'est comestible.
  const held = ctx.inventory.held;
  if (held) {
    const def = itemDef(held.id);
    if (def.energy !== undefined && ctx.player.energy < ctx.player.maxEnergy) {
      ctx.inventory.consumeSelected(1);
      ctx.player.restoreEnergy(def.energy);
      ctx.sfx("pickup");
      ctx.toast(`+${def.energy} énergie`, tx, ty, "#7fd06a");
      return { type: "none" };
    }
  }
  return { type: "none" };
}

/**
 * Passage au jour suivant : croissance, assèchement des sols, repousse de la végétation.
 * Retourne le nombre de plantes arrivées à maturité pendant la nuit.
 */
export function advanceDay(maps: GameMap[], clock: Clock, rng: Rng): number {
  let matured = 0;

  for (const map of maps) {
    for (const [key, instance] of map.crops) {
      const crop = CROP_BY_ID.get(instance.cropId);
      if (!crop) continue;

      const x = key % map.width;
      const y = Math.floor(key / map.width);
      const wasMature = isMature(crop, instance.growth);
      const outdoors = !map.indoors;
      const watered = instance.watered || (outdoors && clock.raining);

      if (!crop.seasons.includes(clock.season)) {
        // Hors saison : la plante meurt et libère la parcelle.
        map.crops.delete(key);
        map.setTile(x, y, Tile.Dirt);
        continue;
      }
      if (watered) {
        const before = stageOf(crop, instance.growth);
        instance.growth += 1;
        if (!wasMature && isMature(crop, instance.growth)) matured += 1;
        else if (stageOf(crop, instance.growth) > before) matured += 0;
      }
      instance.watered = false;
    }

    // Les sols labourés sèchent, sauf s'il pleut dehors.
    for (let i = 0; i < map.tiles.length; i++) {
      if (map.tiles[i] === Tile.TilledWet) {
        map.tiles[i] = clock.raining && !map.indoors ? Tile.TilledWet : Tile.Tilled;
      }
    }
    if (clock.raining && !map.indoors) {
      for (const instance of map.crops.values()) instance.watered = true;
    }

    // La nature reprend ses droits : quelques herbes repoussent chaque nuit.
    if (!map.indoors) {
      for (let i = 0; i < 6; i++) {
        const x = rng.int(1, map.width - 2);
        const y = rng.int(1, map.height - 2);
        const tile = map.tileAt(x, y);
        if (tile !== Tile.Grass || map.objectAt(x, y) || map.cropAt(x, y)) continue;
        map.addObject(x, y, { kind: "weed", hp: OBJECTS.weed.hp, variant: rng.int(0, 2) });
      }
    }
  }

  return matured;
}
