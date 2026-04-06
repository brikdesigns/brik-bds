#!/usr/bin/env node

/**
 * BDS Token Coverage Report
 *
 * Analyzes which design tokens are actually used in component CSS,
 * identifies orphaned tokens, and reports hardcoded value counts.
 *
 * Usage:
 *   node scripts/token-coverage.js         # human-readable report
 *   node scripts/token-coverage.js --json  # machine-readable JSON
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components', 'ui');
const TOKEN_SOURCES = [
  path.join(ROOT, 'tokens', 'figma-tokens.css'),
  path.join(ROOT, 'tokens', 'gap-fills.css'),
];

const jsonMode = process.argv.includes('--json');

// ─── Parse token definitions ────────────────────────────────────────

function parseDefinedTokens() {
  const tokens = new Set();
  for (const src of TOKEN_SOURCES) {
    if (!fs.existsSync(src)) continue;
    const css = fs.readFileSync(src, 'utf8');
    const re = /^\s*(--[\w-]+)\s*:/gm;
    let m;
    while ((m = re.exec(css)) !== null) {
      tokens.add(m[1]);
    }
  }
  return tokens;
}

// ─── Scan component CSS for var() references ────────────────────────

function findFiles(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

function scanUsage() {
  const cssFiles = findFiles(COMPONENTS_DIR, '.css');
  const tsxFiles = findFiles(COMPONENTS_DIR, '.tsx');
  const allFiles = [...cssFiles, ...tsxFiles];

  // token → Set of component names
  const usage = new Map();
  // component → count of hardcoded values
  const hardcoded = new Map();

  const varRe = /var\((--[\w-]+)\)/g;
  const hardcodedRe = /:\s*(\d+(?:\.\d+)?px)\s*[;,}]/g;

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('bds-lint-ignore')) {
      // Skip lines with lint-ignore for hardcoded counting
    }

    // Extract component name from path
    const rel = path.relative(COMPONENTS_DIR, file);
    const component = rel.split(path.sep)[0];

    // Find token references
    let m;
    while ((m = varRe.exec(content)) !== null) {
      const token = m[1];
      if (!usage.has(token)) usage.set(token, new Set());
      usage.get(token).add(component);
    }

    // Count hardcoded px values (excluding lint-ignored lines)
    const lines = content.split('\n');
    let count = 0;
    for (const line of lines) {
      if (line.includes('bds-lint-ignore')) continue;
      if (line.trimStart().startsWith('//')) continue;
      if (line.trimStart().startsWith('/*')) continue;
      if (line.trimStart().startsWith('*')) continue;
      let hm;
      while ((hm = hardcodedRe.exec(line)) !== null) {
        count++;
      }
    }
    if (count > 0) {
      hardcoded.set(component, (hardcoded.get(component) || 0) + count);
    }
  }

  return { usage, hardcoded };
}

// ─── Analyze ────────────────────────────────────────────────────────

function analyze() {
  const defined = parseDefinedTokens();
  const { usage, hardcoded } = scanUsage();

  // Used tokens (defined AND referenced)
  const used = [];
  const usedSet = new Set();
  for (const [token, components] of usage) {
    if (defined.has(token)) {
      used.push({ token, components: [...components].sort(), count: components.size });
      usedSet.add(token);
    }
  }
  used.sort((a, b) => b.count - a.count);

  // Orphaned tokens (defined but NOT referenced in any component)
  const orphaned = [...defined].filter(t => !usedSet.has(t)).sort();

  // Undeclared references (used in components but not in token sources)
  const undeclared = [];
  for (const [token, components] of usage) {
    if (!defined.has(token)) {
      undeclared.push({ token, components: [...components].sort() });
    }
  }
  undeclared.sort((a, b) => a.token.localeCompare(b.token));

  // Hardcoded value leaderboard
  const hardcodedList = [...hardcoded.entries()]
    .map(([component, count]) => ({ component, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalDefined: defined.size,
    totalUsed: used.length,
    totalOrphaned: orphaned.length,
    usagePct: defined.size > 0 ? Math.round((used.length / defined.size) * 100) : 0,
    used,
    orphaned,
    undeclared,
    hardcoded: hardcodedList,
  };
}

// ─── Output ─────────────────────────────────────────────────────────

const results = analyze();

if (jsonMode) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log('\n📊 BDS Token Coverage Report\n');
  console.log(`  Defined: ${results.totalDefined} tokens`);
  console.log(`  Used:    ${results.totalUsed} (${results.usagePct}%)`);
  console.log(`  Orphaned: ${results.totalOrphaned}\n`);

  if (results.orphaned.length > 0) {
    console.log('  Orphaned tokens (defined but unreferenced):');
    // Group by category
    const categories = {};
    for (const t of results.orphaned) {
      const cat = t.replace(/^--/, '').split('-')[0];
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(t);
    }
    for (const [cat, tokens] of Object.entries(categories)) {
      console.log(`    ${cat}: ${tokens.length} tokens`);
    }
    console.log('');
  }

  if (results.hardcoded.length > 0) {
    console.log('  Hardcoded value counts (by component):');
    for (const { component, count } of results.hardcoded.slice(0, 10)) {
      console.log(`    ${component.padEnd(25)} ${count} values`);
    }
    console.log('');
  }

  if (results.undeclared.length > 0) {
    console.log(`  Undeclared references (${results.undeclared.length} tokens used but not in sources):`);
    for (const { token } of results.undeclared.slice(0, 10)) {
      console.log(`    ${token}`);
    }
    if (results.undeclared.length > 10) {
      console.log(`    ... and ${results.undeclared.length - 10} more`);
    }
    console.log('');
  }
}
