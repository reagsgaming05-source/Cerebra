import { CROPS } from "../world/crops";
import type { Season } from "../world/crops";
import { itemDef } from "./items";
import type { Slot } from "./inventory";

/** Caisse d'expédition : tout ce qui y est déposé est vendu pendant la nuit. */
export class ShippingBin {
  readonly contents: Slot[] = [];

  deposit(id: string, count: number): void {
    const existing = this.contents.find((s) => s.id === id);
    if (existing) existing.count += count;
    else this.contents.push({ id, count });
  }

  total(): number {
    return this.contents.reduce((sum, s) => sum + itemDef(s.id).sellPrice * s.count, 0);
  }

  /** Vide la caisse et retourne le détail de la vente pour le bilan du soir. */
  settle(): { lines: { name: string; count: number; value: number }[]; total: number } {
    const lines = this.contents.map((s) => ({
      name: itemDef(s.id).name,
      count: s.count,
      value: itemDef(s.id).sellPrice * s.count,
    }));
    const total = this.total();
    this.contents.length = 0;
    return { lines, total };
  }

  serialize(): Slot[] {
    return this.contents.map((s) => ({ ...s }));
  }

  load(data: Slot[]): void {
    this.contents.length = 0;
    for (const s of data) this.contents.push({ ...s });
  }
}

export interface StockEntry {
  id: string;
  price: number;
  /** undefined = stock illimité. */
  limit?: number;
}

const ALWAYS_IN_STOCK: StockEntry[] = [{ id: "pain", price: 60 }];

/** Le magasin ne propose que les semences plantables dans la saison en cours. */
export function shopStock(season: Season): StockEntry[] {
  const seeds = CROPS.filter((c) => c.seasons.includes(season)).map((c) => ({
    id: c.seedId,
    price: c.seedPrice,
  }));
  return [...seeds, ...ALWAYS_IN_STOCK];
}
