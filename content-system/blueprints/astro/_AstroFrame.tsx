/**
 * Renders a pre-rendered Astro blueprint into the React Storybook (ADR-039, #2339).
 *
 * The markup is produced at build time by `scripts/render-astro-blueprints.mjs` —
 * `astro/container` imports `node:path`, so it cannot run in the browser bundle
 * Storybook ships. What arrives here is the same HTML `astro build` emits, so a
 * story is the canonical rail's own output rather than its React twin's.
 *
 * Three stylesheet layers have to be assembled by hand, because `renderToString()`
 * returns markup only:
 *
 *   1. The block's own `<style>` block — lifted per block by codegen into
 *      `__generated__/<Block>.css` and imported by that block's story file.
 *   2. `section-shell.css` — the frontmatter `import` every block shares (ADR-021).
 *   3. The BDS component CSS the blueprint markup reaches for. Blueprints emit
 *      `bds-button` / `bds-breadcrumb` / `bds-service-tag` directly; in a real
 *      site the consumer's BDS stylesheet covers them, and in Storybook only the
 *      React component module pulls them in — which an Astro story never touches.
 *
 * Layer 3 is why the gate exists: `npm run verify:astro-stories` asserts every
 * `bds-*` root class in the generated HTML resolves to a stylesheet imported here.
 * Without it a new block reaching for a fourth component renders unstyled and
 * nothing fails.
 */
import '../section-shell.css';
import '../../../components/ui/Button/Button.css';
import '../../../components/ui/Breadcrumb/Breadcrumb.css';
import '../../../components/ui/ServiceTag/ServiceTag.css';
// Media axis (#2493): `Hero.astro`'s `split` layout renders its media through
// `_Media.astro`, whose `bds-block-media` / `bds-frame` markup resolves to these
// two stylesheets. Layer 3 of the assembly (see the docstring) — without them
// the media renders unstyled in the Astro stories and `verify:astro-stories`
// (which asserts every `bds-*` root class resolves) fails.
import '../../../components/ui/Frame/Frame.css';
import '../react/BlockMedia.css';
// Content-motion axis (#2529): `LogoWall.astro`'s `marquee` treatment renders
// through `_Marquee.astro`, whose `bds-marquee*` markup resolves to this
// stylesheet. Layer 3 of the assembly (see the docstring) — without it the
// marquee renders unstyled in the Astro story and `verify:astro-stories`
// (which asserts every `bds-*` root class resolves) fails.
import '../../../components/ui/Marquee/Marquee.css';

export function AstroFrame({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
