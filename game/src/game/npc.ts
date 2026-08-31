import type { MapId } from "../world/world";
import type { Facing } from "../render/sprites";

export interface Npc {
  id: string;
  name: string;
  map: MapId;
  tileX: number;
  tileY: number;
  facing: Facing;
  /** Une réplique différente par jour de la semaine. */
  lines: readonly string[];
  /** Ouvre la boutique quand on lui parle. */
  merchant: boolean;
}

export const NPCS: readonly Npc[] = [
  {
    id: "mira",
    name: "Mira",
    map: "shop",
    tileX: 8,
    tileY: 4,
    facing: "down",
    merchant: true,
    lines: [
      "Bienvenue au magasin général ! Les graines de saison sont sur le comptoir.",
      "Un conseil : arrose tes cultures tous les jours, sinon elles stagnent.",
      "La pluie arrose les champs à ta place. Profites-en pour couper du bois.",
      "Les melons rapportent gros, mais ils mettent longtemps à mûrir.",
      "Dépose tes récoltes dans la caisse d'expédition avant d'aller dormir.",
      "Hors saison, une plante meurt dans la nuit. Surveille le calendrier.",
      "Tu manques d'énergie ? Mange une récolte, ça remet d'aplomb.",
    ],
  },
];

export const npcsOnMap = (map: MapId): Npc[] => NPCS.filter((n) => n.map === map);

export const dialogueFor = (npc: Npc, day: number): string =>
  npc.lines[(day - 1) % npc.lines.length];
