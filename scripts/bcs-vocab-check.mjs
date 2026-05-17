#!/usr/bin/env node
/**
 * bcs-vocab-check — BCS vocabulary drift gate for docs-site MDX.
 *
 * Fails when any value appearing in a vocabulary-keyed table column or a
 * labelled prose reference in docs-site content MDX is not
 * present in the corresponding locked enum from content-system/vocabularies/.
 *
 * This is the durable answer to the recurring vocabulary-drift class of bug:
 *   #350 image-mood drift, #354 atmosphere parallel-taxonomy,
 *   #370 getting-started drift, #533 blueprints.mdx fabricated vocab tables.
 * Each fix was a one-shot; this gate prevents recurrence. See brik-bds#534.
 *
 * ── Vocabulary → enum mapping ────────────────────────────────────────────
 *
 *   | MDX column header / label  | Enum source                              |
 *   |----------------------------|------------------------------------------|
 *   | Mood                       | content-system/blueprints/vocabularies   |
 *   | Personality                | content-system/vocabularies/personality  |
 *   | VisualStyle / Visual Style | content-system/vocabularies/visual-style |
 *   | Voice                      | content-system/vocabularies/voice        |
 *   | Atmosphere                 | content-system/vocabularies/atmosphere   |
 *   | NavArchetype / Nav Archetype | content-system/vocabularies/nav-archetype |
 *   | FooterArchetype / Footer Archetype | content-system/vocabularies/footer-archetype |
 *
 * ── Detection ────────────────────────────────────────────────────────────
 *
 * Two patterns are checked:
 *
 *   1. Table columns — any Markdown table whose column header matches a
 *      vocabulary name has its cell values validated against the enum.
 *      Cells that are "—", empty, contain "(" (e.g. notes/links), or start
 *      with "<" (JSX) are skipped.
 *
 *   2. Labelled prose — inline occurrences of the pattern
 *      `<VocabName>: \`value\`` (e.g. `Mood: \`bold\``) are validated.
 *      Case-insensitive header match; strict-case value match.
 *
 * ── Exit codes ───────────────────────────────────────────────────────────
 *   0  Clean — all referenced vocabulary values are canonical
 *   1  Violations found
 *   2  Bad invocation (missing path, unreadable vocab source)
 *
 * ── CLI ──────────────────────────────────────────────────────────────────
 *   bcs-vocab-check [mdx-dir]       Scan MDX directory (default: docs-site/content/docs)
 *   bcs-vocab-check --help          Show this message
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BDS_ROOT = resolve(__dirname, '..');

// ── Vocabulary loading ───────────────────────────────────────────────────

/**
 * Parse a `*_VALUES = [...] as const` array from a TypeScript source file.
 * Handles both single- and double-quoted string entries. Returns a Set.
 * Throws with a clear message if the expected export isn't found.
 */
function loadVocab(relPath, exportName) {
  const absPath = resolve(BDS_ROOT, relPath);
  if (!existsSync(absPath)) {
    throw new Error(`bcs-vocab-check: vocabulary source not found: ${relPath}\n  Run \`npm ci\` in bds root.`);
  }
  const src = readFileSync(absPath, 'utf8');
  const match = src.match(
    new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as\\s*const`),
  );
  if (!match) {
    throw new Error(
      `bcs-vocab-check: could not find \`export const ${exportName}\` in ${relPath}`,
    );
  }
  const values = [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
  if (values.length === 0) {
    throw new Error(
      `bcs-vocab-check: ${exportName} parsed to an empty set from ${relPath} — check source format`,
    );
  }
  return new Set(values);
}

// Load all 7 vocabulary sets at startup.
const VOCABS = {
  Mood:            loadVocab('content-system/blueprints/vocabularies.ts',    'MOOD_VALUES'),
  Personality:     loadVocab('content-system/vocabularies/personality.ts',   'PERSONALITY_VALUES'),
  VisualStyle:     loadVocab('content-system/vocabularies/visual-style.ts',  'VISUAL_STYLE_VALUES'),
  Voice:           loadVocab('content-system/vocabularies/voice.ts',         'VOICE_VALUES'),
  Atmosphere:      loadVocab('content-system/vocabularies/atmosphere.ts',    'ATMOSPHERE_VALUES'),
  NavArchetype:    loadVocab('content-system/vocabularies/nav-archetype.ts', 'NAV_ARCHETYPE_VALUES'),
  FooterArchetype: loadVocab('content-system/vocabularies/footer-archetype.ts', 'FOOTER_ARCHETYPE_VALUES'),
};

// Alternate surface forms for column headers in MDX tables.
const HEADER_ALIASES = {
  'visual style':      'VisualStyle',
  'visualstyle':       'VisualStyle',
  'nav archetype':     'NavArchetype',
  'navarchetype':      'NavArchetype',
  'navigation archetype': 'NavArchetype',
  'footer archetype':  'FooterArchetype',
  'footerarchetype':   'FooterArchetype',
  'mood':              'Mood',
  'personality':       'Personality',
  'voice':             'Voice',
  'atmosphere':        'Atmosphere',
};

/**
 * Map a raw column header string to a canonical vocabulary name, or null.
 */
function headerToVocab(raw) {
  const lower = raw.toLowerCase().trim();
  return HEADER_ALIASES[lower] ?? null;
}

// ── MDX file walking ─────────────────────────────────────────────────────

function walkMdx(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkMdx(full, acc);
    } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
      acc.push(full);
    }
  }
  return acc;
}

// ── Table parsing ────────────────────────────────────────────────────────

/**
 * Split a Markdown table row string into trimmed cell values.
 *   `| foo | bar |`  →  ['foo', 'bar']
 */
function splitTableRow(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

/** True for the separator row between header and body: `|---|---|` */
function isSeparatorRow(line) {
  return /^\|[\s|:-]+\|$/.test(line.trim());
}

/**
 * Cell value that should be skipped (not a vocab value to validate):
 *   - Empty or dash-only ("—", "-")
 *   - Contains "(" — note, link, or multi-value like "Luxury · Refined"
 *   - Contains "·" — multi-value projection
 *   - Starts with "<" — JSX component
 *   - Starts with "`<" — JSX inside backtick (component names)
 */
function isSkippableCell(raw) {
  const v = raw.replace(/^`|`$/g, '').trim();
  return (
    v === '' ||
    v === '—' ||
    v === '-' ||
    v.includes('(') ||
    v.includes('·') ||
    v.startsWith('<') ||
    v.startsWith('*')
  );
}

/**
 * Extract the canonical value from a cell string. Strips backticks and
 * surrounding whitespace; returns the raw string otherwise.
 */
function cellValue(raw) {
  return raw.replace(/^`|`$/g, '').trim();
}

// ── Prose pattern ────────────────────────────────────────────────────────
//
// Matches: Mood: `bold`  or  Atmosphere: `editorial-luxury`  (anywhere in a line)
// Group 1: vocabulary label, Group 2: the value

const PROSE_VOCAB_RE = /(?:^|[^a-z])(?:(mood|personality|visual\s*style|voice|atmosphere|nav\s*archetype|footer\s*archetype)):\s*`([^`]+)`/gi;

// ── File scan ────────────────────────────────────────────────────────────

/**
 * Scan a single MDX file and return an array of violation objects:
 *   { file, line, vocabName, value }
 */
function scanFile(filePath) {
  const src = readFileSync(filePath, 'utf8');
  const lines = src.split('\n');
  const violations = [];

  let headerCols = null; // Map<colIndex, vocabName> when inside a table
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // ── Table parsing ──────────────────────────────────────────────────
    if (trimmed.startsWith('|')) {
      if (isSeparatorRow(trimmed)) {
        // The previous line was the header row — parse it now.
        if (i > 0 && lines[i - 1].trim().startsWith('|')) {
          const headerCells = splitTableRow(lines[i - 1]);
          headerCols = new Map();
          headerCells.forEach((cell, idx) => {
            const vocabName = headerToVocab(cellValue(cell));
            if (vocabName) headerCols.set(idx, vocabName);
          });
          inTable = headerCols.size > 0;
        }
      } else if (inTable && headerCols && !isSeparatorRow(trimmed)) {
        // Data row inside a vocabulary-keyed table.
        const cells = splitTableRow(trimmed);
        for (const [colIdx, vocabName] of headerCols) {
          const raw = cells[colIdx];
          if (raw == null || isSkippableCell(raw)) continue;
          const val = cellValue(raw);
          if (!VOCABS[vocabName].has(val)) {
            violations.push({ file: filePath, line: lineNo, vocabName, value: val });
          }
        }
      } else if (!trimmed.startsWith('|')) {
        // Left the table
        inTable = false;
        headerCols = null;
      }
    } else {
      inTable = false;
      headerCols = null;

      // ── Prose pattern ────────────────────────────────────────────────
      PROSE_VOCAB_RE.lastIndex = 0;
      let m;
      while ((m = PROSE_VOCAB_RE.exec(line)) !== null) {
        const label = m[1].replace(/\s+/g, ' ').toLowerCase();
        const val = m[2];
        const vocabName = headerToVocab(label);
        if (!vocabName) continue;
        if (!VOCABS[vocabName].has(val)) {
          violations.push({ file: filePath, line: lineNo, vocabName, value: val });
        }
      }
    }
  }

  return violations;
}

// ── Reporter ─────────────────────────────────────────────────────────────

function renderViolations(allViolations, scannedCount, cwd) {
  if (allViolations.length === 0) {
    return `bcs-vocab-check: clean — ${scannedCount} MDX file(s) scanned, 0 undefined BCS vocabulary values\n`;
  }

  const lines = [
    `bcs-vocab-check: ${allViolations.length} undefined BCS vocabulary value(s) — parallel taxonomy drift`,
    `  Source of truth: content-system/vocabularies/ + content-system/blueprints/vocabularies.ts`,
    `  Scanned ${scannedCount} MDX files`,
    ``,
  ];

  for (const v of allViolations) {
    const rel = relative(cwd, v.file).split(sep).join('/');
    lines.push(`  ${rel}:${v.line}  ${v.vocabName}: \`${v.value}\`  (not in ${v.vocabName.toUpperCase()}_VALUES)`);
  }

  lines.push('');
  lines.push('  To fix: update the MDX value to match the locked enum, or add the value to the enum');
  lines.push('  and open a BCS vocabulary PR. Do not invent values per-doc; graduate them.');
  return lines.join('\n') + '\n';
}

// ── Main ─────────────────────────────────────────────────────────────────

const USAGE = `bcs-vocab-check — BCS vocabulary drift gate for docs-site MDX

Usage:
  bcs-vocab-check [mdx-dir]    Scan MDX directory (default: docs-site/content/docs)
  bcs-vocab-check --help       Show this message

Exit codes:
  0  Clean — all referenced vocabulary values are canonical
  1  Violations found
  2  Bad invocation

Source of truth: content-system/vocabularies/ + content-system/blueprints/vocabularies.ts
Issue: brik-bds#534
`;

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(USAGE);
    process.exit(0);
  }

  const mdxDir = args[0] ?? resolve(BDS_ROOT, 'docs-site', 'content', 'docs');

  if (!existsSync(mdxDir)) {
    process.stderr.write(`bcs-vocab-check: MDX directory not found: ${mdxDir}\n`);
    process.exit(2);
  }

  const files = walkMdx(mdxDir);
  if (files.length === 0) {
    process.stderr.write(`bcs-vocab-check: no MDX files found in ${mdxDir}\n`);
    process.exit(2);
  }

  const allViolations = [];
  for (const file of files) {
    allViolations.push(...scanFile(file));
  }

  process.stdout.write(renderViolations(allViolations, files.length, process.cwd()));
  process.exit(allViolations.length > 0 ? 1 : 0);
}

main();
