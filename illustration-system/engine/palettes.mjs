// palettes.mjs — BDS service-line palettes + the recolor model for the
// illustration system. Colors are the real ramps from dist/tokens.css
// (--color-green-* / --color-orange-*). Never invent token values here.
//
// Recolor model: every source part (humaaans figure, plant, blob) is authored
// in a fixed palette. We map each source hex to a semantic ROLE, then map the
// role to a per-service-line hex. Skin, hair and one warm accent are PRESERVED
// (never recolored) so characters stay human across every service line.

// Source part hex -> semantic role. Lowercase, no '#'.
export const SOURCE_ROLE = {
  // clothing / garments (humaaans)
  dde3e9: 'garmentLight',
  c5cfd6: 'garmentLight',
  a9b1b6: 'garmentMid',
  '2b363c': 'garmentDark',
  '191847': 'garmentDark',
  '323337': 'garmentDark',
  '2f3676': 'garmentAccent',
  // seated figure (pavan) navy garments
  '092330': 'garmentDark',
  '0c2c40': 'garmentDark',
  '1f252a': 'garmentDark',
  // scenery (plants / blob backdrop)
  '69a1ac': 'sceneryMid',
  '89c5cc': 'sceneryLight',
  c1dee2: 'sceneryLightest',
  f1f0ec: 'backdrop',
  bcff8c: 'sceneryLight', // pendant-lamp shade (green-authored source)
};

// Preserved across all service lines: skin tones, hair, warm accent props,
// and neutral devices (laptop grey). Kept literal so characters stay human
// and accents stay warm in every service hue.
export const PRESERVE = new Set([
  'b28b67', '613a25', '784931', // standing figures: skin + hair
  'f4be9a', 'fcc9a7', 'f7ebe7', 'fff7f3', // seated figure: skin tones + highlight
  'f4d364', 'c1a443', 'ffecac', // warm yellow accent (sweater)
  'b2b2b2', // laptop / device grey
]);

// service line -> role -> hex. Stops chosen per family for equivalent
// lightness/contrast (the BDS green and orange ramps are distributed
// differently, so we can't map by token-name symmetry).
export const SERVICE_PALETTES = {
  // marketing = green family
  marketing: {
    garmentLight: '#bcff8c', // green-light
    garmentMid: '#9ada6c', //   green-dark
    garmentDark: '#2a5542', //   green-darkest
    garmentAccent: '#71a74a', // green-darker
    sceneryMid: '#71a74a',
    sceneryLight: '#9ada6c',
    sceneryLightest: '#daffc0', // green-lighter
    backdrop: '#daffc0',
    canvas: '#f8fff3', //         green-lightest
    ink: '#2a5542',
  },
  // back-office = orange family
  'back-office': {
    garmentLight: '#ffad92', //  orange-lighter
    garmentMid: '#e76134', //    orange-light
    garmentDark: '#3f1000', //   orange-darkest
    garmentAccent: '#b4411a', // orange-dark
    sceneryMid: '#b4411a',
    sceneryLight: '#e76134',
    sceneryLightest: '#ffe8dc', // orange-lightest
    backdrop: '#ffe8dc',
    canvas: '#fff7f3',
    ink: '#3f1000',
  },
};

// Build a flat { sourceHex: targetHex } recolor map for one service line.
// Preserved hexes are intentionally absent (left untouched by the recolorer).
export function recolorMap(serviceLine) {
  const pal = SERVICE_PALETTES[serviceLine];
  if (!pal) {
    throw new Error(
      `Unknown service line "${serviceLine}". Known: ${Object.keys(SERVICE_PALETTES).join(', ')}`,
    );
  }
  const map = {};
  for (const [hex, role] of Object.entries(SOURCE_ROLE)) {
    const target = pal[role];
    if (target) map[hex] = target.replace('#', '').toLowerCase();
  }
  return map;
}
