import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Atmosphere } from '../../content-system/vocabularies/atmosphere';
import { ATMOSPHERE_MANIFEST } from '../../content-system/atmospheres';
import { AtmospherePreview, type PreviewTheme } from '../foundation/_components/AtmospherePreview';
import { atmosphereCssMap } from '../../.storybook/atmosphere-css';

interface AtmosphereStoryArgs {
  atmosphere: Atmosphere;
}

interface AtmosphereStoryRenderProps extends AtmosphereStoryArgs {
  themeNumber: PreviewTheme;
}

/**
 * Pure render — no hooks. Reads themeNumber via the Storybook story
 * `context.globals` arg (see meta.render below) instead of the
 * `useGlobals()` hook. The hook approach tripped
 * @storybook/addon-vitest's hook-order guard — a Storybook-internal
 * conditional caller that's stable in the Storybook app shell but
 * not in the vitest-browser test harness. context.globals is a
 * plain object passed by Storybook's story runner and works in both
 * environments identically.
 */
function AtmosphereStoryRender({ atmosphere, themeNumber }: AtmosphereStoryRenderProps) {
  return (
    <div style={{ padding: 'var(--bds-padding-lg)' }}>
      <AtmospherePreview
        atmosphere={atmosphere}
        entry={ATMOSPHERE_MANIFEST[atmosphere]}
        cssHref={atmosphereCssMap[atmosphere]}
        themeNumber={themeNumber}
      />
    </div>
  );
}

const meta: Meta<AtmosphereStoryArgs> = {
  title: 'Foundation/Atmospheres',
  tags: ['surface-web'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Per-atmosphere preview stories. Switch the Storybook theme via the paintbrush ' +
          'toolbar to verify the atmosphere overlay reads correctly on Brik, Brik Dark, and ' +
          'Client Sim. The composite inside the iframe uses BDS tokens so type family, ' +
          'border radius, and surface neutrals react to the theme; the atmosphere layer ' +
          'overrides whatever it explicitly targets on top.',
      },
    },
  },
  render: (args, { globals }) => (
    <AtmosphereStoryRender
      atmosphere={args.atmosphere}
      themeNumber={(globals.themeNumber ?? 'brik') as PreviewTheme}
    />
  ),
};

export default meta;
type Story = StoryObj<AtmosphereStoryArgs>;

/** @summary Editorial-luxury atmosphere — orbs, grain; light or dark */
export const EditorialLuxury: Story = {
  args: { atmosphere: 'editorial-luxury' },
};

/** @summary Cinematic-dramatic atmosphere — aurora; light or dark */
export const CinematicDramatic: Story = {
  args: { atmosphere: 'cinematic-dramatic' },
};

/** @summary Minimal-clinical atmosphere — deprecated, use none */
export const MinimalClinical: Story = {
  args: { atmosphere: 'minimal-clinical' },
};

/** @summary Warm-soft atmosphere — rounded, approachable, warm */
export const WarmSoft: Story = {
  args: { atmosphere: 'warm-soft' },
};

/** @summary Clean-bright atmosphere — deprecated, use none */
export const CleanBright: Story = {
  args: { atmosphere: 'clean-bright' },
};

/** @summary Organic-textured atmosphere — natural texture accents */
export const OrganicTextured: Story = {
  args: { atmosphere: 'organic-textured' },
};

/** @summary Baseline with no atmosphere overrides applied */
export const None: Story = {
  args: { atmosphere: 'none' },
};

/**
 * Unlike the per-atmosphere stories above (which preview inside an iframe),
 * this story renders in the Storybook document itself, where the toolbar's
 * atmosphere stylesheet applies. Each section uses a different `data-ambient`
 * placement so every effect the atmosphere defines is visible at once.
 *
 * @summary Follows the Atmosphere toolbar with data-ambient sections
 */
export const Toolbar: Story = {
  args: { atmosphere: 'none' },
  render: (_args, { globals }) => (
    <div data-testid="atmosphere-toolbar-story" data-atmosphere={String(globals.atmosphere ?? 'none')}>
      {(['spotlight', 'top-left', 'center', 'bottom'] as const).map((placement) => (
        <section
          key={placement}
          data-ambient={placement}
          style={{ padding: 'var(--bds-padding-xl)', minHeight: 200 }}
        >
          <h3 style={{ color: 'var(--bds-text-primary)' }}>data-ambient=&quot;{placement}&quot;</h3>
          <p style={{ color: 'var(--bds-text-secondary)' }}>
            Atmosphere: {String(globals.atmosphere ?? 'none')}
          </p>
        </section>
      ))}
    </div>
  ),
};
