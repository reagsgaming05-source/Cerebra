import type { Season } from "../world/crops";

export const SEASONS: readonly Season[] = ["printemps", "ete", "automne", "hiver"];
export const DAYS_PER_SEASON = 28;

const DAY_START = 6 * 60;
/** 2 h du matin : au-delà, le personnage s'effondre de fatigue. */
const DAY_END = 26 * 60;
const MINUTES_PER_TICK = 10;
const SECONDS_PER_TICK = 0.85;

const SEASON_LABEL: Record<Season, string> = {
  printemps: "Printemps",
  ete: "Été",
  automne: "Automne",
  hiver: "Hiver",
};

export class Clock {
  minutes = DAY_START;
  day = 1;
  seasonIndex = 0;
  year = 1;
  raining = false;
  private accumulator = 0;

  get season(): Season {
    return SEASONS[this.seasonIndex];
  }

  get isPastMidnight(): boolean {
    return this.minutes >= DAY_END;
  }

  /** Avance l'horloge. Retourne true si la limite de 2 h vient d'être franchie. */
  tick(dt: number): boolean {
    if (this.minutes >= DAY_END) return false;
    this.accumulator += dt;
    let crossed = false;
    while (this.accumulator >= SECONDS_PER_TICK) {
      this.accumulator -= SECONDS_PER_TICK;
      this.minutes += MINUTES_PER_TICK;
      if (this.minutes >= DAY_END) {
        this.minutes = DAY_END;
        crossed = true;
        break;
      }
    }
    return crossed;
  }

  nextDay(rainRoll: number): void {
    this.minutes = DAY_START;
    this.accumulator = 0;
    this.day += 1;
    if (this.day > DAYS_PER_SEASON) {
      this.day = 1;
      this.seasonIndex = (this.seasonIndex + 1) % SEASONS.length;
      if (this.seasonIndex === 0) this.year += 1;
    }
    // Il pleut plus souvent au printemps, jamais en hiver (il neige, sans arrosage).
    const chance = this.season === "printemps" ? 0.28 : this.season === "hiver" ? 0 : 0.18;
    this.raining = rainRoll < chance;
  }

  timeLabel(): string {
    const total = this.minutes % (24 * 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  }

  dateLabel(): string {
    return `${SEASON_LABEL[this.season]} ${this.day} — An ${this.year}`;
  }

  /** 0 = plein jour, 1 = nuit noire. Sert à teinter le rendu. */
  darkness(): number {
    const dusk = 18 * 60;
    const night = 23 * 60;
    if (this.minutes <= dusk) return this.raining ? 0.18 : 0;
    const t = Math.min((this.minutes - dusk) / (night - dusk), 1);
    return Math.max(this.raining ? 0.18 : 0, t * 0.62);
  }

  serialize() {
    return {
      minutes: this.minutes,
      day: this.day,
      seasonIndex: this.seasonIndex,
      year: this.year,
      raining: this.raining,
    };
  }

  load(data: ReturnType<Clock["serialize"]>): void {
    this.minutes = data.minutes;
    this.day = data.day;
    this.seasonIndex = data.seasonIndex;
    this.year = data.year;
    this.raining = data.raining;
    this.accumulator = 0;
  }
}
