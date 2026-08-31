const MAX_FRAME_SECONDS = 0.25;

/**
 * Boucle à pas fixe : la simulation avance par tranches constantes,
 * le rendu se fait une fois par frame avec un facteur d'interpolation.
 */
export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private running = false;

  constructor(
    private readonly step: number,
    private readonly update: (dt: number) => void,
    private readonly render: (alpha: number) => void,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.frame);

    // Un onglet remis au premier plan peut produire un delta énorme : on le borne
    // pour éviter la « spirale de la mort » (des dizaines de pas rattrapés d'un coup).
    const elapsed = Math.min((now - this.lastTime) / 1000, MAX_FRAME_SECONDS);
    this.lastTime = now;
    this.accumulator += elapsed;

    while (this.accumulator >= this.step) {
      this.update(this.step);
      this.accumulator -= this.step;
    }

    this.render(this.accumulator / this.step);
  };
}
