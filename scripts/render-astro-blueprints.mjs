/**
 * Pre-renders the eight Astro blueprint blocks to static HTML + CSS so the
 * React Storybook can display the canonical rail (ADR-039, #2339).
 *
 * Why a codegen step rather than a Storybook story that renders on demand:
 * `astro/container` imports `node:path` (`node_modules/astro/dist/container/
 * index.js`), so it cannot run inside the browser bundle Storybook ships. The
 * container runs here, in Node, and the stories import what it emits.
 *
 * Why the CSS is extracted separately: `renderToString()` returns only the
 * component's markup — the `<style>` block every block carries is dropped, so
 * the emitted HTML alone renders unstyled. The style body is lifted from the
 * `.astro` source and written beside the HTML. Astro scopes those rules with a
 * `data-astro-cid-*` attribute at build time; unscoped is correct here because
 * a story renders one block in isolation.
 *
 * Output is committed. `npm run verify:astro-stories` re-runs this and fails on
 * a diff, so a `.astro` edit that skips regeneration cannot land.
 *
 *   node scripts/render-astro-blueprints.mjs [--check]
 */
import { createServer } from 'vite';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer } from 'astro/container';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const astroDir = join(root, 'content-system/blueprints/astro');
const outDir = join(astroDir, '__generated__');

const CHECK = process.argv.includes('--check');

/** The eight blocks of #2339 AC3, with the layout axis each one takes. */
const BLOCKS = [
  { name: 'Hero', layouts: ['split', 'interior-minimal', 'with-pricing-card'] },
  { name: 'Cta', layouts: ['default', 'split'] },
  { name: 'CardGrid', layouts: ['card-grid', 'two-column-list'] },
  { name: 'About', layouts: [null] },
  { name: 'Features', layouts: [null] },
  { name: 'CalloutPanel', layouts: [null] },
  { name: 'StatsDarkBar', layouts: [null] },
  { name: 'TestimonialsFeaturedLarge', layouts: [null] },
];

/** Lifts the body of the single `<style>` block out of an `.astro` source. */
function extractStyle(astroSource, name) {
  const match = astroSource.match(/<style>([\s\S]*?)<\/style>/);
  if (!match) throw new Error(`${name}.astro has no <style> block — codegen assumption broken`);
  return match[1].trim();
}

async function main() {
  const viteConfig = await getViteConfig({})({ command: 'serve', mode: 'development' });
  const server = await createServer({ ...viteConfig, root, server: { middlewareMode: true } });

  const { baseTheme, baseClientFacts, placeholderImage } = await server.ssrLoadModule(
    join(root, 'content-system/blueprints/react/_fixtures.ts'),
  );
  const { sectionFor } = await server.ssrLoadModule(join(astroDir, '__fixtures__/sections.ts'));

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const emitted = [];

  for (const { name, layouts } of BLOCKS) {
    const mod = await server.ssrLoadModule(join(astroDir, `${name}.astro`));
    const source = readFileSync(join(astroDir, `${name}.astro`), 'utf8');

    // One stylesheet per block — shared by every layout of that block, which is
    // what lets the three former per-layout files coexist (#2302).
    writeFile(join(outDir, `${name}.css`), `${extractStyle(source, name)}\n`);
    emitted.push(`${name}.css`);

    for (const layout of layouts) {
      const container = await experimental_AstroContainer.create();
      const html = await container.renderToString(mod.default, {
        props: {
          theme: baseTheme,
          clientFacts: { ...baseClientFacts, heroImageUrl: placeholderImage(960, 1200, '#eaf1fb', '#1f3d70', name) },
          section: sectionFor(name, layout),
          ...(layout ? { layout } : {}),
        },
      });

      const slug = layout ? `${name}.${layout}` : name;
      // `data-astro-source-*` are dev annotations carrying absolute paths — they
      // would make the emitted HTML machine-specific and churn every diff.
      const clean = html.replace(/\sdata-astro-source-(file|loc)="[^"]*"/g, '').trim();
      writeFile(join(outDir, `${slug}.html`), `${clean}\n`);
      emitted.push(`${slug}.html`);
    }
  }

  await server.close();
  assertStylesheetCoverage();
  return emitted;
}

/**
 * Every `bds-*` root class the rail emits must resolve to a stylesheet the story
 * shell imports. Blueprints reach for BDS components directly (`bds-button`,
 * `bds-breadcrumb`, `bds-service-tag`) — in a real site the consumer's BDS
 * stylesheet covers them, but in Storybook only the React component module pulls
 * that CSS in, and an Astro story never imports one.
 *
 * Without this check a block that reaches for a fourth component renders
 * unstyled and no gate notices. That is not hypothetical: the first cut of this
 * codegen shipped `Hero` with its CTA as a bare underlined link, because
 * `Button.css` had nowhere to come from.
 */
function assertStylesheetCoverage() {
  const shell = readFileSync(join(astroDir, '_AstroFrame.tsx'), 'utf8');
  const html = BLOCKS.flatMap(({ name, layouts }) =>
    layouts.map((l) => readFileSync(join(outDir, `${l ? `${name}.${l}` : name}.html`), 'utf8')),
  ).join('\n');

  // Root class only — `bds-hero__title` and `bds-button--primary` are covered by
  // whatever stylesheet owns `bds-hero` / `bds-button`.
  const roots = new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/))
    .filter((c) => c.startsWith('bds-'))
    .map((c) => c.split(/--|__/)[0]));

  // A block's own `<style>` is emitted beside it and imported by its story file.
  const ownedByBlock = new Set(BLOCKS.map(({ name }) =>
    `bds-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`));

  // Components whose CSS the shell imports, as bare lowercase names: Button, …
  const shellComponents = new Set(
    [...shell.matchAll(/components\/ui\/(\w+)\/\w+\.css/g)].map((m) => m[1].toLowerCase()),
  );
  const shellHasSectionShell = shell.includes('section-shell.css');

  const uncovered = [...roots].filter((cls) => {
    if (ownedByBlock.has(cls)) return false;
    const stem = cls.replace(/^bds-/, '').replace(/-/g, '');
    // section-shell.css owns the shared section chrome + the utilities (ADR-021).
    if (shellHasSectionShell && /^(blueprintsection|visuallyhidden)$/.test(stem)) return false;
    return !shellComponents.has(stem);
  });

  if (uncovered.length > 0) {
    console.error('✗ Generated markup uses classes no imported stylesheet covers:');
    for (const c of uncovered) console.error(`    ${c}`);
    console.error('\n  Add the owning stylesheet to content-system/blueprints/astro/_AstroFrame.tsx');
    process.exit(1);
  }
}

const drift = [];

function writeFile(path, contents) {
  if (CHECK) {
    const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (current !== contents) drift.push(path.replace(`${root}/`, ''));
    return;
  }
  writeFileSync(path, contents);
}

const emitted = await main();

if (CHECK && drift.length > 0) {
  console.error('✗ Generated Astro blueprint output is stale:');
  for (const f of drift) console.error(`    ${f}`);
  console.error('\n  Run: npm run render:astro-stories');
  process.exit(1);
}

console.log(
  CHECK
    ? `✓ Generated Astro blueprint output is current (${emitted.length} files)`
    : `✓ Rendered ${emitted.length} files to content-system/blueprints/astro/__generated__/`,
);
