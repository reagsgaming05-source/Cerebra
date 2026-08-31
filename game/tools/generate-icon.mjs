// Génère l'icône de l'application (PNG 512x512) sans dépendance externe :
// on dessine une grille 32x32 de pixels, puis on l'encode à la main.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const GRID = 32;
const SCALE = 16;
const SIZE = GRID * SCALE;

const C = {
  _: null,
  b: "#2f4a24", // fond sombre
  B: "#3f6b2f", // fond clair
  s: "#7cb650", // tige
  l: "#a8d86a", // feuille claire
  d: "#5b8f3a", // feuille sombre
  g: "#e8c25a", // épi doré
  o: "#c9932f", // ombre de l'épi
  t: "#8a5a2b", // terre
};

// Chaque ligne fait 32 caractères : l'icône est lisible directement dans le code.
const ART = [
  "________________________________",
  "__bbbbbbbbbbbbbbbbbbbbbbbbbbbb__",
  "_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb_",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "bbBBBBBBBBBBBBBBBBBBBBBBBBBBBBbb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBggBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBgggoBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBgggoBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBggggooBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBggggooBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBgggoBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBssBBBBBBBBBBBBBBBBb",
  "bBBBBBBBlllBBssBBdddBBBBBBBBBBBb",
  "bBBBBBlllllBssBBdddddBBBBBBBBBBb",
  "bBBBBlllllBBssBBBdddddBBBBBBBBBb",
  "bBBBBlllllBBssBBBdddddBBBBBBBBBb",
  "bBBBBBlllllBssBBdddddBBBBBBBBBBb",
  "bBBBBBBBlllBssBBdddBBBBBBBBBBBBb",
  "bBBBBBBBBBBBssBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBssBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBssBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBssBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBssBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBssBBBBBBBBBBBBBBBBBb",
  "bttttttttttttttttttttttttttttttb",
  "bttttttttttttttttttttttttttttttb",
  "bttttttttttttttttttttttttttttttb",
  "bbtttttttttttttttttttttttttttbbb",
  "_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb_",
  "__bbbbbbbbbbbbbbbbbbbbbbbbbbbb__",
  "________________________________",
];

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const pixels = Buffer.alloc(SIZE * SIZE * 4);
for (let gy = 0; gy < GRID; gy++) {
  const row = ART[gy] ?? "";
  for (let gx = 0; gx < GRID; gx++) {
    const hex = C[row[gx] ?? "_"] ?? null;
    const rgb = hex ? hexToRgb(hex) : [0, 0, 0];
    const alpha = hex ? 255 : 0;
    for (let sy = 0; sy < SCALE; sy++) {
      for (let sx = 0; sx < SCALE; sx++) {
        const offset = ((gy * SCALE + sy) * SIZE + gx * SCALE + sx) * 4;
        pixels[offset] = rgb[0];
        pixels[offset + 1] = rgb[1];
        pixels[offset + 2] = rgb[2];
        pixels[offset + 3] = alpha;
      }
    }
  }
}

// Chaque ligne d'un PNG est préfixée par son octet de filtre (0 = aucun).
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0;
  pixels.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // profondeur
ihdr[9] = 6; // RVBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = process.argv[2] ?? "src-tauri/icons/icon.png";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log(`Icône écrite : ${out} (${SIZE}x${SIZE})`);
