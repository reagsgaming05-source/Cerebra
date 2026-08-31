import { itemDef } from "./items";

export interface Slot {
  id: string;
  count: number;
}

export const HOTBAR_SIZE = 12;
export const BACKPACK_ROWS = 2;
export const INVENTORY_SIZE = HOTBAR_SIZE * (1 + BACKPACK_ROWS);

/**
 * Inventaire à emplacements fixes : les 12 premiers forment la barre rapide.
 * Un emplacement vide vaut `null`, ce qui permet de déplacer les objets sans décaler le reste.
 */
export class Inventory {
  readonly slots: (Slot | null)[] = new Array<Slot | null>(INVENTORY_SIZE).fill(null);
  selected = 0;

  get held(): Slot | null {
    return this.slots[this.selected];
  }

  /** Ajoute au maximum `count` unités. Retourne ce qui n'a pas pu rentrer. */
  add(id: string, count: number): number {
    const max = itemDef(id).stack;
    let left = count;

    for (const slot of this.slots) {
      if (left <= 0) break;
      if (slot && slot.id === id && slot.count < max) {
        const room = max - slot.count;
        const moved = Math.min(room, left);
        slot.count += moved;
        left -= moved;
      }
    }
    for (let i = 0; i < this.slots.length && left > 0; i++) {
      if (this.slots[i] === null) {
        const moved = Math.min(max, left);
        this.slots[i] = { id, count: moved };
        left -= moved;
      }
    }
    return left;
  }

  hasRoomFor(id: string): boolean {
    const max = itemDef(id).stack;
    return this.slots.some((s) => s === null || (s.id === id && s.count < max));
  }

  count(id: string): number {
    return this.slots.reduce((sum, s) => (s && s.id === id ? sum + s.count : sum), 0);
  }

  /** Retire `count` unités réparties sur tous les emplacements. Retourne le nombre réellement retiré. */
  remove(id: string, count: number): number {
    let left = count;
    for (let i = 0; i < this.slots.length && left > 0; i++) {
      const slot = this.slots[i];
      if (!slot || slot.id !== id) continue;
      const taken = Math.min(slot.count, left);
      slot.count -= taken;
      left -= taken;
      if (slot.count === 0) this.slots[i] = null;
    }
    return count - left;
  }

  consumeSelected(count = 1): boolean {
    const slot = this.slots[this.selected];
    if (!slot || slot.count < count) return false;
    slot.count -= count;
    if (slot.count === 0) this.slots[this.selected] = null;
    return true;
  }

  takeAt(index: number): Slot | null {
    const slot = this.slots[index] ?? null;
    this.slots[index] = null;
    return slot;
  }

  /** Dépose `slot` en `index` et retourne ce qui s'y trouvait (fusion si même objet). */
  placeAt(index: number, slot: Slot): Slot | null {
    const existing = this.slots[index];
    if (existing && existing.id === slot.id) {
      const max = itemDef(slot.id).stack;
      const moved = Math.min(max - existing.count, slot.count);
      existing.count += moved;
      const rest = slot.count - moved;
      return rest > 0 ? { id: slot.id, count: rest } : null;
    }
    this.slots[index] = slot;
    return existing ?? null;
  }

  selectRelative(delta: number): void {
    const size = HOTBAR_SIZE;
    this.selected = ((this.selected + delta) % size + size) % size;
  }

  serialize(): (Slot | null)[] {
    return this.slots.map((s) => (s ? { ...s } : null));
  }

  load(data: (Slot | null)[]): void {
    for (let i = 0; i < this.slots.length; i++) {
      const incoming = data[i];
      this.slots[i] = incoming ? { id: incoming.id, count: incoming.count } : null;
    }
  }
}
