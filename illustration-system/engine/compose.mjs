// compose.mjs — Brik illustration composition engine.
//
// Renders a hero illustration from a CONCEPT (engine/concepts.mjs): load the
// vetted part SVGs + code-drawn props each layer names, recolor parts to the
// concept's service-line palette, place everything back → front, emit one SVG.
//
// The engine holds no scene logic — a concept is data (which is what lets the
// topic→concept decision tree, or a CMS feature, produce one). People are real
// illustrator assets (humaaans, CC0), never AI-generated, so anatomy is right.
// See illustration-system/README.md.
//
// Usage:
//   node engine/compose.mjs <conceptKey> > out.svg
//   node engine/compose.mjs ai-readiness > examples/ai-readiness.svg

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { recolorMap, SERVICE_PALETTES } from './palettes.mjs';
import { PROPS, runningBond, SEATED_HAIR } from './props.mjs';
import { CONCEPTS } from './concepts.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PARTS = resolve(HERE, '..', 'parts');

const round = (n) => Math.round(n * 100) / 100;

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

// Place a recolored part as a nested <svg>, scaled, optionally mirrored on X
// (so characters can face inward). `overlayLocal` is extra markup drawn in the
// part's own coordinate space (e.g. a hair cap), so it scales/mirrors with it.
function placePart(rel, { x, y, scale = 1, flipX = false, overlayLocal = '' }, map) {
  const { w, h, viewBox, inner } = parseSvg(recolor(loadPart(rel), map));
  const W = w * scale;
  const H = h * scale;
  const nested = `<svg x="0" y="0" width="${round(W)}" height="${round(H)}" viewBox="${viewBox}" overflow="visible">${inner}${overlayLocal}</svg>`;
  if (flipX) {
    return `<g transform="translate(${round(x + W)},${round(y)}) scale(-1,1)">${nested}</g>`;
  }
  return `<g transform="translate(${round(x)},${round(y)})">${nested}</g>`;
}

// Place the organic blob backdrop, optionally with the faint running-bond
// brick motif (the brand foundation mark) clipped to the blob's own shape.
function placeBlob({ x, y, scale = 1, bricks = false }, map, pal) {
  const { w, h, viewBox, inner } = parseSvg(recolor(loadPart('scenery/blob-1.svg'), map));
  const W = w * scale;
  const H = h * scale;
  let motif = '';
  if (bricks) {
    const d = inner.match(/\sd="([^"]+)"/);
    if (d) {
      const id = `blob${Math.round(x)}-${Math.round(y)}`;
      const lines = runningBond({ w, h, brickW: 74, brickH: 30, gap: 4 }, pal.sceneryMid, 'stroke');
      // Brand motif, not a brick wall: barely-there mortar lines. The house
      // style calls for *subtle* bricks — an image model once drew a solid wall
      // here and it was rejected, so keep opacity low and the stroke hairline.
      motif =
        `<clipPath id="${id}"><path d="${d[1]}"/></clipPath>` +
        `<g clip-path="url(#${id})" opacity="0.09">${lines}</g>`;
    }
  }
  const nested = `<svg x="0" y="0" width="${round(W)}" height="${round(H)}" viewBox="${viewBox}" overflow="visible">${inner}${motif}</svg>`;
  return `<g transform="translate(${round(x)},${round(y)})">${nested}</g>`;
}

// ---- render -----------------------------------------------------------------

const CANVAS = { w: 1600, h: 900 };

function renderLayer(layer, map, pal) {
  switch (layer.kind) {
    case 'blob':
      return placeBlob(layer, map, pal);
    case 'part': {
      const overlayLocal = layer.hair === 'seated' ? SEATED_HAIR() : '';
      return placePart(layer.src, { ...layer, overlayLocal }, map);
    }
    case 'prop': {
      const prop = PROPS[layer.name];
      if (!prop) {
        throw new Error(`Unknown prop "${layer.name}". Known: ${Object.keys(PROPS).join(', ')}`);
      }
      return prop(layer.args ?? {}, pal);
    }
    default:
      throw new Error(`Unknown layer kind "${layer.kind}"`);
  }
}

export function compose(conceptKey) {
  const concept = CONCEPTS[conceptKey];
  if (!concept) {
    throw new Error(`Unknown concept "${conceptKey}". Known: ${Object.keys(CONCEPTS).join(', ')}`);
  }
  const pal = SERVICE_PALETTES[concept.serviceLine];
  if (!pal) {
    throw new Error(`Concept "${conceptKey}" uses unknown service line "${concept.serviceLine}".`);
  }
  const map = recolorMap(concept.serviceLine);
  const layers = concept.layers.map((l) => renderLayer(l, map, pal)).join('\n  ');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.w}" height="${CANVAS.h}" ` +
    `viewBox="0 0 ${CANVAS.w} ${CANVAS.h}">\n` +
    `  <rect width="${CANVAS.w}" height="${CANVAS.h}" fill="${pal.canvas}"/>\n  ${layers}\n</svg>\n`
  );
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const [conceptKey] = process.argv.slice(2);
  if (!conceptKey) {
    process.stderr.write(
      `usage: node compose.mjs <conceptKey>\n  concepts: ${Object.keys(CONCEPTS).join(', ')}\n`,
    );
    process.exit(1);
  }
  process.stdout.write(compose(conceptKey));
}
