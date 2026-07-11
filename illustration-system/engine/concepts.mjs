// concepts.mjs — the decision-tree output, encoded as data.
//
// A CONCEPT is one editorial idea expressed as a scene: a service line (which
// drives *only* colour) plus an ordered list of layers (back → front). Each
// layer is either a `part` (a vetted SVG from parts/ — people, plants, blob)
// or a `prop` (a code-drawn metaphor object from props.mjs). The engine
// (compose.mjs) reads this and renders — it holds no scene logic itself.
//
// This is the seam the program is built around: the topic → concept mapping
// (P2 in the roadmap) produces one of these objects; a CMS "generate
// illustration" feature (P5) would too. Two posts read as two different ideas
// because they select different layers, not because one scene was recoloured.
//
// Layer shapes:
//   { kind: 'blob',  x, y, scale, bricks }          — organic backdrop (+ motif)
//   { kind: 'part',  src, x, y, scale, flipX, hair } — a vetted SVG part
//   { kind: 'prop',  name, args }                    — a props.mjs object
// `args` for props are passed through verbatim (canvas coords).

export const CONCEPTS = {
  // ── "Before You Use AI in Your Business, Read This" ──────────────────────
  // Message: AI underperforms without YOUR organized business info. Fix =
  // document voice/process/FAQs and feed that in. Concept: a person at a
  // laptop feeding a stack of organized knowledge cards into an AI assistant.
  // Service line: back-office (orange).
  'ai-readiness': {
    title: 'Before You Use AI in Your Business',
    serviceLine: 'back-office',
    layers: [
      { kind: 'blob', x: 470, y: 140, scale: 2.7, bricks: true },
      { kind: 'part', src: 'scenery/plant-right.svg', x: 120, y: 540, scale: 0.9 },
      { kind: 'part', src: 'scenery/pendant-lamp.svg', x: 1180, y: 40, scale: 1.15 },
      { kind: 'part', src: 'characters/seated-laptop.svg', x: 560, y: 360, scale: 1.75, hair: 'seated' },
      { kind: 'prop', name: 'knowledgeCards', args: { x: 300, y: 470, s: 1 } },
      { kind: 'prop', name: 'connector', args: { x1: 470, y1: 500, x2: 1040, y2: 300 } },
      { kind: 'prop', name: 'aiPanel', args: { x: 1000, y: 190, s: 1 } },
      { kind: 'prop', name: 'sparkle', args: { cx: 940, cy: 150, r: 16 } },
      { kind: 'prop', name: 'sparkle', args: { cx: 560, cy: 300, r: 12 } },
    ],
  },

  // ── "Why Your Marketing Isn't Working (And It's Not Your Agency's Fault)" ─
  // Message: marketing fails when the back-office foundation is chaotic. Fix =
  // back office first, public face second. Concept: a person presenting an
  // outward-facing marketing surface (megaphone) that stands on a solid,
  // organized brick foundation, with a few loose bricks still being placed.
  // Service line: marketing (green) — per direction, this post is retagged
  // marketing so the palette differentiates it from the AI (orange) hero.
  'marketing-foundation': {
    title: "Why Your Marketing Isn't Working",
    serviceLine: 'marketing',
    layers: [
      { kind: 'blob', x: 430, y: 130, scale: 2.7, bricks: true },
      { kind: 'part', src: 'scenery/plant-left.svg', x: 130, y: 470, scale: 0.85 },
      { kind: 'prop', name: 'brickFoundation', args: { x: 560, y: 610, cols: 5, rows: 3 } },
      { kind: 'prop', name: 'looseBricks', args: { x: 1090, y: 640, s: 1 } },
      { kind: 'part', src: 'characters/standing-a.svg', x: 470, y: 300, scale: 1.3 },
      { kind: 'prop', name: 'megaphone', args: { x: 820, y: 300, s: 1.1 } },
      { kind: 'prop', name: 'sparkle', args: { cx: 1030, cy: 300, r: 18 } },
      { kind: 'prop', name: 'sparkle', args: { cx: 720, cy: 250, r: 12 } },
    ],
  },
};
