#!/usr/bin/env node
/**
 * lint-mdx-deprecations — a component deprecated at the component level in
 * source must carry a deprecation callout on its docs page, so a deprecated
 * component can't keep being documented as first-class.
 *
 * ── Why ──────────────────────────────────────────────────────────────────────
 * The docs-site audit (#1358, Theme 3) found the deprecation blind spot: several
 * components carry a component-level `@deprecated` in source yet their docs page
 * reads as current, steering consumers onto a component slated for removal. Wave
 * 1 (#1367) fixed the ones it caught by hand; this gate makes it durable so the
 * next deprecation can't ship a stale page (Wave 4 drift gate, #1362).
 *
 * ── What counts as "deprecated" (component level only) ─────────────────────────
 * A component `{Name}` under `components/ui/{Name}/` is deprecated when EITHER:
 *   • `{Name}.tsx` has a JSDoc `@deprecated` block immediately preceding the
 *     component's own `export function/const/class {Name}` — i.e. the tag
 *     documents the component symbol, not a prop inside an interface; or
 *   • a `*.stories.tsx` in the dir sets `title: 'Deprecated/…'` (the maintained
 *     Storybook signal for a retired component).
 * Member-level `@deprecated` (a single prop or enum value — Tag's `interactive`,
 * Frame's ratio aliases, SidebarNavigation's `avatar`) is deliberately NOT a
 * deprecation of the component and is out of scope.
 *
 * ── The requirement ─────────────────────────────────────────────────────────────
 * If a deprecated component has its own docs page
 * (`docs-site/content/docs/components/{kebab-name}.mdx`), that page must carry a
 * deprecation callout: a `<Callout type="warn|error">` whose body contains the
 * word "deprecated", or a frontmatter `description` beginning "DEPRECATED".
 *
 * A deprecated component with NO own page (documented as a section of another
 * page — e.g. IconButton / LinkButton live in button.mdx) is reported as
 * informational, never a failure: section-level coverage is out of this gate's
 * scope, but the mapping is surfaced so the gap is never silent.
 *
 * ── Exit codes ─────────────────────────────────────────────────────────────────
 *   0  Clean — every own-page deprecated component has a callout
 *   1  A deprecated component's own page lacks a deprecation callout
 *   2  Bad invocation
 *
 * ── CLI ────────────────────────────────────────────────────────────────────────
 *   lint-mdx-deprecations [--json]
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DEFAULT_COMPONENTS_DIR = join(REPO_ROOT, 'components', 'ui');
const DEFAULT_DOCS_COMPONENTS = join(REPO_ROOT, 'docs-site', 'content', 'docs', 'components');

// PascalCase → kebab-case (AddableComboList → addable-combo-list, IconButton →
// icon-button). Matches the docs-site component page slugs.
function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function relPosix(abs) {
  return relative(REPO_ROOT, abs).split(sep).join('/');
}

// ── Detect component-level deprecation ─────────────────────────────────────────

const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g;
// The exported symbol a JSDoc block sits on. A prop-level @deprecated is inside
// an interface — followed by a member, not `export function/const/class` — so it
// never matches here. Returns the exported names carrying a @deprecated block.
const EXPORT_AFTER = /^\s*export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+([A-Za-z0-9_]+)/;
function deprecatedExportsIn(src) {
  const names = [];
  for (const m of src.matchAll(JSDOC_RE)) {
    if (!/@deprecated/.test(m[0])) continue;
    const em = EXPORT_AFTER.exec(src.slice(m.index + m[0].length));
    if (em) names.push(em[1]);
  }
  return names;
}

const DEPRECATED_TITLE_RE = /title:\s*['"]Deprecated\//;
const isComponentSrc = (f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx') && !f.endsWith('.test.tsx');

function deprecatedComponents(componentsDir) {
  // name → { name, slug, sources } — a component may be flagged by both its
  // source @deprecated and a Deprecated/ story title (both recorded).
  const byName = new Map();
  const add = (name, source) => {
    const rec = byName.get(name) || { name, slug: kebab(name), sources: [] };
    rec.sources.push(source);
    byName.set(name, rec);
  };
  if (!existsSync(componentsDir)) return [];
  for (const dir of readdirSync(componentsDir)) {
    const full = join(componentsDir, dir);
    if (!statSync(full).isDirectory()) continue;
    for (const f of readdirSync(full)) {
      const fp = join(full, f);
      if (isComponentSrc(f)) {
        for (const name of deprecatedExportsIn(readFileSync(fp, 'utf8'))) {
          add(name, `${f} @deprecated on export ${name}`);
        }
      } else if (f.endsWith('.stories.tsx') && DEPRECATED_TITLE_RE.test(readFileSync(fp, 'utf8'))) {
        // The retired component is the dir's namesake.
        add(dir, `${f} title: Deprecated/`);
      }
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ── Detect a deprecation callout on a docs page ─────────────────────────────────

function hasDeprecationCallout(mdx) {
  // Frontmatter description beginning DEPRECATED.
  if (/^description:\s*["']?DEPRECATED/im.test(mdx)) return true;
  // A warn/error Callout whose body mentions "deprecated".
  const calloutRe = /<Callout\s+type=["'](?:warn|error)["'][^>]*>([\s\S]*?)<\/Callout>/gi;
  for (const m of mdx.matchAll(calloutRe)) {
    if (/deprecated/i.test(m[1])) return true;
  }
  return false;
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const opt = (flag, dflt) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? resolve(args[i + 1]) : dflt;
  };
  const componentsDir = opt('--components', DEFAULT_COMPONENTS_DIR);
  const docsComponents = opt('--docs', DEFAULT_DOCS_COMPONENTS);

  const deprecated = deprecatedComponents(componentsDir);
  const violations = [];
  const noPage = [];

  for (const c of deprecated) {
    const page = join(docsComponents, `${c.slug}.mdx`);
    if (!existsSync(page)) {
      noPage.push(c);
      continue;
    }
    if (!hasDeprecationCallout(readFileSync(page, 'utf8'))) {
      violations.push({ ...c, page: relPosix(page) });
    }
  }

  if (jsonMode) {
    console.log(JSON.stringify({
      deprecated: deprecated.map((c) => ({ name: c.name, slug: c.slug, sources: c.sources })),
      noPage: noPage.map((c) => c.name),
      violations,
    }, null, 2));
    process.exit(violations.length > 0 ? 1 : 0);
  }

  if (deprecated.length === 0) {
    console.log('lint-mdx-deprecations: no component-level deprecations found\n');
    process.exit(0);
  }

  if (noPage.length) {
    console.log(
      `lint-mdx-deprecations: ${noPage.length} deprecated component(s) with no own page ` +
      `(documented elsewhere, not gated): ${noPage.map((c) => c.name).join(', ')}\n`,
    );
  }

  if (violations.length === 0) {
    console.log(
      `lint-mdx-deprecations: clean — ${deprecated.length} deprecated component(s), ` +
      `every own page carries a deprecation callout\n`,
    );
    process.exit(0);
  }

  console.log(`\nlint-mdx-deprecations: ${violations.length} deprecated component(s) documented as current\n`);
  for (const v of violations) {
    console.log(`  \x1b[31m${v.name}\x1b[0m — ${v.page} has no deprecation callout`);
    console.log(`    deprecated by: ${v.sources.join('; ')}`);
  }
  console.log(
    '\n  A component deprecated at the component level must say so on its docs\n' +
    '  page. Add a <Callout type="warn"> naming the successor, e.g.:\n\n' +
    '    <Callout type="warn">\n' +
    '      **<Name> is deprecated.** Migrate to [`<Successor>`](…).\n' +
    '    </Callout>\n\n' +
    '  (Match an existing deprecated page — card-control.mdx, collapsible-card.mdx.)\n',
  );
  process.exit(1);
}

main();
