import { HOTBAR_SIZE, INVENTORY_SIZE, type Inventory, type Slot } from "../game/inventory";
import { itemDef } from "../game/items";
import type { StockEntry } from "../game/economy";
import { itemIcon } from "../render/icons";
import { Painter, UI_COLORS } from "../render/ui";

export interface Region {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SaleLine {
  name: string;
  count: number;
  value: number;
}

/**
 * Interface en mode immédiat : chaque écran déclare ses zones cliquables
 * au moment où il se dessine, et `hit()` les résout au clic suivant.
 */
export class Menus {
  private regions: Region[] = [];
  hovered: string | null = null;

  constructor(private readonly painter: Painter) {}

  begin(): void {
    this.regions = [];
  }

  private region(id: string, x: number, y: number, w: number, h: number): boolean {
    this.regions.push({ id, x, y, w, h });
    return this.hovered === id;
  }

  updateHover(mx: number, my: number): void {
    this.hovered = this.hit(mx, my);
  }

  hit(mx: number, my: number): string | null {
    for (let i = this.regions.length - 1; i >= 0; i--) {
      const r = this.regions[i];
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return r.id;
    }
    return null;
  }

  private button(id: string, label: string, x: number, y: number, w: number, h: number): void {
    const hot = this.region(id, x, y, w, h);
    this.painter.panel(x, y, w, h, hot);
    this.painter.text(label, x + w / 2, y + h / 2, {
      size: 4,
      align: "center",
      baseline: "middle",
      color: hot ? UI_COLORS.accent : UI_COLORS.text,
    });
  }

  // ------------------------------------------------------------- titre

  title(width: number, height: number, hasSave: boolean): void {
    const p = this.painter;
    const u = p.u;
    p.ctx.fillStyle = "#1b2418";
    p.ctx.fillRect(0, 0, width, height);
    p.ctx.fillStyle = "#25331f";
    p.ctx.fillRect(0, height * 0.55, width, height * 0.45);

    p.text("VAL D'AMBRE", width / 2, height * 0.22, {
      size: 12,
      align: "center",
      color: UI_COLORS.accent,
      bold: true,
    });
    p.text("Une ferme, une vallée, une saison à la fois.", width / 2, height * 0.32, {
      size: 4,
      align: "center",
      color: UI_COLORS.textDim,
    });

    const bw = u * 14;
    const bh = u * 3.2;
    const bx = (width - bw) / 2;
    let by = height * 0.44;
    if (hasSave) {
      this.button("title:continue", "Continuer", bx, by, bw, bh);
      by += bh + u * 0.8;
    }
    this.button("title:new", hasSave ? "Nouvelle partie" : "Commencer", bx, by, bw, bh);

    const help = [
      "ZQSD / WASD ou flèches — se déplacer",
      "Espace ou clic gauche — utiliser l'outil",
      "E ou clic droit — interagir, récolter, manger",
      "1..0 / molette — changer d'objet",
      "I — inventaire     Échap — menu",
    ];
    let hy = height * 0.72;
    for (const line of help) {
      p.text(line, width / 2, hy, { size: 3.2, align: "center", color: UI_COLORS.textDim });
      hy += u * 1.4;
    }
  }

  // ------------------------------------------------------------- inventaire

  /** Grille complète de l'inventaire. `held` est la pile portée par le curseur. */
  inventoryGrid(
    width: number,
    height: number,
    inventory: Inventory,
    originY: number,
    prefix = "slot",
  ): { x: number; y: number; w: number; h: number } {
    const p = this.painter;
    const u = p.u;
    const cell = u * 2.6;
    const gap = u * 0.25;
    const cols = HOTBAR_SIZE;
    const rows = INVENTORY_SIZE / cols;
    const gridW = cols * (cell + gap) - gap;
    const gridH = rows * (cell + gap) - gap;
    const x0 = Math.round((width - gridW) / 2);
    const y0 = Math.round(originY);

    p.panel(x0 - u, y0 - u, gridW + u * 2, gridH + u * 2);
    for (let i = 0; i < INVENTORY_SIZE; i++) {
      const cx = x0 + (i % cols) * (cell + gap);
      const cy = y0 + Math.floor(i / cols) * (cell + gap);
      const hot = this.region(`${prefix}:${i}`, cx, cy, cell, cell);
      p.panel(cx, cy, cell, cell, hot || inventory.selected === i);
      const entry = inventory.slots[i];
      if (entry) {
        p.icon(itemIcon(entry.id), cx + cell * 0.15, cy + cell * 0.15, cell * 0.7);
        if (entry.count > 1) {
          p.text(String(entry.count), cx + cell - u * 0.25, cy + cell - u * 0.3, {
            size: 3,
            align: "right",
            baseline: "bottom",
          });
        }
      }
    }

    // Infobulle de l'emplacement survolé.
    if (this.hovered?.startsWith(`${prefix}:`)) {
      const index = Number(this.hovered.split(":")[1]);
      const entry = inventory.slots[index];
      if (entry) {
        const def = itemDef(entry.id);
        const label = def.sellPrice > 0 ? `${def.name} — ${def.sellPrice} po` : def.name;
        p.text(label, width / 2, y0 + gridH + u * 1.6, {
          size: 3.6,
          align: "center",
          color: UI_COLORS.accent,
        });
      }
    }
    void height;
    return { x: x0, y: y0, w: gridW, h: gridH };
  }

  inventoryScreen(width: number, height: number, inventory: Inventory, cursor: Slot | null): void {
    const p = this.painter;
    p.dim(width, height);
    p.text("Sac", width / 2, height * 0.16, { size: 6, align: "center", color: UI_COLORS.accent });
    this.inventoryGrid(width, height, inventory, height * 0.28);
    p.text(
      "Clic : prendre / poser une pile     Échap ou I : fermer",
      width / 2,
      height * 0.82,
      { size: 3.2, align: "center", color: UI_COLORS.textDim },
    );
    this.drawCursorStack(cursor);
  }

  private cursorX = 0;
  private cursorY = 0;

  setCursor(x: number, y: number): void {
    this.cursorX = x;
    this.cursorY = y;
  }

  private drawCursorStack(cursor: Slot | null): void {
    if (!cursor) return;
    const p = this.painter;
    const size = p.u * 1.8;
    p.icon(itemIcon(cursor.id), this.cursorX - size / 2, this.cursorY - size / 2, size);
    if (cursor.count > 1) {
      p.text(String(cursor.count), this.cursorX + size / 2, this.cursorY + size / 2, {
        size: 3,
        align: "right",
        baseline: "bottom",
      });
    }
  }

  // ------------------------------------------------------------- caisse

  shippingBin(
    width: number,
    height: number,
    inventory: Inventory,
    contents: readonly Slot[],
    pending: number,
  ): void {
    const p = this.painter;
    const u = p.u;
    p.dim(width, height);
    p.text("Caisse d'expédition", width / 2, height * 0.1, {
      size: 5.5,
      align: "center",
      color: UI_COLORS.accent,
    });
    p.text(
      "Clic sur un objet de ton sac pour l'expédier. Vente pendant la nuit.",
      width / 2,
      height * 0.17,
      { size: 3.2, align: "center", color: UI_COLORS.textDim },
    );

    const listW = u * 26;
    const listH = u * 9;
    const listX = (width - listW) / 2;
    const listY = height * 0.23;
    p.panel(listX, listY, listW, listH);
    if (contents.length === 0) {
      p.text("(vide)", width / 2, listY + listH / 2, {
        size: 3.6,
        align: "center",
        baseline: "middle",
        color: UI_COLORS.textDim,
      });
    } else {
      contents.slice(0, 8).forEach((entry, i) => {
        const cy = listY + u * 0.8 + i * u * 1.05;
        const def = itemDef(entry.id);
        p.icon(itemIcon(entry.id), listX + u * 0.8, cy - u * 0.1, u);
        p.text(`${def.name} x${entry.count}`, listX + u * 2.2, cy, { size: 3.2 });
        p.text(`${def.sellPrice * entry.count} po`, listX + listW - u * 0.8, cy, {
          size: 3.2,
          align: "right",
          color: UI_COLORS.accent,
        });
      });
    }
    p.text(`Total attendu : ${pending} po`, width / 2, listY + listH + u * 0.5, {
      size: 3.8,
      align: "center",
      color: UI_COLORS.good,
    });

    this.inventoryGrid(width, height, inventory, listY + listH + u * 2.4, "bin");
    p.text("Échap : fermer", width / 2, height * 0.93, {
      size: 3.2,
      align: "center",
      color: UI_COLORS.textDim,
    });
  }

  // ------------------------------------------------------------- boutique

  shop(
    width: number,
    height: number,
    inventory: Inventory,
    stock: readonly StockEntry[],
    money: number,
  ): void {
    const p = this.painter;
    const u = p.u;
    p.dim(width, height);
    p.text("Magasin général", width / 2, height * 0.08, {
      size: 5.5,
      align: "center",
      color: UI_COLORS.accent,
    });
    p.text(`Bourse : ${money} po`, width / 2, height * 0.15, {
      size: 3.6,
      align: "center",
      color: UI_COLORS.text,
    });

    const rowW = u * 26;
    const rowH = u * 2.2;
    const listX = (width - rowW) / 2;
    let y = height * 0.2;
    stock.forEach((entry, i) => {
      const def = itemDef(entry.id);
      const hot = this.region(`buy:${i}`, listX, y, rowW, rowH);
      p.panel(listX, y, rowW, rowH, hot);
      p.icon(itemIcon(entry.id), listX + u * 0.5, y + rowH * 0.15, rowH * 0.7);
      p.text(def.name, listX + u * 2.6, y + rowH / 2, { size: 3.4, baseline: "middle" });
      const affordable = money >= entry.price;
      p.text(`${entry.price} po`, listX + rowW - u * 0.7, y + rowH / 2, {
        size: 3.4,
        align: "right",
        baseline: "middle",
        color: affordable ? UI_COLORS.accent : UI_COLORS.bad,
      });
      y += rowH + u * 0.25;
    });

    p.text(
      "Clic gauche : acheter 1     Clic sur ton sac : vendre 1 (clic droit : tout)",
      width / 2,
      y + u * 0.6,
      { size: 3, align: "center", color: UI_COLORS.textDim },
    );
    this.inventoryGrid(width, height, inventory, y + u * 2.2, "sell");
  }

  // ------------------------------------------------------------- dialogue

  dialogue(width: number, height: number, name: string, text: string): void {
    const p = this.painter;
    const u = p.u;
    const boxW = Math.min(width - u * 4, u * 40);
    const boxH = u * 8;
    const x = (width - boxW) / 2;
    const y = height - boxH - u * 2;
    p.panel(x, y, boxW, boxH);
    p.text(name, x + u * 1.2, y + u * 0.9, { size: 4, color: UI_COLORS.accent, bold: true });
    p.wrapped(text, x + u * 1.2, y + u * 2.6, boxW - u * 2.4, 3.6);
    p.text("Entrée / clic pour continuer", x + boxW - u * 1.2, y + boxH - u * 1.2, {
      size: 3,
      align: "right",
      color: UI_COLORS.textDim,
    });
  }

  // ------------------------------------------------------------- bilan du soir

  sleepSummary(
    width: number,
    height: number,
    dateLabel: string,
    lines: readonly SaleLine[],
    total: number,
    exhausted: boolean,
  ): void {
    const p = this.painter;
    const u = p.u;
    p.dim(width, height, 0.82);
    const boxW = u * 24;
    const boxH = u * 20;
    const x = (width - boxW) / 2;
    const y = (height - boxH) / 2;
    p.panel(x, y, boxW, boxH);

    p.text(dateLabel, width / 2, y + u * 1.4, { size: 5, align: "center", color: UI_COLORS.accent });
    if (exhausted) {
      p.text("Tu t'es effondré de fatigue…", width / 2, y + u * 3.4, {
        size: 3.4,
        align: "center",
        color: UI_COLORS.bad,
      });
    }

    let ly = y + u * 5.2;
    if (lines.length === 0) {
      p.text("Rien d'expédié cette nuit.", width / 2, ly, {
        size: 3.4,
        align: "center",
        color: UI_COLORS.textDim,
      });
      ly += u * 1.4;
    } else {
      for (const line of lines.slice(0, 9)) {
        p.text(`${line.name} x${line.count}`, x + u * 1.6, ly, { size: 3.2 });
        p.text(`${line.value} po`, x + boxW - u * 1.6, ly, {
          size: 3.2,
          align: "right",
          color: UI_COLORS.accent,
        });
        ly += u * 1.2;
      }
    }

    p.text(`Recette : ${total} po`, width / 2, y + boxH - u * 5.4, {
      size: 4.4,
      align: "center",
      color: UI_COLORS.good,
    });
    this.button("sleep:next", "Jour suivant", x + u * 5, y + boxH - u * 3.6, boxW - u * 10, u * 2.6);
  }

  // ------------------------------------------------------------- pause

  pause(width: number, height: number, muted: boolean, saved: boolean): void {
    const p = this.painter;
    const u = p.u;
    p.dim(width, height, 0.7);
    const boxW = u * 16;
    const boxH = u * 17;
    const x = (width - boxW) / 2;
    const y = (height - boxH) / 2;
    p.panel(x, y, boxW, boxH);
    p.text("Pause", width / 2, y + u * 1.4, { size: 5, align: "center", color: UI_COLORS.accent });

    const bw = boxW - u * 4;
    const bh = u * 2.6;
    const bx = x + u * 2;
    let by = y + u * 4;
    this.button("pause:resume", "Reprendre", bx, by, bw, bh);
    by += bh + u * 0.6;
    this.button("pause:save", saved ? "Partie sauvegardée" : "Sauvegarder", bx, by, bw, bh);
    by += bh + u * 0.6;
    this.button("pause:sound", muted ? "Son : coupé" : "Son : activé", bx, by, bw, bh);
    by += bh + u * 0.6;
    this.button("pause:quit", "Menu principal", bx, by, bw, bh);
  }
}
