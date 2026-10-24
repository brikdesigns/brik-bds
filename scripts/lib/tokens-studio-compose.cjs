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
  elevation: 'subtle',
  typography: 'default',
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

function needsWrapping(setData) {
  for (const val of Object.values(setData)) {
    if (val && typeof val === 'object' && val.$value !== undefined) {
      return true; // direct leaf tokens at root — needs wrapping
    }
  }
  return false;
}

const noop = () => {};

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

    // Wrap rootless semantic sets under their collection name
    // e.g. border-width/default → { "border-width": { sm, md, lg } }
    //      breakpoint/default   → { "breakpoint": { web, tablet, mobile } }
    if (col !== 'primitives' && needsWrapping(setData)) {
      log(`    ↳ Wrapping "${setKey}" tokens under "${col}"`);
      deepMergeTree(merged, { [col]: setData });
    } else {
      deepMergeTree(merged, setData);
    }
  }

  // ─── Drop elevation-internal composite sub-tokens (#2243) and the layout
  // ─── tier (ADR-042) ────────────────────────────────────────────────
  // The `spread` and `opacity` groups live in the elevation collection ONLY to be
  // composed into the --shadow-* shorthand by generate-modes-css.mjs, which reads
  // design-tokens/tokens-studio.json directly — never the flattened SD input. If
  // left in, Style Dictionary emits them to :root as bare --spread-* / --opacity-*
  // globals: a shadow alpha masquerading as a general --opacity-md token, which
  // the token-purpose slot lint rightly rejects. They are elevation-only (asserted
  // in tokens-studio.json), so deleting the top-level keys is safe.
  // (The older blur-radius / box-shadow groups still emit — grandfathered,
  // registered slots; excluding those is a separate cleanup.)
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
