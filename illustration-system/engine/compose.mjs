// compose.mjs — Brik illustration composition engine.
//
// Assembles a hero illustration by code: load humaaans/scenery part SVGs,
// recolor them to a BDS service-line palette, place them on a canvas with
// code-drawn props (blob backdrop, speech bubble, sparkles), emit one SVG.
//
// People are real illustrator assets (humaaans, CC0) — never AI-generated —
// so faces/anatomy are always right. See illustration-system/README.md.
//
// Usage:
//   node engine/compose.mjs <scene> [serviceLine] > out.svg
//   node engine/compose.mjs marketing-convo marketing > examples/marketing.svg
//
// Scenes are defined in SCENES below; serviceLine overrides the scene default.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { recolorMap, SERVICE_PALETTES } from './palettes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PARTS = resolve(HERE, '..', 'parts');

// ---- part loading + recolor -------------------------------------------------

const partCache = new Map();
function loadPart(rel) {
  if (!partCache.has(rel)) {
    partCache.set(rel, readFileSync(resolve(PARTS, rel), 'utf8'));
  }
  return partCache.get(rel);
}

// Replace every `fill="#hex"` per the recolor map (case-insensitive).
// Hexes absent from the map (skin, hair, accent) are left untouched.
function recolor(svg, map) {
  return svg.replace(/fill="#([0-9a-fA-F]{6})"/g, (m, hex) => {
    const to = map[hex.toLowerCase()];
    return to ? `fill="#${to}"` : m;
  });
}

// Pull width/height/viewBox + inner markup out of a part SVG.
function parseSvg(svg) {
  const open = svg.match(/<svg\b[^>]*>/i)[0];
  const num = (attr) => {
    const m = open.match(new RegExp(`${attr}="([\\d.]+)"`, 'i'));
    return m ? parseFloat(m[1]) : null;
  };
  const vbMatch = open.match(/viewBox="([^"]+)"/i);
  let w = num('width');
  let h = num('height');
  let viewBox = vbMatch ? vbMatch[1] : null;
  if (!viewBox && w && h) viewBox = `0 0 ${w} ${h}`;
  if ((!w || !h) && viewBox) {
    const p = viewBox.split(/\s+/).map(Number);
    w = w || p[2];
    h = h || p[3];
  }
  const inner = svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'));
  return { w, h, viewBox, inner };
}

// Place a recolored part as a nested <svg>, scaled to `scale`, optionally
// mirrored on X (so characters can face inward).
function placePart(rel, { x, y, scale = 1, flipX = false }, map) {
  const { w, h, viewBox, inner } = parseSvg(recolor(loadPart(rel), map));
  const W = w * scale;
  const H = h * scale;
  const nested = `<svg x="0" y="0" width="${round(W)}" height="${round(H)}" viewBox="${viewBox}" overflow="visible">${inner}</svg>`;
  if (flipX) {
    return `<g transform="translate(${round(x + W)},${round(y)}) scale(-1,1)">${nested}</g>`;
  }
  return `<g transform="translate(${round(x)},${round(y)})">${nested}</g>`;
}

const round = (n) => Math.round(n * 100) / 100;

// ---- code-drawn props -------------------------------------------------------

function speechBubble(x, y, { ink, dot }) {
  const dots = [0, 1, 2]
    .map((i) => `<circle cx="${x + 40 + i * 40}" cy="${y + 62}" r="9" fill="${dot}"/>`)
    .join('');
  return (
    `<rect x="${x}" y="${y}" width="200" height="120" rx="30" fill="${ink}"/>` +
    `<path d="M ${x + 40} ${y + 116} L ${x + 86} ${y + 116} L ${x + 50} ${y + 156} Z" fill="${ink}"/>` +
    dots
  );
}

function sparkle(cx, cy, r, color) {
  const k = r * 0.34;
  return (
    `<path d="M ${cx} ${cy - r} C ${cx + k} ${cy - k} ${cx + k} ${cy - k} ${cx + r} ${cy} ` +
    `C ${cx + k} ${cy + k} ${cx + k} ${cy + k} ${cx} ${cy + r} ` +
    `C ${cx - k} ${cy + k} ${cx - k} ${cy + k} ${cx - r} ${cy} ` +
    `C ${cx - k} ${cy - k} ${cx - k} ${cy - k} ${cx} ${cy - r} Z" fill="${color}"/>`
  );
}

// ---- scenes -----------------------------------------------------------------
// Each scene is a function (palette) -> array of SVG layer strings, back→front.

const CANVAS = { w: 1600, h: 900 };

const SCENES = {
  // Two people in conversation — for marketing / brand editorial heroes.
  'two-person-convo': (pal, map) => [
    placePart('scenery/blob-1.svg', { x: 350, y: 130, scale: 2.9 }, map),
    placePart('scenery/plant-right.svg', { x: 120, y: 560, scale: 0.8 }, map),
    placePart('characters/standing-a.svg', { x: 360, y: 300, scale: 1.25 }, map),
    placePart('characters/standing-b.svg', { x: 980, y: 320, scale: 1.7, flipX: true }, map),
    speechBubble(690, 170, { ink: pal.ink, dot: pal.garmentLight }),
    sparkle(640, 170, 22, pal.garmentAccent),
    sparkle(920, 450, 16, pal.garmentAccent),
    sparkle(560, 480, 14, pal.garmentAccent),
  ],

  // Single person at work, blob backdrop + plant — for topical/solo heroes.
  'person-at-work': (pal, map) => [
    placePart('scenery/blob-1.svg', { x: 430, y: 150, scale: 2.7 }, map),
    placePart('scenery/plant-left.svg', { x: 150, y: 430, scale: 0.85 }, map),
    placePart('characters/standing-a.svg', { x: 640, y: 300, scale: 1.3 }, map),
    speechBubble(900, 200, { ink: pal.ink, dot: pal.garmentLight }),
    sparkle(560, 250, 20, pal.garmentAccent),
    sparkle(1180, 360, 15, pal.garmentAccent),
  ],
};

// ---- render -----------------------------------------------------------------

export function compose(scene, serviceLine) {
  const build = SCENES[scene];
  if (!build) {
    throw new Error(`Unknown scene "${scene}". Known: ${Object.keys(SCENES).join(', ')}`);
  }
  const pal = SERVICE_PALETTES[serviceLine];
  if (!pal) {
    throw new Error(`Unknown service line "${serviceLine}". Known: ${Object.keys(SERVICE_PALETTES).join(', ')}`);
  }
  const map = recolorMap(serviceLine);
  const layers = build(pal, map).join('\n  ');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.w}" height="${CANVAS.h}" ` +
    `viewBox="0 0 ${CANVAS.w} ${CANVAS.h}">\n` +
    `  <rect width="${CANVAS.w}" height="${CANVAS.h}" fill="${pal.canvas}"/>\n  ${layers}\n</svg>\n`
  );
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const [scene, serviceLine] = process.argv.slice(2);
  if (!scene) {
    process.stderr.write(
      `usage: node compose.mjs <scene> [serviceLine]\n` +
        `  scenes: ${Object.keys(SCENES).join(', ')}\n` +
        `  service lines: ${Object.keys(SERVICE_PALETTES).join(', ')}\n`,
    );
    process.exit(1);
  }
  process.stdout.write(compose(scene, serviceLine || 'marketing'));
}
