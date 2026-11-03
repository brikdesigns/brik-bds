/**
 * One indicator anatomy across Badge, Tag and Avatar — the CSS half (brik-bds#2943).
 *
 * Every `appearance × color` / `appearance × tone` combination has a rule, each
 * fill is a `--bds-background-*-light` / accent token, and Badge, Tag and Avatar
 * CSS read no `--bds-surface-*` token and no `--bds-color-*` primitive. The
 * markup half lives in components/ui/Tag/Tag.appearance.test.ts; this half sits
 * under scripts/ because the `components` project stubs CSS (`?raw` reads '')
 * and carries no node types.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const UI = join(dirname(fileURLToPath(import.meta.url)), '..', 'components', 'ui');
const css = (name) => readFileSync(join(UI, name, `${name}.css`), 'utf8');

const HUES = ['blue', 'green', 'orange', 'purple', 'yellow', 'red'];
const TONES = ['positive', 'warning', 'negative', 'info', 'brand', 'neutral'];

describe('Tag CSS — appearance × color', () => {
  const tagCss = css('Tag');

  it.each(['neutral', ...HUES])('has solid, subtle and outline rules for color=%s', (color) => {
    for (const appearance of ['solid', 'subtle', 'outline']) {
      expect(tagCss, `${appearance} × ${color}`).toContain(`.bds-tag--${appearance}.bds-tag--color-${color}`);
    }
  });

  it('retires `muted`', () => {
    expect(tagCss).not.toContain('bds-tag--muted');
  });

  it.each(HUES)('outline %s takes its edge from --bds-border-accent-%s', (hue) => {
    expect(tagCss).toContain(`--bds-border-accent-${hue}`);
  });

  it.each(HUES)('subtle %s fills with --bds-background-accent-%s-light', (hue) => {
    expect(tagCss).toContain(`--bds-background-accent-${hue}-light`);
  });
});

describe('Badge CSS — subtle and outline', () => {
  const badgeCss = css('Badge');

  it.each(TONES)('has an outline rule for tone=%s', (tone) => {
    expect(badgeCss).toContain(`.bds-badge--outline.bds-badge--tone-${tone}`);
  });

  it.each(['positive', 'warning', 'negative', 'info', 'neutral'])(
    'subtle %s fills with --bds-background-%s-light',
    (tone) => {
      expect(badgeCss).toContain(`--bds-background-${tone}-light`);
    },
  );

  it('has no dark-mode override left on brand subtle', () => {
    expect(badgeCss).not.toContain('data-theme="dark"');
  });
});

describe('Avatar CSS — subtle', () => {
  it.each(HUES)('subtle %s fills with --bds-background-accent-%s-light', (hue) => {
    expect(css('Avatar')).toContain(`.bds-avatar--subtle.bds-avatar--accent-${hue}`);
    expect(css('Avatar')).toContain(`--bds-background-accent-${hue}-light`);
  });
});

describe('indicator CSS reads no surface token and no color primitive', () => {
  it.each(['Badge', 'Tag', 'Avatar'])('%s.css', (name) => {
    expect(css(name)).not.toMatch(/var\(--bds-(surface|color)-/);
  });
});
