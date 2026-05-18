#!/usr/bin/env node
/**
 * Build `dist/bds-manifest.json` — the runtime manifest consumed by the
 * Brik DevBar inspect widget.
 *
 * The manifest is a small JSON index that lets the inspect widget show:
 *   - Which BDS component an element belongs to (by its `bds-*` root class)
 *   - Component status (stable / experimental / deprecated) + intro version
 *   - A Storybook URL for the component
 *   - Which tokens the component's CSS references, with their raw values
 *
 * Design: the manifest is intentionally small and flat. One JSON fetch,
 * O(1) lookup by class name or token name. No build-time dependencies on
 * TypeScript sources — we walk the filesystem + parse CSS with regex.
 *
 * Status/intro data comes from `scripts/inspector-overrides.json` (a
 * hand-edited file). Anything not listed there defaults to "stable".
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const COMPONENTS_DIR = join(REPO_ROOT, 'components/ui');
const TOKENS_CSS = join(REPO_ROOT, 'tokens/figma-tokens.css');
const OVERRIDES_PATH = join(__dirname, 'inspector-overrides.json');
const PKG_JSON = join(REPO_ROOT, 'package.json');
const OUTPUT_PATH = join(REPO_ROOT, 'dist/bds-manifest.json');

const pkg = JSON.parse(readFileSync(PKG_JSON, 'utf8'));
const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, 'utf8'))
  : {};

// ── Components ──────────────────────────────────────────────────────────

/**
 * Convert a PascalCase component directory name to a kebab-case class prefix.
 *   Button → bds-button
 *   FilterBar → bds-filter-bar
 *   CardDisplay → bds-card-display
 */
function toClassPrefix(pascalName) {
  const kebab = pascalName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `bds-${kebab}`;
}

/**
 * Build a Storybook story ID from the component's `*.stories.tsx`:
 *
 *   1. Parse `meta.title` → "Containers/card" or "Components/button"
 *   2. Slugify (lowercase, spaces → hyphens) → "containers-card"
 *   3. Pick the story slug:
 *      a. If a `<PascalName>.mdx` page exists → use `--overview`
 *         (Storybook 10 autodocs slug per `.storybook/main.ts`
 *         `docs.defaultName: 'Overview'` — opens the MDX docs view).
 *      b. Else fall back to the first canonical story export — prefer
 *         `Default` (ADR-010 §3 amendment), then legacy `Playground`,
 *         then the first `export const X` declared in the file.
 *
 * The MDX docs view is preferred (rich landing page embedding all stories
 * + prose docs), but components without an MDX page need a real story
 * slug instead — `--overview` only resolves when autodocs generated it.
 *
 * `brik-inspect.js` validates each emitted URL against the live Storybook
 * `/index.json` before rendering the link (see loadStorybookIndex), so a
 * miss degrades gracefully — but the manifest should still be right.
 *
 * Fallback when the stories file can't be parsed: a kebab pascalName with
 * a `components-` prefix + `--overview` slug. Surface in the build log.
 */
function storybookStoryId(pascalName, componentDir) {
  const fallback = (() => {
    const kebab = pascalName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    return `components-${kebab}--overview`;
  })();

  const storiesPath = join(componentDir, `${pascalName}.stories.tsx`);
  if (!existsSync(storiesPath)) return fallback;
  const src = readFileSync(storiesPath, 'utf8');

  // meta.title — match `title: '<bucket>/<slug>'` at the top of the file.
  // Restricting to a path-shaped value (contains a `/`) avoids picking up
  // object-literal `title:` keys inside `args` data.
  const titleMatch = src.match(/^\s*title:\s*['"]([A-Z][^'"\n]*\/[^'"\n]+)['"]/m);
  if (!titleMatch) return fallback;

  const metaTitle = titleMatch[1];
  const lastSlash = metaTitle.lastIndexOf('/');
  const bucketPath = metaTitle.slice(0, lastSlash);
  const componentSlug = metaTitle.slice(lastSlash + 1);

  // Storybook slugifies: camelCase → kebab, lowercase, spaces and slashes →
  // hyphens, drop other punctuation. The camelCase split is what turns
  // `WithSlots` → `with-slots` (matches Storybook's story-id derivation).
  const slugify = (s) =>
    s
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[\s/]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const idPrefix = `${slugify(bucketPath)}-${slugify(componentSlug)}`;

  // Prefer the autodocs `--overview` slug when an MDX page exists. Storybook
  // generates the autodocs entry from the MDX presence, so absent-MDX means
  // absent-overview.
  const mdxPath = join(componentDir, `${pascalName}.mdx`);
  if (existsSync(mdxPath)) return `${idPrefix}--overview`;

  // Else find the first canonical story export. Prefer Default (canonical
  // per ADR-010 §3) → Playground (legacy) → first export in source order.
  if (/^export const Default\b/m.test(src)) return `${idPrefix}--default`;
  if (/^export const Playground\b/m.test(src)) return `${idPrefix}--playground`;

  const firstExportMatch = src.match(/^export const ([A-Z][A-Za-z0-9_]*)\b/m);
  if (firstExportMatch) {
    return `${idPrefix}--${slugify(firstExportMatch[1])}`;
  }

  return `${idPrefix}--overview`;
}

/**
 * Try to read the first JSDoc block from a component's main .tsx file
 * for a one-line description. Falls back to an empty string.
 */
function readDescription(componentDir, pascalName) {
  const tsxPath = join(componentDir, `${pascalName}.tsx`);
  if (!existsSync(tsxPath)) return '';
  const src = readFileSync(tsxPath, 'utf8');
  // Match the first "/** ... */" before an export.
  const match = src.match(/\/\*\*\s*\n([\s\S]*?)\*\//);
  if (!match) return '';
  const line = match[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .filter(Boolean)[0];
  return line ? line.slice(0, 140) : '';
}

/**
 * Walk a component's .css + .tsx files and extract every referenced
 * design token (anything like `var(--foo-bar)`). Deduped, sorted.
 */
function extractTokensUsed(componentDir) {
  const tokens = new Set();
  const re = /var\(\s*(--[\w-]+)/g;
  for (const entry of readdirSync(componentDir)) {
    if (!entry.endsWith('.css') && !entry.endsWith('.tsx')) continue;
    const path = join(componentDir, entry);
    if (!statSync(path).isFile()) continue;
    const src = readFileSync(path, 'utf8');
    let m;
    while ((m = re.exec(src)) !== null) tokens.add(m[1]);
  }
  return Array.from(tokens).sort();
}

/**
 * Extract static a11y signals from a component's .tsx source: which
 * aria-* attributes it references, which role= values, whether it appears
 * to manage focus (usesFocus), whether it exposes a label prop.
 *
 * Not a replacement for a real axe run — this is a cheap, zero-runtime
 * signal for the inspect widget's Accessibility section, showing "what
 * this component offers for a11y," complementing the runtime checks on
 * actual DOM instances.
 */
function extractA11ySignals(componentDir, pascalName) {
  const signals = {
    aria_attrs: new Set(),
    roles: new Set(),
    manages_focus: false,
    has_label_prop: false,
    uses_keyboard_handlers: false,
    notes: [],
  };
  const tsxPath = join(componentDir, `${pascalName}.tsx`);
  if (!existsSync(tsxPath)) {
    return normalizeA11ySignals(signals);
  }
  const src = readFileSync(tsxPath, 'utf8');

  // aria-* usage — catches both JSX props (aria-label={...}) and string literals ('aria-label').
  const ariaRe = /aria-[a-z]+/g;
  let m;
  while ((m = ariaRe.exec(src)) !== null) signals.aria_attrs.add(m[0]);

  // role="..." props
  const roleRe = /role=["']([a-z-]+)["']/g;
  while ((m = roleRe.exec(src)) !== null) signals.roles.add(m[1]);

  // Focus management hints
  if (/\.focus\(\)|useAutoFocus|autoFocus=\{|FocusTrap|focus-visible/i.test(src)) {
    signals.manages_focus = true;
  }

  // Label prop (required for icon-only Button — `<Button icon={...} label="..." />`).
  if (/\blabel\??:\s*string/i.test(src) || /label:\s*ReactNode/i.test(src)) {
    signals.has_label_prop = true;
  }

  // Keyboard handlers
  if (/onKeyDown|onKeyUp|onKeyPress/i.test(src)) {
    signals.uses_keyboard_handlers = true;
  }

  // Known components that require specific a11y wiring — surface a note so
  // the inspect panel can nudge the consumer.
  if (pascalName === 'Dialog' || pascalName === 'Modal') {
    signals.notes.push('Must receive an aria-labelledby or aria-label. Focus trap lives in the component.');
  }
  if (pascalName === 'TextInput' || pascalName === 'TextArea' || pascalName === 'Select') {
    signals.notes.push('Pair with a visible <label> via htmlFor + id, or supply aria-label when a visible label is intentionally omitted.');
  }

  return normalizeA11ySignals(signals);
}

function normalizeA11ySignals(signals) {
  return {
    aria_attrs: Array.from(signals.aria_attrs).sort(),
    roles: Array.from(signals.roles).sort(),
    manages_focus: signals.manages_focus,
    has_label_prop: signals.has_label_prop,
    uses_keyboard_handlers: signals.uses_keyboard_handlers,
    notes: signals.notes,
  };
}

function buildComponents() {
  if (!existsSync(COMPONENTS_DIR)) return {};
  const components = {};
  for (const entry of readdirSync(COMPONENTS_DIR)) {
    const dir = join(COMPONENTS_DIR, entry);
    if (!statSync(dir).isDirectory()) continue;
    if (!/^[A-Z]/.test(entry)) continue; // PascalCase dirs only

    const pascalName = entry;
    const prefix = toClassPrefix(pascalName);
    const override = overrides.components?.[pascalName] ?? {};

    components[prefix] = {
      name: pascalName,
      class_prefix: prefix,
      storybook_url: `/?path=/story/${storybookStoryId(pascalName, dir)}`,
      status: override.status ?? 'stable',
      introduced_in: override.introduced_in ?? null,
      deprecated_in: override.deprecated_in ?? null,
      replaced_by: override.replaced_by ?? null,
      description: override.description ?? readDescription(dir, pascalName),
      source_path: `components/ui/${pascalName}/${pascalName}.tsx`,
      tokens_used: extractTokensUsed(dir),
      a11y: extractA11ySignals(dir, pascalName),
      // Semantic fields — consumed by scripts/bds-find.mjs for discoverability.
      // Hand-authored in inspector-overrides.json; absent by default.
      // See docs/adrs/ADR-001-bds-find.md for the schema rationale.
      category: override.category ?? null,
      tags: override.tags ?? [],
      use_cases: override.use_cases ?? [],
      theming_contract: override.theming_contract ?? null,
      composes: override.composes ?? [],
    };
  }
  return components;
}

// ── Tokens ──────────────────────────────────────────────────────────────

/**
 * Parse figma-tokens.css into `{ tokenName: { value, category } }`.
 * Category is inferred from the token's prefix (color-, space-, font-, etc.).
 */
function inferCategory(name) {
  if (name.startsWith('--color-')) return 'color';
  if (name.startsWith('--space-') || name.startsWith('--spacing-')) return 'spacing';
  if (name.startsWith('--font-') || name.startsWith('--typography-')) return 'typography';
  if (name.startsWith('--border-radius-') || name.startsWith('--radius-')) return 'radius';
  if (name.startsWith('--border-')) return 'border';
  if (name.startsWith('--shadow-') || name.startsWith('--elevation-')) return 'shadow';
  if (name.startsWith('--transition-') || name.startsWith('--motion-')) return 'motion';
  if (name.startsWith('--padding-')) return 'padding';
  if (name.startsWith('--margin-')) return 'margin';
  if (name.startsWith('--gap-')) return 'gap';
  if (name.startsWith('--text-')) return 'color';
  if (name.startsWith('--background-')) return 'color';
  if (name.startsWith('--surface-')) return 'color';
  return 'other';
}

/**
 * Strip a trailing /** ... *\/ comment and return its content.
 */
function extractComment(line) {
  const m = line.match(/\/\*\*\s*(.+?)\s*\*\//);
  return m ? m[1].trim() : undefined;
}

function buildTokens() {
  if (!existsSync(TOKENS_CSS)) return {};
  const src = readFileSync(TOKENS_CSS, 'utf8');
  const tokens = {};
  // Match `  --name: value;` with optional trailing comment.
  const re = /^\s*(--[\w-]+)\s*:\s*([^;]+);(.*)$/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    const value = m[2].trim();
    const description = extractComment(m[3]);
    const token = {
      value,
      category: inferCategory(name),
    };
    if (description) token.description = description;
    tokens[name] = token;
  }
  return tokens;
}

// ── Emit ────────────────────────────────────────────────────────────────

function main() {
  const components = buildComponents();
  const tokens = buildTokens();

  const manifest = {
    $schema: 'https://brikdesigns.com/schemas/bds-inspector-manifest-v1.json',
    bds_version: pkg.version,
    generated_at: new Date().toISOString(),
    component_count: Object.keys(components).length,
    token_count: Object.keys(tokens).length,
    components,
    tokens,
  };

  const distDir = dirname(OUTPUT_PATH);
  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));

  const size = (JSON.stringify(manifest).length / 1024).toFixed(1);
  console.log(
    `✓ bds-manifest.json — ${manifest.component_count} components, ${manifest.token_count} tokens, ${size} KB`,
  );
}

main();
