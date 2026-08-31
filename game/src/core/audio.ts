type SfxName =
  | "hoe"
  | "water"
  | "chop"
  | "mine"
  | "cut"
  | "plant"
  | "harvest"
  | "pickup"
  | "coin"
  | "select"
  | "cancel"
  | "sleep"
  | "levelup"
  | "bump";

/**
 * Toute la bande-son est synthétisée à l'exécution : aucun fichier audio à embarquer.
 * Le contexte n'est créé qu'à la première interaction, comme l'exigent les navigateurs.
 */
export class Audio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;

  sfxVolume = 0.5;
  musicVolume = 0.28;
  muted = false;

  /** Doit être appelé depuis un geste utilisateur (clic ou touche). */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 1;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicVolume;
    this.musicGain.connect(this.master);

    const length = Math.floor(this.ctx.sampleRate * 0.4);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buffer;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    freqEnd?: number,
  ): void {
    if (!this.ctx || !this.master || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume * this.sfxVolume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private noise(duration: number, volume: number, filterFreq: number, sweepTo?: number): void {
    if (!this.ctx || !this.master || !this.noiseBuffer || this.muted) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(filterFreq, now);
    if (sweepTo !== undefined) filter.frequency.exponentialRampToValueAtTime(Math.max(40, sweepTo), now + duration);
    filter.Q.value = 1.1;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  play(name: SfxName): void {
    switch (name) {
      case "hoe":
        this.noise(0.16, 0.5, 900, 300);
        break;
      case "water":
        this.noise(0.45, 0.32, 1800, 700);
        break;
      case "chop":
        this.noise(0.2, 0.6, 420, 160);
        this.tone(180, 0.14, "triangle", 0.25, 90);
        break;
      case "mine":
        this.noise(0.14, 0.55, 2600, 1200);
        this.tone(320, 0.1, "square", 0.16, 180);
        break;
      case "cut":
        this.noise(0.13, 0.4, 3200, 1400);
        break;
      case "plant":
        this.tone(520, 0.09, "sine", 0.22, 700);
        break;
      case "harvest":
        this.tone(620, 0.08, "sine", 0.24);
        this.tone(880, 0.12, "sine", 0.2);
        break;
      case "pickup":
        this.tone(760, 0.07, "square", 0.16, 980);
        break;
      case "coin":
        this.tone(980, 0.07, "square", 0.18);
        this.tone(1320, 0.12, "square", 0.14);
        break;
      case "select":
        this.tone(660, 0.05, "square", 0.12);
        break;
      case "cancel":
        this.tone(340, 0.08, "square", 0.12, 220);
        break;
      case "sleep":
        this.tone(300, 0.5, "sine", 0.2, 140);
        break;
      case "levelup":
        [523, 659, 784, 1047].forEach((f, i) => {
          window.setTimeout(() => this.tone(f, 0.22, "triangle", 0.22), i * 90);
        });
        break;
      case "bump":
        this.tone(140, 0.06, "square", 0.1, 90);
        break;
    }
  }

  /** Boucle mélodique douce, une note toutes les 380 ms. */
  startMusic(): void {
    if (!this.ctx || !this.musicGain || this.musicTimer !== null) return;
    const scale = [0, 2, 4, 7, 9, 12, 14, 16];
    const root = 220;
    this.musicTimer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.muted) return;
      const step = this.musicStep++;
      const degree = scale[(step * 3 + Math.floor(step / 8)) % scale.length];
      const freq = root * Math.pow(2, degree / 12);
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = step % 4 === 0 ? "triangle" : "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc.connect(gain).connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.6);
    }, 380);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  setMusicVolume(v: number): void {
    this.musicVolume = v;
    if (this.musicGain) this.musicGain.gain.value = v;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    return this.muted;
  }
}
