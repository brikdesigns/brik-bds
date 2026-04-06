#!/usr/bin/env node

/**
 * BDS Design System Health Check
 *
 * Reports on metrics NOT covered by other scripts:
 *   - Component completeness (story, MDX, CSS for each component)
 *   - Portal adoption (which BDS components are used in consuming projects)
 *   - Bundle size (dist/ output)
 *   - Dependency freshness (outdated packages)
 *
 * Already covered elsewhere (not duplicated here):
 *   - Token linting          → npm run lint-tokens
 *   - Grid compliance        → npm run audit:grid
 *   - File structure (index) → .husky/pre-commit
 *   - Type safety            → npm run typecheck
 *   - Storybook build        → npm run validate
 *   - Visual regression      → npm run chromatic
 *
 * Usage:
 *   node scripts/health.js              # full report
 *   node scripts/health.js --json       # machine-readable JSON
 *   node scripts/health.js --section X  # run one section (completeness|adoption|bundle|deps)
 *
 * Exit codes:
 *   0 = healthy (warnings OK)
 *   1 = issues found that need attention
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Config ──────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components', 'ui');
const DIST_DIR = path.join(ROOT, 'dist');

// Consumer projects to check adoption against (relative to ROOT)
const CONSUMERS = [
  {
    name: 'brik-client-portal',
    srcDir: path.resolve(ROOT, '..', '..', 'product', 'brik-client-portal', 'src'),
  },
];

// Components designed for Webflow sites, not portal apps.
// Excluded from adoption tracking to avoid false negatives.
const WEBSITE_ONLY = new Set([
  'Footer',
  'NavBar',
  'PricingCard',
  'CardFeature',
  'CardTestimonial',
  'CardDisplay',
]);

// Documentation-only or placeholder directories — no exported component,
// so a CSS file is not expected. Excluded from CSS completeness check.
const DOCS_ONLY = new Set([
  'Calendar',  // placeholder — calendar is a sub-component of DatePicker
  'Icons',     // reference page — icon grid stories only, no styled component
]);

// ─── CLI args ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const sectionFilter = args.includes('--section')
  ? args[args.indexOf('--section') + 1]
  : null;

// ─── Helpers ─────────────────────────────────────────────────────────

function heading(text) {
  if (jsonMode) return;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${text}`);
  console.log('─'.repeat(60));
}

function warn(msg) {
  if (!jsonMode) console.log(`  ⚠  ${msg}`);
}

function ok(msg) {
  if (!jsonMode) console.log(`  ✓  ${msg}`);
}

function info(msg) {
  if (!jsonMode) console.log(`     ${msg}`);
}

function dirSize(dir) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += dirSize(full);
    } else {
      total += fs.statSync(full).size;
    }
  }
  return total;
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── 1. Component Completeness ───────────────────────────────────────

function checkCompleteness() {
  heading('Component Completeness');

  const components = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  const results = [];
  const gaps = [];

  for (const name of components) {
    const dir = path.join(COMPONENTS_DIR, name);
    const hasStory = fs.existsSync(path.join(dir, `${name}.stories.tsx`));
    const hasMdx = fs.existsSync(path.join(dir, `${name}.mdx`));
    const hasCss = fs.existsSync(path.join(dir, `${name}.css`));
    const hasIndex = fs.existsSync(path.join(dir, 'index.ts'));

    const missing = [];
    if (!hasStory) missing.push('story');
    if (!hasMdx) missing.push('mdx');
    if (!hasCss && !DOCS_ONLY.has(name)) missing.push('css');
    if (!hasIndex) missing.push('index');

    results.push({ name, hasStory, hasMdx, hasCss, hasIndex, missing });

    if (missing.length > 0) {
      gaps.push({ name, missing });
    }
  }

  const complete = results.filter(r => r.missing.length === 0).length;
  const total = results.length;
  const pct = Math.round((complete / total) * 100);

  if (!jsonMode) {
    ok(`${complete}/${total} components fully complete (${pct}%)`);
    if (gaps.length > 0) {
      console.log('');
      for (const g of gaps) {
        warn(`${g.name} — missing: ${g.missing.join(', ')}`);
      }
    }
  }

  return { total, complete, pct, gaps };
}

// ─── 2. Portal Adoption ─────────────────────────────────────────────

function checkAdoption() {
  heading('Portal Adoption');

  const allComponents = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  const adoptable = allComponents.filter(c => !WEBSITE_ONLY.has(c));
  const consumers = [];

  for (const consumer of CONSUMERS) {
    if (!fs.existsSync(consumer.srcDir)) {
      warn(`${consumer.name} not found at ${consumer.srcDir} — skipping`);
      consumers.push({ name: consumer.name, error: 'not found', adopted: [], unadopted: [] });
      continue;
    }

    // grep for BDS component imports
    let grepOutput = '';
    try {
      grepOutput = execSync(
        `grep -roh "components/ui/[A-Za-z]*" "${consumer.srcDir}" --include="*.tsx" --include="*.ts" 2>/dev/null`,
        { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
      );
    } catch (e) {
      // grep exits 1 when no matches
      if (e.stdout) grepOutput = e.stdout;
    }

    // Count imports per component
    const counts = {};
    for (const line of grepOutput.trim().split('\n')) {
      const match = line.match(/components\/ui\/(\w+)/);
      if (match) counts[match[1]] = (counts[match[1]] || 0) + 1;
    }

    const adopted = adoptable.filter(c => counts[c]).map(c => ({ name: c, imports: counts[c] }));
    const unadopted = adoptable.filter(c => !counts[c]);

    const adoptedPct = Math.round((adopted.length / adoptable.length) * 100);

    if (!jsonMode) {
      ok(`${consumer.name}: ${adopted.length}/${adoptable.length} adoptable components used (${adoptedPct}%)`);
      info(`(${WEBSITE_ONLY.size} website-only components excluded from count)`);

      if (adopted.length > 0) {
        console.log('');
        info('Top used:');
        const top = [...adopted].sort((a, b) => b.imports - a.imports).slice(0, 10);
        for (const c of top) {
          info(`  ${c.name.padEnd(20)} ${c.imports} imports`);
        }
      }

      if (unadopted.length > 0) {
        console.log('');
        info('Not yet adopted:');
        // Group into rows of 4 for compact display
        for (let i = 0; i < unadopted.length; i += 4) {
          const row = unadopted.slice(i, i + 4).map(c => c.padEnd(20)).join('');
          info(`  ${row}`);
        }
      }
    }

    consumers.push({
      name: consumer.name,
      total: adoptable.length,
      adopted: adopted.length,
      adoptedPct,
      unadopted: unadopted.length,
      unadoptedList: unadopted,
      topUsed: [...adopted].sort((a, b) => b.imports - a.imports).slice(0, 10),
    });
  }

  return { websiteOnly: [...WEBSITE_ONLY], consumers };
}

// ─── 3. Bundle Size ──────────────────────────────────────────────────

function checkBundle() {
  heading('Bundle Size');

  if (!fs.existsSync(DIST_DIR)) {
    warn('dist/ not found — run `npm run build:lib` first');
    return { error: 'dist not found' };
  }

  const files = fs.readdirSync(DIST_DIR)
    .filter(f => !fs.statSync(path.join(DIST_DIR, f)).isDirectory())
    .map(f => ({
      name: f,
      size: fs.statSync(path.join(DIST_DIR, f)).size,
    }))
    .sort((a, b) => b.size - a.size);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  if (!jsonMode) {
    ok(`Total dist size: ${humanSize(totalSize)}`);
    console.log('');
    for (const f of files) {
      info(`${f.name.padEnd(30)} ${humanSize(f.size).padStart(10)}`);
    }

    // Warn if any single file exceeds 500KB
    const large = files.filter(f => f.size > 500 * 1024);
    if (large.length > 0) {
      console.log('');
      for (const f of large) {
        warn(`${f.name} exceeds 500KB — consider code splitting`);
      }
    }
  }

  return {
    totalSize,
    totalHuman: humanSize(totalSize),
    files: files.map(f => ({ name: f.name, size: f.size, human: humanSize(f.size) })),
  };
}

// ─── 4. Dependency Freshness ─────────────────────────────────────────

function checkDeps() {
  heading('Dependency Freshness');

  let outdatedOutput = '';
  try {
    outdatedOutput = execSync('npm outdated --json 2>/dev/null', {
      encoding: 'utf8',
      cwd: ROOT,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (e) {
    // npm outdated exits 1 when packages are outdated
    if (e.stdout) outdatedOutput = e.stdout;
  }

  let outdated = {};
  try {
    outdated = JSON.parse(outdatedOutput || '{}');
  } catch {
    if (!jsonMode) warn('Could not parse npm outdated output');
    return { error: 'parse failed' };
  }

  const packages = Object.entries(outdated).map(([name, info]) => {
    const isMajor = info.latest && info.current &&
      info.latest.split('.')[0] !== info.current.split('.')[0];
    return {
      name,
      current: info.current,
      wanted: info.wanted,
      latest: info.latest,
      isMajor,
    };
  });

  const major = packages.filter(p => p.isMajor);
  const minor = packages.filter(p => !p.isMajor);

  if (!jsonMode) {
    if (packages.length === 0) {
      ok('All dependencies up to date');
    } else {
      ok(`${packages.length} outdated (${major.length} major, ${minor.length} minor/patch)`);

      if (major.length > 0) {
        console.log('');
        info('Major version bumps available:');
        for (const p of major) {
          warn(`${p.name.padEnd(30)} ${p.current} → ${p.latest}`);
        }
      }

      if (minor.length > 0) {
        console.log('');
        info('Minor/patch updates:');
        for (const p of minor) {
          info(`  ${p.name.padEnd(30)} ${p.current} → ${p.latest}`);
        }
      }
    }
  }

  return { total: packages.length, major, minor };
}

// ─── Run ─────────────────────────────────────────────────────────────

function run() {
  if (!jsonMode) {
    console.log('\n  BDS Design System Health Check');
    console.log('  ' + new Date().toISOString().slice(0, 10));
  }

  const sections = {
    completeness: checkCompleteness,
    adoption: checkAdoption,
    bundle: checkBundle,
    deps: checkDeps,
  };

  const results = {};
  let hasIssues = false;

  for (const [name, fn] of Object.entries(sections)) {
    if (sectionFilter && name !== sectionFilter) continue;
    results[name] = fn();
  }

  // Determine exit code
  if (results.completeness && results.completeness.pct < 90) hasIssues = true;
  if (results.deps && results.deps.major && results.deps.major.length > 3) hasIssues = true;

  if (jsonMode) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    heading('Summary');
    if (results.completeness) {
      const c = results.completeness;
      const icon = c.pct >= 95 ? '✓' : c.pct >= 80 ? '~' : '✗';
      info(`${icon} Completeness: ${c.pct}% (${c.complete}/${c.total})`);
    }
    if (results.adoption) {
      for (const consumer of results.adoption.consumers) {
        if (consumer.error) continue;
        const icon = consumer.adoptedPct >= 60 ? '✓' : consumer.adoptedPct >= 40 ? '~' : '✗';
        info(`${icon} Adoption (${consumer.name}): ${consumer.adoptedPct}% (${consumer.adopted}/${consumer.total})`);
      }
    }
    if (results.bundle && !results.bundle.error) {
      info(`✓ Bundle: ${results.bundle.totalHuman}`);
    }
    if (results.deps) {
      const d = results.deps;
      const icon = d.major && d.major.length === 0 ? '✓' : '~';
      info(`${icon} Dependencies: ${d.total || 0} outdated (${d.major ? d.major.length : 0} major)`);
    }
    console.log('');
  }

  process.exit(hasIssues ? 1 : 0);
}

run();
