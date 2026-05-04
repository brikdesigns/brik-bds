#!/usr/bin/env node

/**
 * Storybook Page Recipe Linter (ADR-007)
 *
 * Validates every components/ui/(asterisk)/(asterisk).mdx file against the recipe
 * defined in docs/adrs/ADR-007-storybook-page-recipe.md. Reports violations
 * grouped by severity.
 *
 * Phase 1 (now): informational — exits 0 even with violations so CI stays
 * green during the migration window. The output tells authors which pages
 * still need work and is the success metric for Phase 3 batch migration.
 *
 * Phase 3+: re-wire to exit 1 on violations, gate pre-commit + CI.
 *
 * Usage:
 *   node scripts/lint-storybook-recipe.js               # full report
 *   node scripts/lint-storybook-recipe.js --conforming  # list files that pass
 *   node scripts/lint-storybook-recipe.js --json        # machine-readable
 *   node scripts/lint-storybook-recipe.js --enforce     # exit 1 on violations
 *
 * Exit codes:
 *   0 — recipe report printed (default; --enforce changes this)
 *   1 — fatal error (file not found, glob mismatch) OR violations under --enforce
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Recipe (mirror of ADR-007, Acceptance Criteria 1-9)
// ---------------------------------------------------------------------------

const REQUIRED_SECTIONS = ['## Playground', '## Variants', '## Patterns', '## Props'];

// H2 sections that MUST contain at least one `<Canvas of=...>` somewhere in
// their body (including H3 sub-sections). Props uses `<ArgTypes>` not
// `<Canvas>` and is excluded.
const SECTIONS_REQUIRING_CANVAS = ['## Playground', '## Variants', '## Patterns'];

// Optional sections must, if present, follow `## Props` in this order.
const OPTIONAL_SECTIONS_AFTER_PROPS = ['## CSS Override API', '## Notes'];

// Banned section headings — these belong on docs-site, not in Storybook.
const BANNED_SECTIONS = [
  '## Usage',
  '## When to use',
  '## When NOT to use',
  '## When not to use',
  '## Source attribution',
  '## Tokens',
];

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const FLAG_CONFORMING = args.includes('--conforming');
const FLAG_JSON = args.includes('--json');
const FLAG_ENFORCE = args.includes('--enforce');

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(REPO_ROOT, 'components', 'ui');

function findComponentMdx() {
  const dirs = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const out = [];
  for (const dir of dirs) {
    const mdx = path.join(COMPONENTS_DIR, dir, `${dir}.mdx`);
    if (fs.existsSync(mdx)) out.push(mdx);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Per-file lint
// ---------------------------------------------------------------------------

/** @returns {{file: string, violations: Array<{rule: string, message: string, line?: number}>}} */
function lintFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  // Find headings and dividers
  const headings = [];
  const dividers = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^#{1,6} /.test(line)) {
      const level = line.match(/^(#{1,6}) /)[1].length;
      headings.push({ level, text: line.trim(), line: i + 1 });
    }
    if (/^---\s*$/.test(line)) dividers.push(i + 1);
  }

  // Rule: no `---` dividers
  for (const ln of dividers) {
    violations.push({
      rule: 'no-dividers',
      message: '`---` divider — banned by recipe; H2 spacing already provides section breaks',
      line: ln,
    });
  }

  // Rule: file has Meta block
  if (!/<Meta of=\{Stories\}\s*\/>/.test(content)) {
    violations.push({
      rule: 'meta-block',
      message: 'Missing `<Meta of={Stories} />` — must appear before the H1',
    });
  }

  // Rule: H1 exists, exactly one
  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length === 0) {
    violations.push({ rule: 'h1-required', message: 'No H1 — every page must start with `# {Component name}`' });
  } else if (h1s.length > 1) {
    violations.push({
      rule: 'h1-single',
      message: `${h1s.length} H1 headings — only one per page`,
      line: h1s[1].line,
    });
  }

  // Rule: ComponentLinks block present after H1 (anywhere in the file, since we
  // can't easily check positional order without a real MDX parser)
  if (!/<ComponentLinks\b/.test(content)) {
    violations.push({
      rule: 'component-links',
      message: 'Missing `<ComponentLinks slug="..." />` block — required after the H1 per ADR-007',
    });
  }

  // Rule: required H2 sections, in order
  const h2s = headings.filter((h) => h.level === 2);
  const h2Texts = h2s.map((h) => h.text);

  for (const required of REQUIRED_SECTIONS) {
    if (!h2Texts.includes(required)) {
      violations.push({
        rule: 'missing-required-section',
        message: `Missing required section: \`${required}\``,
      });
    }
  }

  // Required sections are in order (when all present)
  const requiredPresent = REQUIRED_SECTIONS.filter((s) => h2Texts.includes(s));
  const requiredIndices = requiredPresent.map((s) => h2Texts.indexOf(s));
  const isOrdered = requiredIndices.every((idx, i) => i === 0 || idx > requiredIndices[i - 1]);
  if (!isOrdered) {
    violations.push({
      rule: 'required-section-order',
      message: `Required sections are out of order. Expected: ${REQUIRED_SECTIONS.join(' → ')}`,
    });
  }

  // Rule: optional sections appear AFTER `## Props`
  const propsIdx = h2Texts.indexOf('## Props');
  if (propsIdx !== -1) {
    for (const opt of OPTIONAL_SECTIONS_AFTER_PROPS) {
      const optIdx = h2Texts.indexOf(opt);
      if (optIdx !== -1 && optIdx < propsIdx) {
        violations.push({
          rule: 'optional-section-position',
          message: `\`${opt}\` must appear after \`## Props\``,
          line: h2s[optIdx].line,
        });
      }
    }
  }

  // Rule: banned sections
  for (const banned of BANNED_SECTIONS) {
    const idx = h2Texts.findIndex((h) => h.toLowerCase() === banned.toLowerCase());
    if (idx !== -1) {
      violations.push({
        rule: 'banned-section',
        message: `\`${banned}\` is banned — narrative belongs on design.brikdesigns.com (linked via ComponentLinks)`,
        line: h2s[idx].line,
      });
    }
  }

  // Rule: no skipped heading levels (H1 → H3 jump)
  let lastLevel = 0;
  for (const h of headings) {
    if (h.level > lastLevel + 1 && lastLevel !== 0) {
      violations.push({
        rule: 'heading-skip',
        message: `Heading level skip: H${lastLevel} → H${h.level} at "${h.text}". Always step by one.`,
        line: h.line,
      });
    }
    lastLevel = h.level;
  }

  // Rule: required H2 sections must contain at least one `<Canvas` reference.
  // Slices the file by H2 boundaries so a Canvas under a `### Sub-variant` H3
  // counts toward its parent `## Variants` H2. Props is excluded — it uses
  // `<ArgTypes>` not `<Canvas>`.
  const h2Lines = h2s.map((h) => h.line);
  function bodyOfH2(h2Line) {
    // h2Line is 1-indexed; section spans from the line after the H2 to the line
    // before the next H2 (or EOF).
    const startIdx = h2Line; // skip the H2 line itself (lines is 0-indexed, h2Line is 1-indexed → next line = h2Line)
    const nextH2Line = h2Lines.find((l) => l > h2Line);
    const endIdxExclusive = nextH2Line ? nextH2Line - 1 : lines.length;
    return lines.slice(startIdx, endIdxExclusive).join('\n');
  }

  for (const required of SECTIONS_REQUIRING_CANVAS) {
    const h2 = h2s.find((h) => h.text === required);
    if (!h2) continue; // already flagged by missing-required-section
    const body = bodyOfH2(h2.line);
    if (!/<Canvas\b/.test(body)) {
      violations.push({
        rule: 'missing-canvas',
        message: `\`${required}\` has no \`<Canvas>\` block. Required sections must demo at least one story.`,
        line: h2.line,
      });
    }
  }

  // Rule: every `<Canvas of={Stories.X}>` must reference a real export in the
  // matching `*.stories.tsx`. Catches stale renames (story exports renamed
  // without updating MDX) and typos.
  const componentDir = path.dirname(filePath);
  const componentName = path.basename(componentDir);
  const storiesPath = path.join(componentDir, `${componentName}.stories.tsx`);
  if (fs.existsSync(storiesPath)) {
    const storiesContent = fs.readFileSync(storiesPath, 'utf8');
    const exportNames = new Set();
    const exportRe = /^export const ([A-Z][A-Za-z0-9_]*)\b/gm;
    let m;
    while ((m = exportRe.exec(storiesContent)) !== null) {
      exportNames.add(m[1]);
    }

    const canvasRefRe = /<Canvas\s+of=\{Stories\.([A-Z][A-Za-z0-9_]*)\}/g;
    let cm;
    while ((cm = canvasRefRe.exec(content)) !== null) {
      const ref = cm[1];
      if (!exportNames.has(ref)) {
        // Approximate the line by counting newlines up to the match index.
        const line = content.slice(0, cm.index).split('\n').length;
        violations.push({
          rule: 'canvas-story-missing',
          message: `\`<Canvas of={Stories.${ref}}>\` references no matching export in ${componentName}.stories.tsx`,
          line,
        });
      }
    }
  }

  return {
    file: path.relative(REPO_ROOT, filePath),
    violations,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const files = findComponentMdx();
  if (files.length === 0) {
    console.error(`No component MDX files found under ${COMPONENTS_DIR}`);
    process.exit(1);
  }

  const results = files.map(lintFile);
  const conforming = results.filter((r) => r.violations.length === 0);
  const violating = results.filter((r) => r.violations.length > 0);

  if (FLAG_JSON) {
    console.log(JSON.stringify({
      total: results.length,
      conforming: conforming.length,
      violating: violating.length,
      results,
    }, null, 2));
    process.exit(FLAG_ENFORCE && violating.length > 0 ? 1 : 0);
  }

  // Human report
  console.log(`\nADR-007 Storybook page recipe lint`);
  console.log(`════════════════════════════════════════════════════════════`);
  console.log(`Total component MDX pages: ${results.length}`);
  console.log(`Conforming:                ${conforming.length}`);
  console.log(`Violating:                 ${violating.length}\n`);

  if (FLAG_CONFORMING) {
    if (conforming.length === 0) {
      console.log('(No pages conform yet — Phase 2 lands the first one.)\n');
    } else {
      console.log('Conforming files:');
      for (const r of conforming) console.log(`  ✓ ${r.file}`);
      console.log('');
    }
    process.exit(0);
  }

  // Summarize violations by rule across the whole codebase
  const byRule = new Map();
  for (const r of violating) {
    for (const v of r.violations) {
      byRule.set(v.rule, (byRule.get(v.rule) || 0) + 1);
    }
  }
  if (byRule.size > 0) {
    console.log('Violations by rule:');
    const sortedRules = Array.from(byRule.entries()).sort((a, b) => b[1] - a[1]);
    for (const [rule, count] of sortedRules) {
      console.log(`  ${String(count).padStart(4)}× ${rule}`);
    }
    console.log('');
  }

  // Per-file detail (capped)
  const SHOW_PER_FILE = 10;
  if (violating.length > 0) {
    const shown = violating.slice(0, SHOW_PER_FILE);
    console.log(`Per-file details (first ${shown.length} of ${violating.length}):`);
    for (const r of shown) {
      console.log(`\n  ${r.file}`);
      for (const v of r.violations) {
        const loc = v.line ? `:${v.line}` : '';
        console.log(`    [${v.rule}]${loc} ${v.message}`);
      }
    }
    console.log('');
    if (violating.length > SHOW_PER_FILE) {
      console.log(`(${violating.length - SHOW_PER_FILE} more files with violations — re-run with --json for full output.)\n`);
    }
  }

  if (FLAG_ENFORCE && violating.length > 0) {
    console.log('--enforce: violations detected, exiting 1');
    process.exit(1);
  }
  process.exit(0);
}

main();
