// props.mjs — code-drawn, palette-aware metaphor objects for the illustration
// system. Every prop is a pure function `(args, pal) -> svgString`, authored in
// canvas coordinates and wrapped in a translate/scale group, so a scene is just
// a list of parts (SVG files) + props (these) placed back-to-front.
//
// The metaphor layer is what makes two heroes read as two different *ideas*:
// the AI post feeds organized knowledge into an assistant; the marketing post
// stands a public-facing surface on an organized brick foundation. Swapping
// these props — not recoloring one scene — is how topic drives composition.
//
// `pal` is a SERVICE_PALETTES entry (see palettes.mjs).

const r = (n) => Math.round(n * 100) / 100;

// Wrap authored-at-origin markup in a translate (+ optional uniform scale).
function g(x, y, s, inner) {
  const t = s && s !== 1 ? `translate(${r(x)},${r(y)}) scale(${s})` : `translate(${r(x)},${r(y)})`;
  return `<g transform="${t}">${inner}</g>`;
}

// ---- shared shape helpers ---------------------------------------------------

// A 4-point BDS sparkle (concave star) centred at (cx,cy).
export function sparkle(cx, cy, radius, color) {
  const k = radius * 0.34;
  return (
    `<path d="M ${cx} ${cy - radius} C ${cx + k} ${cy - k} ${cx + k} ${cy - k} ${cx + radius} ${cy} ` +
    `C ${cx + k} ${cy + k} ${cx + k} ${cy + k} ${cx} ${cy + radius} ` +
    `C ${cx - k} ${cy + k} ${cx - k} ${cy + k} ${cx - radius} ${cy} ` +
    `C ${cx - k} ${cy - k} ${cx - k} ${cy - k} ${cx} ${cy - radius} Z" fill="${color}"/>`
  );
}

// Classic three-dot speech bubble — kept for conversational scenes.
export function speechBubble({ x, y, s = 1 }, pal) {
  const dots = [0, 1, 2]
    .map((i) => `<circle cx="${40 + i * 40}" cy="62" r="9" fill="${pal.garmentLight}"/>`)
    .join('');
  const inner =
    `<rect x="0" y="0" width="200" height="120" rx="30" fill="${pal.ink}"/>` +
    `<path d="M 40 116 L 86 116 L 50 156 Z" fill="${pal.ink}"/>` +
    dots;
  return g(x, y, s, inner);
}

// Running-bond brick lines over a w×h area — the brand foundation motif.
// `mode: 'stroke'` draws faint mortar lines (for the blob motif); `'fill'`
// draws solid bricks separated by gaps (for a built foundation).
export function runningBond({ w, h, brickW = 84, brickH = 30, gap = 5 }, color, mode = 'stroke') {
  const rows = Math.ceil(h / (brickH + gap)) + 1;
  const out = [];
  for (let row = 0; row < rows; row++) {
    const yy = row * (brickH + gap);
    const offset = row % 2 ? -brickW / 2 : 0;
    for (let bx = offset; bx < w; bx += brickW + gap) {
      if (mode === 'fill') {
        out.push(
          `<rect x="${r(bx)}" y="${r(yy)}" width="${brickW}" height="${brickH}" rx="4" fill="${color}"/>`,
        );
      } else {
        out.push(
          `<rect x="${r(bx)}" y="${r(yy)}" width="${brickW}" height="${brickH}" rx="4" ` +
            `fill="none" stroke="${color}" stroke-width="2.5"/>`,
        );
      }
    }
  }
  return out.join('');
}

// ---- AI metaphor (post: "Before You Use AI…") -------------------------------

// An "assistant" card: a sparkle + a few generated-text bars. The AI itself.
export function aiPanel({ x, y, s = 1 }, pal) {
  const inner =
    `<rect x="0" y="0" width="270" height="176" rx="30" fill="${pal.canvas}" ` +
    `stroke="${pal.garmentMid}" stroke-width="4"/>` +
    sparkle(52, 54, 24, pal.garmentMid) +
    `<circle cx="88" cy="30" r="8" fill="${pal.garmentLight}"/>` +
    `<circle cx="30" cy="96" r="6" fill="${pal.garmentLight}"/>` +
    `<rect x="104" y="40" width="128" height="15" rx="7.5" fill="${pal.garmentLight}"/>` +
    `<rect x="104" y="70" width="96" height="15" rx="7.5" fill="${pal.sceneryLight}"/>` +
    `<rect x="44" y="118" width="182" height="15" rx="7.5" fill="${pal.garmentLight}"/>` +
    `<rect x="44" y="146" width="130" height="15" rx="7.5" fill="${pal.sceneryLight}"/>`;
  return g(x, y, s, inner);
}

// A stack of organized "knowledge cards" — the documented voice / process /
// FAQs the article says to hand the AI. Front card carries line detail.
export function knowledgeCards({ x, y, s = 1 }, pal) {
  const card = (dx, dy, detail) => {
    let c = `<rect x="${dx}" y="${dy}" width="156" height="104" rx="16" fill="${pal.canvas}" stroke="${pal.sceneryMid}" stroke-width="3.5"/>`;
    if (detail) {
      c +=
        `<rect x="${dx + 22}" y="${dy + 26}" width="88" height="12" rx="6" fill="${pal.sceneryMid}"/>` +
        `<rect x="${dx + 22}" y="${dy + 50}" width="112" height="12" rx="6" fill="${pal.sceneryLight}"/>` +
        `<rect x="${dx + 22}" y="${dy + 74}" width="70" height="12" rx="6" fill="${pal.sceneryLight}"/>`;
    }
    return c;
  };
  // back → front, stepped up-left so the stack reads as "organized".
  const inner = card(36, 0, false) + card(18, 20, false) + card(0, 40, true);
  return g(x, y, s, inner);
}

// A dotted connector — the organized info flowing into the assistant.
export function connector({ x1, y1, x2, y2, dots = 5 }, pal) {
  const out = [];
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - 70;
  for (let i = 0; i <= dots; i++) {
    const t = i / dots;
    // gentle upward arc via a quadratic control point
    const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    out.push(`<circle cx="${r(px)}" cy="${r(py)}" r="${r(6 + i * 0.6)}" fill="${pal.garmentMid}"/>`);
  }
  return out.join('');
}

// ---- marketing metaphor (post: "Why Your Marketing Isn't Working") ----------

// A solid, neatly-built brick foundation — the organized back office the
// article says the public face must stand on. cols×rows bricks, running bond.
export function brickFoundation({ x, y, cols = 5, rows = 3, s = 1 }, pal) {
  const brickW = 84;
  const brickH = 30;
  const gap = 5;
  const w = cols * (brickW + gap);
  const h = rows * (brickH + gap);
  const inner = runningBond({ w, h, brickW, brickH, gap }, pal.garmentMid, 'fill');
  // clip to a tidy rectangle so alternating rows don't jag past the edges
  const id = `fnd${Math.round(x)}${Math.round(y)}`;
  return g(
    x,
    y,
    s,
    `<clipPath id="${id}"><rect x="0" y="0" width="${r(w - gap)}" height="${r(h - gap)}" rx="6"/></clipPath>` +
      `<g clip-path="url(#${id})">${inner}</g>`,
  );
}

// A few loose bricks beside the foundation — the work of getting organized.
export function looseBricks({ x, y, s = 1 }, pal) {
  const brick = (bx, by, rot, fill) =>
    `<rect x="${bx}" y="${by}" width="84" height="30" rx="4" fill="${fill}" transform="rotate(${rot} ${bx + 42} ${by + 15})"/>`;
  const inner =
    brick(0, 40, -14, pal.garmentLight) +
    brick(70, 52, 8, pal.garmentLight) +
    brick(30, 0, -4, pal.sceneryLight);
  return g(x, y, s, inner);
}

// A megaphone — the outward-facing marketing surface. Tilted up-right.
export function megaphone({ x, y, s = 1 }, pal) {
  const inner =
    `<g transform="rotate(-14 70 75)">` +
    `<path d="M10 46 L84 20 L84 116 L10 92 Z" fill="${pal.garmentMid}"/>` +
    `<ellipse cx="84" cy="68" rx="12" ry="48" fill="${pal.garmentDark}"/>` +
    `<rect x="30" y="90" width="16" height="40" rx="6" fill="${pal.garmentDark}"/>` +
    `<path d="M104 40 Q124 68 104 96" fill="none" stroke="${pal.garmentMid}" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M124 24 Q156 68 124 112" fill="none" stroke="${pal.garmentLight}" stroke-width="7" stroke-linecap="round"/>` +
    `</g>`;
  return g(x, y, s, inner);
}

// A rising results chart — an alternate marketing/growth surface for the
// library (not every scene uses it, but the system supports an array).
export function trendChart({ x, y, s = 1 }, pal) {
  const pts = [
    [24, 120],
    [78, 86],
    [120, 98],
    [176, 40],
  ];
  const inner =
    `<rect x="0" y="0" width="220" height="150" rx="18" fill="${pal.canvas}" stroke="${pal.garmentMid}" stroke-width="4"/>` +
    `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${pal.garmentMid}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M158 40 L176 40 L176 58 Z" fill="${pal.garmentMid}"/>` +
    pts.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="6" fill="${pal.garmentDark}"/>`).join('');
  return g(x, y, s, inner);
}

// ---- character add-ons ------------------------------------------------------

// Hair cap authored in the seated figure's LOCAL coordinate space (viewBox
// 159×285, head crown ≈ x56–102 / y0–30). Returned markup is appended inside
// the character's placed <svg>, so it scales and mirrors with the figure.
// The seated "pavan" source is bald; the house style requires hair, and a
// contrasting warm brown keeps the head from melting into a same-hue blob.
export const SEATED_HAIR = (color = '#4a2d18') =>
  `<path d="M53 30 C48 4 68 -7 80 -6 C93 -7 110 3 105 30 C99 15 92 9 79 9 C64 9 58 17 53 30 Z" fill="${color}"/>`;

// Prop registry — concepts reference props by name.
export const PROPS = {
  sparkle: ({ cx, cy, r: rad = 18, color }, pal) => sparkle(cx, cy, rad, color ?? pal.garmentMid),
  speechBubble,
  aiPanel,
  knowledgeCards,
  connector,
  brickFoundation,
  looseBricks,
  megaphone,
  trendChart,
};
