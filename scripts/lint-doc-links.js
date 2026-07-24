#!/usr/bin/env node

/**
 * BDS Doc Link Checker
 *
 * Fails when a documentation MDX file references a target that does not
 * resolve. This is the gate for the class of rot that shipped 8 dead
 * cross-links on the Image page (PR #1223): `image.mdx` linked to
 * `/docs/components/frame` (×6) and `/docs/components/marketing-illustration`
 * (×2) — docs-site pages that never existed, only Storybook stories did — and
 * nothing caught it.
 *
 * Three link classes are validated:
 *
 *   1. Internal doc cross-links (`/docs/...`) → a matching page must exist in
 *      the docs-site content tree (`docs-site/content/docs/<path>.mdx` or
 *      `<path>/index.mdx`). When the link carries a `#fragment`, the fragment
 *      is also validated against the target page's heading anchors — the same
 *      github-slugger slugs Fumadocs generates at build time (see the anchor
 *      section below). In-page `#fragment` links inside a docs-site page are
 *      validated against that page's own headings too. This is the gate for
 *      the second rot class: a page exists but the `#anchor` does not, so the
 *      link silently lands at the top of the page. `lint-doc-links` used to
 *      strip the fragment and never check it.
 *
 *   2. Storybook links (`storybook.brikdesigns.com/?path=/story/<id>` and
 *      `/?path=/docs/<id>`) → `<id>` must exist in the Storybook index
 *      (`storybook-static/index.json`). The index is Storybook's own build
 *      output, so it is the authoritative ID set — no reimplementation of
 *      Storybook's `toId` derivation, which would drift and false-positive.
 *      NOTE: with `docs.defaultName: 'Overview'` (.storybook/main.ts) every
 *      autodocs page is `<id>--overview`, NOT `<id>--docs`.
 *
 * Sources scanned: `docs-site/content/docs/**\/*.mdx` + `components/ui/**\/*.mdx`.
 *
 * Because the Storybook ID set comes from `storybook-static/index.json`, that
 * build artifact must exist. The pre-push suite (scripts/validate-all.js) runs
 * the Storybook build immediately before this check; the CI workflow
 * (.github/workflows/doc-links-check.yml) does the same. If the index is
 * absent the check exits non-zero with an actionable message rather than
 * silently skipping Storybook validation.
 *
 * Usage:
 *   node scripts/lint-doc-links.js                 # scan the full corpus
 *   node scripts/lint-doc-links.js --files a b     # scan specific mdx files
 *   node scripts/lint-doc-links.js --index path    # override index.json path
 *
 * Exit codes:
 *   0 = no dead links
 *   1 = dead links found, or the Storybook index is missing
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

const REPO_ROOT = path.resolve(__dirname, '..');

// ── CLI args ────────────────────────────────────────────────────────────────
// `--docs-root` and `--index` are overridable so the fixture test (which has no
// Storybook build) can run the checker hermetically against a tiny fixture tree.
const args = process.argv.slice(2);
function argValue(flag) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}
const fileFlagIdx = args.indexOf('--files');
let explicitFiles = null;
if (fileFlagIdx !== -1) {
  explicitFiles = [];
  for (let i = fileFlagIdx + 1; i < args.length && !args[i].startsWith('--'); i++) {
    explicitFiles.push(args[i]);
  }
}
const DOCS_ROOT = path.resolve(
  REPO_ROOT,
  argValue('--docs-root') || path.join('docs-site', 'content', 'docs')
);
const COMPONENTS_ROOT = path.join(REPO_ROOT, 'components', 'ui');
const INDEX_PATH = path.resolve(
  REPO_ROOT,
  argValue('--index') || path.join('storybook-static', 'index.json')
);

// ── Collect the MDX corpus ───────────────────────────────────────────────────
function walkMdx(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMdx(full));
    else if (entry.isFile() && entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

const mdxFiles = explicitFiles
  ? explicitFiles.map((f) => path.resolve(REPO_ROOT, f))
  : [...walkMdx(DOCS_ROOT), ...walkMdx(COMPONENTS_ROOT)];

// ── Load the Storybook index (authoritative story/docs ID set) ────────────────
let storyIds = null;
if (fs.existsSync(INDEX_PATH)) {
  try {
    const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    storyIds = new Set(Object.keys(index.entries || {}));
  } catch (err) {
    console.error(
      `${RED}✗ Failed to parse Storybook index at ${path.relative(REPO_ROOT, INDEX_PATH)}: ${err.message}${NC}`
    );
    process.exit(1);
  }
}

// ── Resolvers ─────────────────────────────────────────────────────────────────
const docFileCache = new Map();
function docFileFor(docPath) {
  // docPath is the path after `/docs/`, e.g. "components/card" or "" (root).
  // Returns the resolving .mdx path, or null if no page exists.
  if (docFileCache.has(docPath)) return docFileCache.get(docPath);
  const base = docPath ? path.join(DOCS_ROOT, docPath) : DOCS_ROOT;
  const flat = `${base}.mdx`;
  const index = path.join(base, 'index.mdx');
  const resolved = fs.existsSync(flat) ? flat : fs.existsSync(index) ? index : null;
  docFileCache.set(docPath, resolved);
  return resolved;
}
function docPageExists(docPath) {
  return docFileFor(docPath) !== null;
}

function storyIdFromPath(pathParam) {
  // pathParam looks like "/story/layouts-frame--playground" or
  // "/docs/components-image--overview". Return the trailing ID.
  const m = pathParam.match(/\/(?:story|docs)\/([^/?&#]+)/);
  return m ? m[1] : null;
}

// ── Anchor slugs ──────────────────────────────────────────────────────────────
// Reproduce the heading ids Fumadocs emits so `#fragment` links can be checked.
// Fumadocs' remark-heading does `slugger.slug(flattenNode(heading))` with a
// per-file github-slugger (fumadocs-core/dist/mdx-plugins/remark-heading.js).
// We pin the same `github-slugger` package (see package.json) so the slug
// algorithm is identical rather than reimplemented — the load-bearing detail is
// that github-slugger does NOT collapse whitespace, so `Modes — orthogonal`
// slugs to `modes--orthogonal` (the em-dash is dropped, both surrounding spaces
// each become a hyphen) and a trailing `<TierBadge />` leaves a trailing hyphen.
// This module is CommonJS; github-slugger v2 is ESM-only, so the class is loaded
// via dynamic import in the async resolve phase and stored here.
let SluggerClass = null;

function stripFrontmatter(src) {
  return src.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}
// ATX headings only (`## Title`), with the optional CommonMark closing sequence
// (`## Title ##`) stripped. The docs-site corpus uses ATX exclusively — no
// setext (`Title\n===`) headings exist — so this covers every heading that
// actually ships; the slug output is verified byte-for-byte against the real
// Fumadocs pipeline across the full corpus by the ground-truth check.
const HEADING = /^#{1,6}[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
const FENCE = /^\s*(`{3,}|~{3,})/;
const CUSTOM_ID = /\s*\[#([^\]]+?)]\s*$/; // `## Heading [#custom-id]`

// Reduce a raw ATX heading to the text Fumadocs' flattenNode yields: markdown
// links collapse to their text, images and JSX tags contribute nothing (their
// tags are removed, surrounding whitespace preserved). Everything else — inline
// code backticks, emphasis markers, punctuation — is left for github-slugger,
// which strips it identically. Matches flattenNode for every heading shape in
// the corpus (plain text, inline code, trailing self-closing JSX like
// `<TierBadge />`); a `>` inside a JSX attribute string is not handled, but no
// heading carries such props.
function headingToText(raw) {
  return raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/<\/?[A-Za-z][^>]*>/g, ''); // JSX / HTML tags
}

const slugCache = new Map(); // absolute mdx path -> Set<slug>
function anchorsFor(file) {
  if (slugCache.has(file)) return slugCache.get(file);
  const slugger = new SluggerClass();
  const slugs = new Set();
  const lines = stripFrontmatter(fs.readFileSync(file, 'utf8')).split('\n');
  let inFence = false;
  let fence = null;
  for (const line of lines) {
    const fm = line.match(FENCE);
    if (fm) {
      const marker = fm[1][0];
      if (!inFence) { inFence = true; fence = marker; }
      else if (fence === marker) { inFence = false; fence = null; }
      continue;
    }
    if (inFence) continue;
    const h = line.match(HEADING);
    if (!h) continue;
    const cid = CUSTOM_ID.exec(h[1]);
    slugs.add(cid ? cid[1] : slugger.slug(headingToText(h[1])));
  }
  slugCache.set(file, slugs);
  return slugs;
}

// ── Scan ─────────────────────────────────────────────────────────────────────
// Matches markdown links `](target)`; classification happens per target.
const MD_LINK = /\]\(\s*([^)\s]+)\s*\)/g;
// `<ComponentLinks slug="X" />` (Storybook MDX block) renders a "View docs"
// link to design.brikdesigns.com/docs/components/<slug>. The block assumes that
// page exists (.storybook/blocks/ComponentLinks.tsx) — the same dead-link class
// as a hand-written cross-link, so validate the slug too.
const COMPONENT_LINKS = /<ComponentLinks\b[^>]*\bslug="([^"]+)"/g;

// Acknowledged debt: components with a Storybook page but no docs-site page yet,
// so their `<ComponentLinks>` "View docs" link 404s. The gate hard-fails on any
// NEW docless ComponentLinks, but tolerates these known ones so it can land
// green now (authoring 18 docs pages is a separate content effort, tracked in
// issue #1229). Self-cleaning: if a listed slug gains a docs page, the
// gate fails until it is removed from this set — so the debt can only shrink.
const COMPONENT_LINKS_WITHOUT_DOCS_PAGE = new Set([
  'addable-tag-list',
  'animated-icon',
  'block-quote',
  'checklist',
  'collapsible',
  'completion-toggle',
  'data-view',
  'dependent-select',
  'file-card',
  'interactive-list-item',
  'logo',
  'nav-item',
  'number-input',
  'page',
  'progress-circle',
  'search-input',
  'selectable-media-tile',
  'service-tag',
  'sub-navigation',
  'testimonial',
]);
const acknowledgedSeen = new Set();

const dead = []; // { file, line, kind, target, reason }
// Anchor checks are deferred: resolving them needs github-slugger (ESM-only),
// loaded via dynamic import after the synchronous scan. Each entry:
// { file, line, target, targetFile, fragment }.
const anchorChecks = [];
let checkedDoc = 0;
let checkedStory = 0;
let checkedSlug = 0;
let checkedAnchor = 0;
let missingIndex = false;

for (const file of mdxFiles) {
  if (!fs.existsSync(file)) {
    console.error(`${YELLOW}⚠ skipped (not found): ${file}${NC}`);
    continue;
  }
  const rel = path.relative(REPO_ROOT, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, i) => {
    let m;
    MD_LINK.lastIndex = 0;
    while ((m = MD_LINK.exec(line)) !== null) {
      const target = m[1];

      // (1) Internal doc cross-links
      if (target.startsWith('/docs/') || target === '/docs') {
        const [withoutHash, fragment] = target.split('#');
        const docPath = withoutHash.replace(/^\/docs\/?/, '').replace(/\/$/, '');
        checkedDoc++;
        const targetFile = docFileFor(docPath);
        if (!targetFile) {
          dead.push({
            file: rel,
            line: i + 1,
            kind: 'doc',
            target,
            reason: `no docs-site page (looked for docs/${docPath}.mdx and docs/${docPath}/index.mdx)`,
          });
        } else if (fragment) {
          // Page resolves — defer the `#anchor` check to the slug phase.
          anchorChecks.push({
            file: rel,
            line: i + 1,
            target,
            targetFile,
            fragment: fragment.split('?')[0],
          });
        }
        continue;
      }

      // (1b) In-page anchors (`[x](#anchor)`) inside a docs-site page — the
      // same rot class, validated against the current page's own headings.
      // Restricted to docs-site pages; Storybook MDX under components/ui uses a
      // different anchor scheme and is not a Fumadocs page.
      if (target.startsWith('#') && file.startsWith(DOCS_ROOT + path.sep)) {
        const fragment = target.slice(1).split('?')[0];
        if (fragment) {
          anchorChecks.push({ file: rel, line: i + 1, target, targetFile: file, fragment });
        }
        continue;
      }

      // (2) Storybook links
      if (target.includes('storybook.brikdesigns.com') && target.includes('path=/')) {
        const pathParam = target.slice(target.indexOf('path=/') + 'path='.length);
        const id = storyIdFromPath(pathParam);
        if (!id) continue; // e.g. bare storybook.brikdesigns.com home link
        checkedStory++;
        if (storyIds === null) {
          missingIndex = true;
          continue;
        }
        if (!storyIds.has(id)) {
          dead.push({
            file: rel,
            line: i + 1,
            kind: 'story',
            target,
            reason: `story ID "${id}" not in Storybook index`,
          });
        }
      }
    }

    // (3) <ComponentLinks slug="..." /> — its "View docs" target
    let cl;
    COMPONENT_LINKS.lastIndex = 0;
    while ((cl = COMPONENT_LINKS.exec(line)) !== null) {
      const slug = cl[1];
      checkedSlug++;
      const pageExists = docPageExists(path.posix.join('components', slug));
      if (COMPONENT_LINKS_WITHOUT_DOCS_PAGE.has(slug)) {
        acknowledgedSeen.add(slug);
        if (pageExists) {
          // The debt was paid — the allowlist entry is now stale. Fail so it
          // gets removed, keeping the list honest.
          dead.push({
            file: rel,
            line: i + 1,
            kind: 'slug',
            target: `<ComponentLinks slug="${slug}">`,
            reason: `docs-site page for /docs/components/${slug} now exists — remove "${slug}" from COMPONENT_LINKS_WITHOUT_DOCS_PAGE in scripts/lint-doc-links.js`,
          });
        }
        continue;
      }
      if (!pageExists) {
        dead.push({
          file: rel,
          line: i + 1,
          kind: 'slug',
          target: `<ComponentLinks slug="${slug}">`,
          reason: `no docs-site page for /docs/components/${slug} (looked for components/${slug}.mdx and components/${slug}/index.mdx)`,
        });
      }
    }
  });
}

// Prune-guard: on a full-corpus run, any acknowledged slug that no longer
// appears anywhere is stale (component or its ComponentLinks was removed) and
// must leave the allowlist. Skip when a --files subset was scanned.
if (!explicitFiles) {
  for (const slug of COMPONENT_LINKS_WITHOUT_DOCS_PAGE) {
    if (!acknowledgedSeen.has(slug)) {
      dead.push({
        file: 'scripts/lint-doc-links.js',
        line: 0,
        kind: 'slug',
        target: `COMPONENT_LINKS_WITHOUT_DOCS_PAGE: "${slug}"`,
        reason: `no <ComponentLinks slug="${slug}"> remains in the corpus — remove this stale allowlist entry`,
      });
    }
  }
}

// ── Resolve anchors + report ─────────────────────────────────────────────────
// Wrapped in an async IIFE: github-slugger v2 is ESM-only, so it is pulled via
// dynamic import here rather than `require`d at the top of this CommonJS file.
(async () => {
  if (anchorChecks.length) {
    try {
      SluggerClass = (await import('github-slugger')).default;
    } catch (err) {
      console.error(
        `\n${RED}✗ Failed to load github-slugger (needed for #anchor validation): ${err.message}${NC}`
      );
      console.error(`  Run ${DIM}npm ci${NC} — it is a devDependency of this package.\n`);
      process.exit(1);
    }
    for (const c of anchorChecks) {
      checkedAnchor++;
      const slugs = anchorsFor(c.targetFile);
      if (!slugs.has(c.fragment)) {
        const where =
          path.resolve(c.targetFile) === path.resolve(REPO_ROOT, c.file)
            ? 'this page'
            : path.relative(REPO_ROOT, c.targetFile);
        dead.push({
          file: c.file,
          line: c.line,
          kind: 'anchor',
          target: c.target,
          reason: `no heading anchor "#${c.fragment}" in ${where}`,
        });
      }
    }
  }

  if (missingIndex) {
    console.error(
      `\n${RED}✗ Storybook index not found at ${path.relative(REPO_ROOT, INDEX_PATH)}${NC}`
    );
    console.error(
      `  Storybook links cannot be validated without it. Run ${DIM}npm run build-storybook${NC} first`
    );
    console.error(
      `  (the pre-push suite and CI do this automatically before this check).\n`
    );
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  BDS Doc Link Checker');
  console.log('═══════════════════════════════════════════');
  console.log(
    `  ${DIM}${mdxFiles.length} MDX files · ${checkedDoc} doc links · ${checkedAnchor} anchors · ${checkedStory} storybook links · ${checkedSlug} ComponentLinks${NC}\n`
  );

  if (dead.length === 0) {
    console.log(`  ${GREEN}✓ All doc + anchor + storybook links resolve${NC}\n`);
    process.exit(0);
  }

  const byFile = new Map();
  for (const d of dead) {
    if (!byFile.has(d.file)) byFile.set(d.file, []);
    byFile.get(d.file).push(d);
  }

  for (const [file, items] of byFile) {
    console.log(`  ${RED}${file}${NC}`);
    for (const d of items) {
      console.log(`    ${DIM}L${d.line}${NC} ${d.target}`);
      console.log(`        ${YELLOW}${d.reason}${NC}`);
    }
    console.log('');
  }

  console.log(
    `  ${RED}✗ ${dead.length} dead link${dead.length === 1 ? '' : 's'} across ${byFile.size} file${byFile.size === 1 ? '' : 's'}${NC}\n`
  );
  process.exit(1);
})();
