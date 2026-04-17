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
 * Storybook story-id convention: "components-{kebab}--primary" (we assume a
 * Primary story exists; if not, the URL still opens Storybook's search).
 */
function storybookStoryId(pascalName) {
  const kebab = pascalName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `components-${kebab}--primary`;
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
      storybook_url: `/?path=/story/${storybookStoryId(pascalName)}`,
      status: override.status ?? 'stable',
      introduced_in: override.introduced_in ?? null,
      deprecated_in: override.deprecated_in ?? null,
      replaced_by: override.replaced_by ?? null,
      description: override.description ?? readDescription(dir, pascalName),
      source_path: `components/ui/${pascalName}/${pascalName}.tsx`,
      tokens_used: extractTokensUsed(dir),
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
