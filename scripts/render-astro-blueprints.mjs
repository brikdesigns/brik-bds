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
 * a diff, so a `.astro` edit that skips regeneration cannot land. It runs in CI
 * on `blueprints-astro-check.yml` — for its first weeks it was wired only into
 * `npm run validate`, which no workflow invokes, so it gated nothing (#2474).
 *
 * The emitted markup is Astro-version-specific: 5 and 7 differ in inter-element
 * whitespace AND in the `data-astro-cid-*` scope hash, so an astro bump
 * invalidates all 12 committed files at once. #2462 did exactly that 22 minutes
 * after this pipeline landed, and nothing went red because the gate ran nowhere.
 *
 * The CI step above is what catches that. `astro` is also pinned exactly in
 * package.json, but that is the lesser guard and worth stating precisely: a
 * caret never auto-takes a major (`^5.18.2` does not resolve 7.x), and `npm ci`
 * honours the lockfile either way — Dependabot rewrote the range itself. The pin
 * only stops silent in-range drift when the lockfile is regenerated. Bumping
 * astro stays fine; it just has to regenerate this output in the same PR.
 *
 *   node scripts/render-astro-blueprints.mjs [--check]
 */
import { createServer } from 'vite';
import { getViteConfig } from 'astro/config';
import { experimental_AstroContainer } from 'astro/container';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
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

/**
 * Output basename for a (block, layout) pair.
 *
 * The separator is `--`, not `.`, on purpose: `canonical-class-check`'s CSS
 * selector regex reads a dotted path segment as a class, so importing
 * `CardGrid.card-grid.html` made the story file look like it referenced a bare
 * `.card-grid` shadowing canonical `bds-card-grid`. `--` also matches the BEM
 * modifier the layout actually is.
 */
const slugFor = (name, layout) => (layout ? `${name}--${layout}` : name);

/** Lifts the body of the single `<style>` block out of an `.astro` source. */
function extractStyle(astroSource, name) {
  // Matches every `<style>` tag regardless of attributes, so a file that also
  // carries a `<style is:global>` companion block (brik-bds#2312 — Astro's
  // per-block escape hatch for a rule that must not be scoped, e.g. one that
  // now targets a sub-component's descendant rather than this file's own
  // literal markup) has both blocks concatenated into the one committed CSS
  // file a story imports. Most blocks still carry exactly one plain `<style>`
  // tag, so this is a superset of the old single-block match, not a behavior
  // change for them.
  const matches = [...astroSource.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)];
  if (matches.length === 0) throw new Error(`${name}.astro has no <style> block — codegen assumption broken`);
  return matches.map((m) => m[1].trim()).join('\n\n');
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

      const slug = slugFor(name, layout);
      // `data-astro-source-*` are dev annotations carrying absolute paths — they
      // would make the emitted HTML machine-specific and churn every diff.
      const clean = html.replace(/\sdata-astro-source-(file|loc)="[^"]*"/g, '').trim();
      writeFile(join(outDir, `${slug}.html`), `${clean}\n`);
      emitted.push(`${slug}.html`);
    }
  }

  // SiteHeader — the site-shell nav component. Not a blueprint (it takes direct
  // shell props, not BlueprintProps), but shipped in this package and browsable
  // as the real Astro output per #2431. ADR-039's pre-render mechanism governs
  // it too: #2339 decided the path once, and the shell component reuses it
  // rather than re-mocking — this is what retires `NavigationIASpec`. One entry
  // per `NAV_ARCHETYPE_VALUES`, so the whole vocabulary is browsable.
  {
    const { SITE_HEADER_FIXTURES } = await server.ssrLoadModule(
      join(astroDir, '__fixtures__/site-header.ts'),
    );
    const mod = await server.ssrLoadModule(join(astroDir, 'SiteHeader.astro'));
    const source = readFileSync(join(astroDir, 'SiteHeader.astro'), 'utf8');

    writeFile(join(outDir, 'SiteHeader.css'), `${extractStyle(source, 'SiteHeader')}\n`);
    emitted.push('SiteHeader.css');

    for (const props of SITE_HEADER_FIXTURES) {
      const container = await experimental_AstroContainer.create();
      const html = await container.renderToString(mod.default, { props });
      const clean = html
        .replace(/\sdata-astro-source-(file|loc)="[^"]*"/g, '')
        // SiteHeader ships a client `<script>` (scroll + drawer runtime); the
        // container emits it as a `<script src="…SiteHeader.astro?astro&type=
        // script…">` reference carrying the absolute on-disk path. That path is
        // machine-specific (churns `--check` across boxes) and dead in a static
        // story anyway — the preview is the top/rest state, not the runtime.
        .replace(/<script type="module" src="[^"]*\?astro&type=script[^"]*"><\/script>/g, '')
        .trim();
      writeFile(join(outDir, `SiteHeader--${props.archetype}.html`), `${clean}\n`);
      emitted.push(`SiteHeader--${props.archetype}.html`);
    }
  }

  // HeroMediaCard / HeroMediaCardImage / HeroMediaCardPrice — presentational
  // hero media-card partials `Hero.astro`'s `with-pricing-card` layout
  // composes for its right-hand column (brik-bds#2312). Not a dispatched
  // blueprint (no `blueprintKey`, no `BlueprintDispatcher` entry), so they
  // render off a dedicated fixture rather than `sections.ts`, following the
  // `SiteHeader` precedent above. Their classes (`bds-hero__*`) are already
  // covered by `Hero.css` (ADR-040 mirror) — no new stylesheet is emitted;
  // the stories import the same `__generated__/Hero.css` the `Hero` stories do.
  {
    const {
      HERO_MEDIA_CARD_IMAGE_FIXTURE,
      HERO_MEDIA_CARD_PRICE_FIXTURE,
      HERO_MEDIA_CARD_CTA_HTML,
      HERO_MEDIA_CARD_MISSING_FIXTURE,
    } = await server.ssrLoadModule(join(astroDir, '__fixtures__/hero-media-card.ts'));

    const imageMod = await server.ssrLoadModule(join(astroDir, 'HeroMediaCardImage.astro'));
    const priceMod = await server.ssrLoadModule(join(astroDir, 'HeroMediaCardPrice.astro'));
    const cardMod = await server.ssrLoadModule(join(astroDir, 'HeroMediaCard.astro'));

    const renderOne = async (mod, opts) => {
      const container = await experimental_AstroContainer.create();
      const html = await container.renderToString(mod.default, opts);
      return html.replace(/\sdata-astro-source-(file|loc)="[^"]*"/g, '').trim();
    };

    const imageHtml = await renderOne(imageMod, { props: HERO_MEDIA_CARD_IMAGE_FIXTURE });
    writeFile(join(outDir, 'HeroMediaCardImage.html'), `${imageHtml}\n`);
    emitted.push('HeroMediaCardImage.html');

    const priceHtml = await renderOne(priceMod, {
      props: HERO_MEDIA_CARD_PRICE_FIXTURE,
      slots: { default: HERO_MEDIA_CARD_CTA_HTML },
    });
    writeFile(join(outDir, 'HeroMediaCardPrice.html'), `${priceHtml}\n`);
    emitted.push('HeroMediaCardPrice.html');

    // The populated card composes the two partials above as its slotted
    // content — the same shape `Hero.astro` composes them in.
    const cardHtml = await renderOne(cardMod, {
      props: {},
      slots: { default: `${imageHtml}${priceHtml}` },
    });
    writeFile(join(outDir, 'HeroMediaCard.html'), `${cardHtml}\n`);
    emitted.push('HeroMediaCard.html');

    const cardMissingHtml = await renderOne(cardMod, { props: HERO_MEDIA_CARD_MISSING_FIXTURE });
    writeFile(join(outDir, 'HeroMediaCard--missing.html'), `${cardMissingHtml}\n`);
    emitted.push('HeroMediaCard--missing.html');
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
  const blockHtml = BLOCKS.flatMap(({ name, layouts }) =>
    layouts.map((l) => readFileSync(join(outDir, `${slugFor(name, l)}.html`), 'utf8')),
  );
  // SiteHeader's generated markup is checked too, so a future edit that reaches
  // for a BDS component class (`bds-button`, …) is caught even though today it
  // emits only its own `bp-site-header__*` classes.
  const shellHtml = readdirSync(outDir)
    .filter((f) => f.startsWith('SiteHeader--') && f.endsWith('.html'))
    .map((f) => readFileSync(join(outDir, f), 'utf8'));
  // HeroMediaCard / -Image / -Price (brik-bds#2312) — not a BLOCKS entry (no
  // `blueprintKey`), so scanned explicitly here alongside SiteHeader.
  const heroMediaCardHtml = ['HeroMediaCardImage.html', 'HeroMediaCardPrice.html', 'HeroMediaCard.html', 'HeroMediaCard--missing.html']
    .map((f) => readFileSync(join(outDir, f), 'utf8'));
  const html = [...blockHtml, ...shellHtml, ...heroMediaCardHtml].join('\n');

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
