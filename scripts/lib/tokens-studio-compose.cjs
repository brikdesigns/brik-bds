/**
 * tokens-studio-compose.cjs — the pure halves of the token pipeline (brik-bds#2836).
 *
 *   mergeLibraries        Foundations + one Brand Kit → one Tokens Studio file
 *                         (was inline in merge-tokens-studio.js)
 *   flattenTokensStudio   Tokens Studio multi-set file → flat DTCG tree for SD
 *                         (was inline in flatten-tokens-studio.js)
 *
 * Both CLI scripts and `compileClientTheme` (scripts/compile-client-theme.mjs)
 * call these, so a client theme compiled in memory and the committed Brik build
 * cannot drift apart. No fs, no process — callers own I/O and logging.
 *
 * CommonJS so the two CJS scripts can require it on Node 18 (engines >=18,
 * no require(esm)); the ESM compiler imports it by name.
 */

// ─── Merge (Foundations + Brand Kit) ─────────────────────────────

// Deep merge two token set objects. `override` wins on any conflicting leaf.
function deepMergeSets(base, override) {
  if (!base || typeof base !== 'object') return override;
  if (!override || typeof override !== 'object') return base;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMergeSets(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Merge contract:
 *   - Brand Kit wins on any token path that appears in both Libraries
 *     within the same set (deep merge, Brand Kit values replace Foundations).
 *   - tokenSetOrder: Foundations sets first, then Brand Kit sets.
 *   - $themes: preserved from Foundations (they reference mode picks across
 *     all sets; Brand Kit doesn't define themes).
 *
 * Returns `{ merged, foundationsOrder, brandKitOrder, mergedOrder }`.
 */
function mergeLibraries(foundations, brandKit) {
  // Build merged tokenSetOrder: Foundations first, then Brand Kit (deduped).
  const foundationsOrder =
    foundations.$metadata?.tokenSetOrder ??
    Object.keys(foundations).filter((k) => !k.startsWith('$'));
  const brandKitOrder =
    brandKit.$metadata?.tokenSetOrder ??
    Object.keys(brandKit).filter((k) => !k.startsWith('$'));
  const mergedOrder = [
    ...foundationsOrder,
    ...brandKitOrder.filter((k) => !foundationsOrder.includes(k)),
  ];

  // Merge token sets (non-metadata keys).
  const merged = {};

  for (const [key, value] of Object.entries(foundations)) {
    if (!key.startsWith('$')) merged[key] = value;
  }
  for (const [key, value] of Object.entries(brandKit)) {
    if (key.startsWith('$')) continue;
    merged[key] = merged[key] ? deepMergeSets(merged[key], value) : value;
  }

  // Reconstruct $metadata.
  merged.$metadata = {
    ...foundations.$metadata,
    tokenSetOrder: mergedOrder,
  };

  // Preserve $themes from Foundations.
  if (foundations.$themes) {
    merged.$themes = foundations.$themes;
  }

  return { merged, foundationsOrder, brandKitOrder, mergedOrder };
}

// ─── Flatten (Tokens Studio sets → flat DTCG) ────────────────────

// Default modes — these match the Webflow Foundations site defaults
const DEFAULT_MODES = {
  primitives: 'value',
  color: 'light',
  icon: 'solid',
  'border-radius': 'soft',
  spacing: 'default',
  // `breakpoint` is pinned to `default` on purpose, and unlike its neighbours it
  // is NOT overridable in practice (#2591). Every other collection here names a
  // starting mode that generate-modes-css.mjs then re-emits under [data-mode-*];
  // breakpoint has no runtime mode layer, because a breakpoint's only consumer
  // is an @media condition and that is a build-time literal — there is no
  // element to carry a data attribute and no cascade to re-resolve against.
  // Alternate modes would mean shipping a parallel sheet of duplicated @media
  // blocks. Since #2604 retired the `web` rung — the only one that ever varied
  // (1200/800/1400) — all five remaining rungs are identical across all three
  // modes, so the pin is value-neutral today. It stays because the collection
  // still HAS three modes: re-introduce a mode-varying rung and this line is
  // what keeps the emitted sheet single-valued instead of silently picking one.
  // See tokens/CASCADE.md § Breakpoint.
  breakpoint: 'default',
  'border-width': 'default',
  typography: 'default',
  // #3278: the :root value of each band rung is the `contained` mode;
  // generate-modes-css.mjs re-emits wide / full-bleed under [data-mode-width].
  'content-width': 'contained',
  motion: 'default',
};

function deepMergeTree(target, source) {
  for (const [key, val] of Object.entries(source)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && val.$value === undefined) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMergeTree(target[key], val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

// ─── Strip Figma-specific extensions (keep $value, $type, $description) ──

function cleanToken(token) {
  const cleaned = {};
  if (token.$value !== undefined) cleaned.$value = token.$value;
  if (token.$type !== undefined) cleaned.$type = token.$type;
  if (token.$description !== undefined) cleaned.$description = token.$description;
  return cleaned;
}

function cleanTree(obj, warn) {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object') {
      if (val.$value !== undefined) {
        result[key] = cleanToken(val);
        // Handle collision: node is both a token AND a group (e.g. icon collection
        // sets icon.$value while typography collection adds icon.tiny, icon.xs, etc.)
        for (const [ck, cv] of Object.entries(val)) {
          if (ck.startsWith('$')) continue;
          if (cv && typeof cv === 'object') {
            if (cv.$value !== undefined) {
              result[key][ck] = cleanToken(cv);
            } else {
              const sub = cleanTree(cv, warn);
              if (Object.keys(sub).length > 0) {
                result[key][ck] = sub;
              }
            }
          }
        }
        // Warn about collision so it's visible in build output
        const childKeys = Object.keys(result[key]).filter(k => !k.startsWith('$'));
        if (childKeys.length > 0) {
          warn(`  COLLISION: "${key}" is both a token ($value) and a group (${childKeys.length} children: ${childKeys.slice(0, 3).join(', ')}${childKeys.length > 3 ? '...' : ''})`);
        }
      } else {
        const cleaned = cleanTree(val, warn);
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned;
        }
      }
    }
  }
  return result;
}

// ─── Detect if a set's direct children are all leaf tokens ────
// Sets like border-width/default and breakpoint/default have tokens
// directly at root ({sm: {$value}, md: {$value}}) with no parent
// group wrapper. These need wrapping under the collection name so
// they don't orphan into the global namespace.

const LEGACY_COLLECTION_WRAP = new Set(
  require('../../tokens/naming-grammar.json').body.legacyCollectionWrap.collections,
);

function needsWrapping(setData) {
  for (const val of Object.values(setData)) {
    if (val && typeof val === 'object' && val.$value !== undefined) {
      return true; // direct leaf tokens at root — needs wrapping
    }
  }
  return false;
}

const noop = () => {};

// ─── Compose elevation shadows (#3058) ────────────────────────────────
// Figma's `elevation` collection holds each depth as four parts:
// shadow/{depth}/{offset,blur,spread,color}. A Figma variable cannot hold a
// box-shadow, so the build composes the parts into one token per depth and
// drops the parts, the way #2243 dropped the old spread/opacity sub-tokens.
// x-offset is always 0. A part that aliases a primitive stays a reference, so
// the CSS reads `var(--bds-shadow-offset-100)`; a raw number gets `px`.
// Figma variables cannot say "inset" either: a depth whose colour description
// names an inner shadow (today: sunken) is emitted inset.
const SHADOW_PARTS = ['offset', 'blur', 'spread', 'color'];

function shadowLength(part, where) {
  const v = part.$value;
  if (typeof v === 'number') return v === 0 ? '0' : `${v}px`;
  if (typeof v === 'string' && /^\{[^}]+\}$/.test(v)) return v;
  if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v)) return v === '0' ? '0' : `${v}px`;
  if (typeof v === 'string' && /^-?\d+(\.\d+)?px$/.test(v)) return v;
  throw new Error(`composeShadows: ${where} has an unreadable length (${JSON.stringify(v)})`);
}

function shadowColor(part, where) {
  const v = part.$value;
  const m = typeof v === 'string' && /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(v);
  if (!m) throw new Error(`composeShadows: ${where} is not a hex colour (${JSON.stringify(v)})`);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  const a = m[2] === undefined ? 1 : Math.round((parseInt(m[2], 16) / 255) * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function composeShadows(merged) {
  const shadow = merged.shadow;
  if (!shadow || typeof shadow !== 'object') return;
  for (const [depth, group] of Object.entries(shadow)) {
    if (!group || typeof group !== 'object' || group.$value !== undefined) continue;
    const keys = Object.keys(group).filter((k) => !k.startsWith('$'));
    if (!SHADOW_PARTS.every((p) => keys.includes(p))) continue;
    const extra = keys.filter((k) => !SHADOW_PARTS.includes(k));
    if (extra.length) throw new Error(`composeShadows: shadow.${depth} has unknown parts (${extra.join(', ')})`);
    const where = (p) => `shadow.${depth}.${p}`;
    const description = SHADOW_PARTS.map((p) => group[p].$description).find(Boolean);
    const inset = /\binset\b/i.test(description || '');
    const value = [
      ...(inset ? ['inset'] : []),
      '0',
      shadowLength(group.offset, where('offset')),
      shadowLength(group.blur, where('blur')),
      shadowLength(group.spread, where('spread')),
      shadowColor(group.color, where('color')),
    ].join(' ');
    shadow[depth] = { $value: value, ...(description ? { $description: description } : {}) };
  }
}

/**
 * Merge primitives + one mode per collection into a flat DTCG object.
 *
 * `modes` overrides DEFAULT_MODES per collection. `log` / `warn` receive the
 * progress lines the CLI prints; both default to silent. The input is cloned,
 * so the caller's object is never mutated.
 */
function flattenTokensStudio(input, { modes = {}, log = noop, warn = noop } = {}) {
  const data = structuredClone(input);
  const selectedModes = { ...DEFAULT_MODES, ...modes };

  // Identify available sets
  const sets = Object.keys(data).filter(k => k[0] !== '$' && k !== 'global');
  const collections = {};
  for (const s of sets) {
    const parts = s.split('/');
    const col = parts[0];
    const mode = parts[1] || 'value';
    if (!collections[col]) collections[col] = [];
    collections[col].push(mode);
  }

  log('  Collections found:');
  for (const [col, colModes] of Object.entries(collections)) {
    const selected = selectedModes[col] || colModes[0];
    const marker = colModes.includes(selected) ? selected : colModes[0] + ' (fallback)';
    log(`    ${col}: ${colModes.join(', ')}  → using "${marker}"`);
  }

  // Merge selected sets
  const merged = {};
  for (const [col, colModes] of Object.entries(collections)) {
    const selected = selectedModes[col] || colModes[0];
    const setKey = colModes.length === 1 && colModes[0] === 'value'
      ? `${col}/${colModes[0]}`
      : `${col}/${selected}`;

    const setData = data[setKey];
    if (!setData) {
      warn(`  WARNING: Set "${setKey}" not found, skipping`);
      continue;
    }

    // A name is the Figma path (#3278, tokens/naming-grammar.json `body`): no
    // collection segment is added. The only exception is the legacy list of
    // collections whose variables still sit at the root —
    // e.g. border-width/default → { "border-width": { sm, md, lg } }.
    // Any other rootless set would emit a name Figma never declared, so stop.
    if (col !== 'primitives' && needsWrapping(setData)) {
      if (!LEGACY_COLLECTION_WRAP.has(col)) {
        throw new Error(
          `Set "${setKey}" has variables at its root. A token name is its Figma path ` +
          `(tokens/naming-grammar.json body.rule), so rename them in Figma to start ` +
          `with "${col}/" — the generator does not add the collection name.`,
        );
      }
      log(`    ↳ Wrapping "${setKey}" tokens under "${col}" (legacy, naming-grammar body.legacyCollectionWrap)`);
      deepMergeTree(merged, { [col]: setData });
    } else {
      deepMergeTree(merged, setData);
    }
  }

  // ─── Drop retired sub-token groups (#2243) and the layout tier (ADR-042) ──
  // `spread` and `opacity` were the old elevation collection's shadow parts.
  // #3058 replaced that collection with shadow/{depth}/* (composed by
  // composeShadows below), so neither group exists in Figma today; the delete
  // stays so a re-introduced bare --spread-* / --opacity-* never reaches :root
  // as a shadow alpha masquerading as a general opacity token.
  //
  // `layout` (ADR-042) is the device-fluid TIER: generate-modes-css.mjs reads
  // `layout/{mobile,tablet,desktop}` directly from tokens-studio.json and builds
  // one piecewise clamp() per token into tokens/layout-fluid.css. `layout` has no
  // entry in DEFAULT_MODES above, so the merge loop would otherwise pick
  // whichever mode sorts first (`layout/desktop` is listed first in the source)
  // and Style Dictionary would emit that as a flat, device-invariant
  // --page-inset / --section-padding-block — a static copy of a token that is
  // supposed to vary continuously by device, landing at the SAME name and
  // racing the fluid one on cascade order. Deleting the merged key (it is
  // wrapped under `layout` by the needsWrapping branch above, same as
  // `border-width` / `breakpoint`) is the minimal fix, same pattern as
  // spread/opacity above.
  for (const internal of ['spread', 'opacity', 'layout']) delete merged[internal];

  composeShadows(merged);

  // ─── Fix font-line-height: Tokens Studio exports % as px ─────
  // Figma stores line-height as percentages (110%, 125%, 150%) but
  // Tokens Studio exports them as "110px", "125px". Convert back.

  if (merged['font-line-height']) {
    for (const [key, token] of Object.entries(merged['font-line-height'])) {
      if (token && token.$value && typeof token.$value === 'string' && token.$value.endsWith('px')) {
        const num = parseFloat(token.$value);
        // Line-height values are percentages (100-200 range), not pixel values
        if (num >= 100 && num <= 300) {
          const fixed = `${num}%`;
          log(`    ↳ Fixed font-line-height/${key}: ${token.$value} → ${fixed}`);
          token.$value = fixed;
          token.$type = 'number'; // percentage, not dimension
        }
      }
    }
  }

  // Clean Figma-specific extensions
  return cleanTree(merged, warn);
}

module.exports = { DEFAULT_MODES, mergeLibraries, flattenTokensStudio };
