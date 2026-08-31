import { HOTBAR_SIZE, type Inventory } from "../game/inventory";
import { itemDef } from "../game/items";
import type { Player } from "../game/player";
import type { Clock } from "../game/time";
import { itemIcon } from "./icons";
import { Painter, UI_COLORS } from "./ui";

export interface Toast {
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

export const TOAST_DURATION = 1.6;

interface HotbarLayout {
  x: number;
  y: number;
  slot: number;
  step: number;
}

function hotbarLayout(painter: Painter, width: number, height: number): HotbarLayout {
  const u = painter.u;
  const slot = u * 2.4;
  const step = slot + u * 0.25;
  const barWidth = HOTBAR_SIZE * step - u * 0.25;
  return {
    x: Math.round((width - barWidth) / 2),
    y: Math.round(height - slot - u * 1.2),
    slot,
    step,
  };
}

/** Emplacement de la barre rapide sous le curseur, ou null si le clic vise le monde. */
export function hotbarSlotAt(
  painter: Painter,
  width: number,
  height: number,
  mx: number,
  my: number,
): number | null {
  const { x, y, slot, step } = hotbarLayout(painter, width, height);
  if (my < y || my > y + slot) return null;
  const index = Math.floor((mx - x) / step);
  if (index < 0 || index >= HOTBAR_SIZE) return null;
  return mx <= x + index * step + slot ? index : null;
}

export function drawHud(
  painter: Painter,
  width: number,
  height: number,
  player: Player,
  inventory: Inventory,
  clock: Clock,
): void {
  const u = painter.u;
  const { x: barX, y: barY, slot, step } = hotbarLayout(painter, width, height);

  // --- barre rapide
  for (let i = 0; i < HOTBAR_SIZE; i++) {
    const x = barX + i * step;
    const isSelected = inventory.selected === i;
    painter.panel(x, barY, slot, slot, isSelected);
    if (isSelected) {
      painter.ctx.strokeStyle = UI_COLORS.accent;
      painter.ctx.lineWidth = Math.max(2, painter.scale);
      painter.ctx.strokeRect(x + 1, barY + 1, slot - 2, slot - 2);
    }
    const entry = inventory.slots[i];
    if (entry) {
      painter.icon(itemIcon(entry.id), x + slot * 0.15, barY + slot * 0.15, slot * 0.7);
      if (entry.count > 1) {
        painter.text(String(entry.count), x + slot - u * 0.3, barY + slot - u * 0.35, {
          size: 3,
          align: "right",
          baseline: "bottom",
          color: UI_COLORS.text,
        });
      }
    }
    painter.text(String(i === 9 ? 0 : i < 9 ? i + 1 : i === 10 ? "-" : "="), x + u * 0.25, barY + u * 0.2, {
      size: 2.5,
      color: UI_COLORS.textDim,
    });
  }

  // --- nom de l'objet tenu
  const held = inventory.held;
  if (held) {
    painter.text(itemDef(held.id).name, width / 2, barY - u * 0.9, {
      size: 3.5,
      align: "center",
      color: UI_COLORS.accent,
    });
  }

  // --- horloge et bourse
  const boxW = u * 14;
  const boxH = u * 4.4;
  const boxX = width - boxW - u * 0.8;
  const boxY = u * 0.8;
  painter.panel(boxX, boxY, boxW, boxH);
  painter.text(clock.dateLabel(), boxX + u * 0.8, boxY + u * 0.7, {
    size: 3.2,
    color: UI_COLORS.textDim,
  });
  if (clock.raining) {
    painter.text("pluie", boxX + boxW - u * 0.8, boxY + u * 0.7, {
      size: 3.2,
      align: "right",
      color: UI_COLORS.water,
    });
  }
  painter.text(clock.timeLabel(), boxX + u * 0.8, boxY + u * 2, {
    size: 5,
    color: UI_COLORS.text,
    bold: true,
  });
  painter.text(`${player.money} po`, boxX + boxW - u * 0.8, boxY + u * 2.5, {
    size: 3.8,
    align: "right",
    color: UI_COLORS.accent,
  });

  // --- jauges énergie et eau
  const gaugeW = u * 1.4;
  const gaugeH = u * 9;
  const gaugeX = width - gaugeW - u * 0.8;
  const gaugeY = boxY + boxH + u * 0.6;
  const ratio = player.energy / player.maxEnergy;
  painter.bar(gaugeX, gaugeY, gaugeW, gaugeH, ratio, ratio < 0.25 ? UI_COLORS.energyLow : UI_COLORS.energy);
  painter.text(String(Math.ceil(player.energy)), gaugeX + gaugeW / 2, gaugeY + gaugeH + u * 0.2, {
    size: 2.8,
    align: "center",
    color: UI_COLORS.textDim,
  });

  const canX = gaugeX - gaugeW - u * 0.4;
  painter.bar(canX, gaugeY + gaugeH * 0.35, gaugeW, gaugeH * 0.65, player.water / player.waterMax, UI_COLORS.water);
}

export function drawToasts(
  painter: Painter,
  toasts: readonly Toast[],
  toScreen: (x: number, y: number) => { x: number; y: number },
): void {
  for (const toast of toasts) {
    const t = 1 - toast.life / TOAST_DURATION;
    const { x, y } = toScreen(toast.x, toast.y - t * 14);
    painter.ctx.globalAlpha = Math.min(1, toast.life / 0.4);
    painter.text(toast.text, x, y, { size: 3.2, align: "center", color: toast.color });
    painter.ctx.globalAlpha = 1;
  }
}
