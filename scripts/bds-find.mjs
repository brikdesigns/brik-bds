#!/usr/bin/env node
/**
 * bds-find — Component discoverability CLI for agents and humans.
 *
 * Queries the BDS component manifest (dist/bds-manifest.json) to answer
 * "does BDS already have a component for X?" before writing new UI.
 *
 * Usage:
 *   bds-find <query>                    Fuzzy search use_cases + tags + name
 *   bds-find --tag <tag>                Filter by tag
 *   bds-find --exact <name>             Lookup by component name
 *   bds-find --list                     Dump all components (JSON)
 *   bds-find --format=json|md           Output format (default: md for TTY, json for pipes)
 *
 * Exit codes map to the Adopt / Extend / Graduate cascade:
 *   0  Exact / high-confidence match (>= 0.85)          → Adopt
 *   1  Partial match (0.5 - 0.85)                       → Extend (upstream to BDS)
 *   2  No match (< 0.5)                                  → Graduate (build in consumer)
 *   3  Internal error
 *
 * See docs/adrs/ADR-001-bds-find.md for schema + integration rationale.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = resolve(__dirname, '..', 'dist', 'bds-manifest.json');

const USAGE = `bds-find — Component discoverability for @brikdesigns/bds

Usage:
  bds-find <query>                Fuzzy search use_cases + tags + name
  bds-find --tag <tag>            Filter by tag
  bds-find --exact <name>         Exact lookup by component name (PascalCase)
  bds-find --list                 Dump all components as JSON
  bds-find --format=md|json       Output format (md default for TTY, json otherwise)
  bds-find --help                 Show this message

Exit codes:
  0  match (>= 0.85 confidence)       — Adopt: use the component as-is
  1  partial match (0.5 - 0.85)       — Extend: upstream a PR to BDS
  2  no match (< 0.5)                 — Graduate: build in consumer, log to .bds-gaps.log
  3  internal error
`;

// ── Args ────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = { query: '', tag: null, exact: null, list: false, format: null, help: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--list') opts.list = true;
    else if (a === '--tag') opts.tag = argv[++i];
    else if (a === '--exact') opts.exact = argv[++i];
    else if (a.startsWith('--format=')) opts.format = a.slice('--format='.length);
    else if (a === '--format') opts.format = argv[++i];
    else rest.push(a);
  }
  opts.query = rest.join(' ').trim();
  if (!opts.format) opts.format = process.stdout.isTTY ? 'md' : 'json';
  return opts;
}

// ── Manifest ────────────────────────────────────────────────────────────

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) {
    process.stderr.write(
      `bds-find: manifest not found at ${MANIFEST_PATH}\n` +
      `          run: npm run build:inspector-manifest\n`,
    );
    process.exit(3);
  }
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (err) {
    process.stderr.write(`bds-find: failed to parse manifest: ${err.message}\n`);
    process.exit(3);
  }
}

// ── Scoring ─────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'with', 'to', 'of', 'in', 'on',
  'i', 'need', 'want', 'how', 'do', 'build', 'create', 'make', 'add',
]);

function tokenize(text) {
  return String(text).toLowerCase().split(/[^a-z0-9]+/).filter((t) => t && !STOPWORDS.has(t));
}

/**
 * Score a single component against a query. Returns a number in [0, 1].
 *
 * Scoring weights (chosen so a single exact hit in a high-value field tops
 * several partial hits in low-value fields):
 *   exact use_case phrase match      → 1.0
 *   exact component name match        → 0.95
 *   all query tokens hit in one use_case → 0.85
 *   exact tag match                   → 0.75
 *   any query token hits tag          → 0.5 per token, capped at 0.7
 *   any query token hits use_case     → 0.4 per token, capped at 0.65
 *   any query token hits name         → 0.3
 */
function scoreComponent(component, queryRaw) {
  const query = queryRaw.toLowerCase().trim();
  if (!query) return 0;

  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;

  const useCases = (component.use_cases ?? []).map((u) => u.toLowerCase());
  const tags = (component.tags ?? []).map((t) => t.toLowerCase());
  const name = (component.name ?? '').toLowerCase();

  // Exact phrase match in a use case
  if (useCases.includes(query)) return 1.0;

  // Exact name match
  if (name === query) return 0.95;

  // All query tokens hit in a single use_case phrase (fuzzy phrase match)
  for (const uc of useCases) {
    const ucTokens = new Set(tokenize(uc));
    if (tokens.every((t) => ucTokens.has(t))) return 0.85;
  }

  // Exact tag match
  if (tags.includes(query)) return 0.75;

  // Accumulate partial-token hits
  let score = 0;
  const seenTagHits = new Set();
  const seenUseCaseHits = new Set();

  for (const t of tokens) {
    if (tags.includes(t) && !seenTagHits.has(t)) {
      score += 0.5;
      seenTagHits.add(t);
    }
    for (const uc of useCases) {
      if (uc.includes(t) && !seenUseCaseHits.has(t + '|' + uc)) {
        score += 0.4;
        seenUseCaseHits.add(t + '|' + uc);
        break; // Only count first use_case hit per token
      }
    }
    if (name.includes(t)) score += 0.3;
  }

  // Normalize: cap at 0.7 so token-soup queries don't falsely top fuzzy phrase matches
  return Math.min(score, 0.7);
}

// ── Render ──────────────────────────────────────────────────────────────

function renderMarkdown(results, query) {
  if (results.length === 0) {
    return `NO MATCH — "${query}"\n` +
           `  BDS has nothing obvious for this. Build in consumer as a graduation\n` +
           `  candidate. Log the gap with:\n\n` +
           `    echo '{"date":"${new Date().toISOString().slice(0, 10)}","query":"${query}","consumer":"<slug>"}' >> .bds-gaps.log\n`;
  }
  const lines = [];
  for (const { component: c, score } of results) {
    const verdict = score >= 0.85 ? 'MATCH' : 'PARTIAL';
    const composes = (c.composes ?? []).join(', ') || '—';
    const themeable = c.theming_contract?.themeable?.join(', ') || '—';
    const fixed = c.theming_contract?.fixed?.join(', ') || '—';
    const useCasesLine = (c.use_cases ?? []).slice(0, 3).join(', ') || '—';
    lines.push(
      `${verdict} (${score.toFixed(2)}) — ${c.name}`,
      `  import { ${c.name} } from '@brikdesigns/bds';`,
      `  class: ${c.class_prefix}                 status: ${c.status}`,
      `  use-cases: ${useCasesLine}`,
      `  composes:  ${composes}`,
      `  storybook: https://bds.brikdesigns.com${c.storybook_url}`,
      `  theme-via: ${themeable}`,
      `  fixed:     ${fixed}`,
      '',
    );
  }
  return lines.join('\n');
}

function renderJson(results, query) {
  return JSON.stringify({
    query,
    count: results.length,
    results: results.map(({ component, score }) => ({
      name: component.name,
      import: `@brikdesigns/bds`,
      class: component.class_prefix,
      status: component.status,
      confidence: Number(score.toFixed(3)),
      verdict: score >= 0.85 ? 'adopt' : score >= 0.5 ? 'extend' : 'graduate',
      use_cases: component.use_cases ?? [],
      tags: component.tags ?? [],
      composes: component.composes ?? [],
      theming_contract: component.theming_contract ?? null,
      storybook_url: `https://bds.brikdesigns.com${component.storybook_url}`,
    })),
  }, null, 2);
}

// ── Main ────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    process.stdout.write(USAGE);
    process.exit(0);
  }

  const manifest = loadManifest();
  const components = Object.values(manifest.components);

  if (opts.list) {
    process.stdout.write(JSON.stringify(components, null, 2) + '\n');
    process.exit(0);
  }

  if (opts.exact) {
    const match = components.find((c) => c.name === opts.exact);
    if (!match) {
      process.stderr.write(`bds-find: no component named ${opts.exact}\n`);
      process.exit(2);
    }
    const out = opts.format === 'json'
      ? renderJson([{ component: match, score: 1.0 }], opts.exact)
      : renderMarkdown([{ component: match, score: 1.0 }], opts.exact);
    process.stdout.write(out + '\n');
    process.exit(0);
  }

  if (opts.tag) {
    const matches = components
      .filter((c) => (c.tags ?? []).includes(opts.tag))
      .map((component) => ({ component, score: 0.75 }));
    if (matches.length === 0) {
      process.stderr.write(`bds-find: no components tagged "${opts.tag}"\n`);
      process.exit(2);
    }
    const out = opts.format === 'json'
      ? renderJson(matches, `tag:${opts.tag}`)
      : renderMarkdown(matches, `tag:${opts.tag}`);
    process.stdout.write(out + '\n');
    process.exit(0);
  }

  if (!opts.query) {
    process.stderr.write(USAGE);
    process.exit(3);
  }

  // Fuzzy search
  const scored = components
    .map((component) => ({ component, score: scoreComponent(component, opts.query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const top = scored[0]?.score ?? 0;
  const out = opts.format === 'json'
    ? renderJson(scored, opts.query)
    : renderMarkdown(scored, opts.query);
  process.stdout.write(out + '\n');

  // Exit code cascade: Adopt / Extend / Graduate
  if (top >= 0.85) process.exit(0);
  if (top >= 0.5)  process.exit(1);
  process.exit(2);
}

main();
