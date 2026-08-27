/**
 * The 2D-canvas half of AmbientField — a drifting particle field.
 *
 * Kept out of the component file because it is imperative canvas work with no
 * React in it, and because the reduced-motion contract is easier to read (and
 * to test) when "paint one frame" and "keep painting" are the same code path
 * called a different number of times.
 */

export interface ParticleFieldOptions {
  /** How many particles to draw. Cost is linear. */
  particleCount: number;
  /**
   * Keep animating. When `false` the field paints exactly ONE frame and never
   * schedules `requestAnimationFrame` — the reduced-motion poster frame. It is
   * deliberately not "draw nothing": a reader who asked for less motion still
   * gets the composition, just still.
   */
  animate: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/**
 * Deterministic pseudo-random source.
 *
 * `Math.random()` would make the poster frame differ between the server-adjacent
 * first paint and any later repaint, and would make a screenshot test flap. A
 * fixed seed means the still frame a reduced-motion reader sees is the same
 * composition every time.
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createParticles(
  count: number,
  width: number,
  height: number,
): Particle[] {
  const random = seededRandom(0x5eed);
  return Array.from({ length: count }, () => ({
    x: random() * width,
    y: random() * height,
    // Slow drift. Fast enough to read as alive over several seconds, slow
    // enough that it never competes with the content in front of it.
    vx: (random() - 0.5) * 0.18,
    vy: (random() - 0.5) * 0.18,
    r: 0.6 + random() * 1.6,
  }));
}

/**
 * Paints the field into `canvas` and returns a teardown function.
 *
 * The teardown cancels any pending frame and disconnects the resize observer,
 * so an unmount mid-animation leaves nothing scheduled. Colour comes from the
 * canvas's own computed `color`, which AmbientField.css binds to
 * `--bds-bg-field-particle` — the canvas 2D context cannot read a custom
 * property, so the one value that must cross from CSS into JS crosses through
 * an inherited property instead of being hardcoded here.
 */
export function paintParticleField(
  canvas: HTMLCanvasElement,
  { particleCount, animate }: ParticleFieldOptions,
): () => void {
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  let frame = 0;
  let particles: Particle[] = [];
  let width = 0;
  let height = 0;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (width === 0 || height === 0) return false;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = createParticles(particleCount, width, height);
    return true;
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = window.getComputedStyle(canvas).color;
    for (const particle of particles) {
      context.beginPath();
      context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fill();
    }
  };

  const step = () => {
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      // Wrap rather than bounce: a bounce reads as a boundary, which draws the
      // eye to the edge of a layer that is supposed to be ambient.
      if (particle.x < 0) particle.x += width;
      else if (particle.x > width) particle.x -= width;
      if (particle.y < 0) particle.y += height;
      else if (particle.y > height) particle.y -= height;
    }
    draw();
    frame = window.requestAnimationFrame(step);
  };

  const start = () => {
    if (!resize()) return;
    if (animate) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(step);
    } else {
      draw();
    }
  };

  start();

  // The field is `inset: 0` inside a container it does not control, so its box
  // is whatever the parent section resolves to — which is not known at mount
  // and changes on every viewport change.
  const observer =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(start);
  observer?.observe(canvas);

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    observer?.disconnect();
  };
}
