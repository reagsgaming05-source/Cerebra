import type { Canvas, Ctx } from "./sprites";

export const UI_COLORS = {
  panel: "rgba(38, 27, 20, 0.94)",
  panelLight: "rgba(58, 42, 30, 0.94)",
  border: "#7a5533",
  borderLight: "#c9a978",
  text: "#f4ecd8",
  textDim: "#c3ad8c",
  accent: "#e8c25a",
  good: "#7fd06a",
  bad: "#e0655a",
  energy: "#7fd06a",
  energyLow: "#e0655a",
  water: "#5aa8e0",
} as const;

export interface TextOptions {
  size?: number;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  shadow?: boolean;
  bold?: boolean;
}

/**
 * Couche d'interface dessinée à la résolution native de l'écran
 * (le monde, lui, est rendu en basse résolution puis agrandi).
 */
export class Painter {
  scale = 3;

  constructor(public ctx: Ctx) {}

  setScale(cssHeight: number): void {
    this.scale = Math.max(2, Math.min(5, Math.round(cssHeight / 240)));
  }

  /** Unité de mise en page : tout le HUD est exprimé en multiples de `u`. */
  get u(): number {
    return this.scale * 4;
  }

  panel(x: number, y: number, w: number, h: number, light = false): void {
    const { ctx } = this;
    const b = Math.max(2, this.scale);
    ctx.fillStyle = light ? UI_COLORS.panelLight : UI_COLORS.panel;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = UI_COLORS.border;
    ctx.lineWidth = b;
    ctx.strokeRect(x + b / 2, y + b / 2, w - b, h - b);
    ctx.strokeStyle = UI_COLORS.borderLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + b + 0.5, y + b + 0.5, w - b * 2 - 1, h - b * 2 - 1);
  }

  text(str: string, x: number, y: number, options: TextOptions = {}): void {
    const { ctx } = this;
    const size = (options.size ?? 4) * this.scale;
    ctx.font = `${options.bold ? "bold " : ""}${size}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
    ctx.textAlign = options.align ?? "left";
    ctx.textBaseline = options.baseline ?? "top";
    if (options.shadow !== false) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillText(str, x + this.scale / 2, y + this.scale / 2);
    }
    ctx.fillStyle = options.color ?? UI_COLORS.text;
    ctx.fillText(str, x, y);
  }

  measure(str: string, size = 4): number {
    this.ctx.font = `${size * this.scale}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
    return this.ctx.measureText(str).width;
  }

  icon(sprite: Canvas, x: number, y: number, size: number): void {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(sprite, Math.round(x), Math.round(y), size, size);
  }

  bar(x: number, y: number, w: number, h: number, ratio: number, color: string): void {
    const { ctx } = this;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    const filled = Math.round(h * Math.max(0, Math.min(1, ratio)));
    ctx.fillRect(x + 1, y + h - filled + 1, w - 2, Math.max(0, filled - 2));
    ctx.strokeStyle = UI_COLORS.border;
    ctx.lineWidth = Math.max(2, this.scale);
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }

  /** Dessine un texte multi-ligne en coupant aux espaces. Retourne la hauteur occupée. */
  wrapped(str: string, x: number, y: number, maxWidth: number, size = 4, color = UI_COLORS.text): number {
    const words = str.split(" ");
    let line = "";
    let cursorY = y;
    const lineHeight = size * this.scale * 1.45;
    for (const word of words) {
      const candidate = line.length === 0 ? word : `${line} ${word}`;
      if (this.measure(candidate, size) > maxWidth && line.length > 0) {
        this.text(line, x, cursorY, { size, color });
        line = word;
        cursorY += lineHeight;
      } else {
        line = candidate;
      }
    }
    if (line.length > 0) {
      this.text(line, x, cursorY, { size, color });
      cursorY += lineHeight;
    }
    return cursorY - y;
  }

  dim(w: number, h: number, alpha = 0.55): void {
    this.ctx.fillStyle = `rgba(8, 6, 10, ${alpha})`;
    this.ctx.fillRect(0, 0, w, h);
  }
}
