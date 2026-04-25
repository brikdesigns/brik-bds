import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Atmosphere } from '../../content-system/vocabularies/atmosphere';
import { ATMOSPHERE_MANIFEST } from '../../content-system/atmospheres';
import { AtmospherePreview, type PreviewTheme } from '../foundation/_components/AtmospherePreview';

// Atmosphere CSS is resolved per slug so the iframe preview can load
// the correct asset at runtime. Using `new URL(path, import.meta.url)`
// — Vite handles this as an asset reference and emits the same hashed
// URL at build time that a `?url` import would produce. Chose this
// shape over `?url` imports because the anti-slop scanner's import
// resolver doesn't strip query-string suffixes and flags the `?url`
// paths as unresolvable (pre-existing false positive from PR #188).
const atmosphereCssMap: Record<Atmosphere, string> = {
  'editorial-luxury': new URL('../../content-system/atmospheres/editorial-luxury.css', import.meta.url).href,
  'cinematic-dramatic': new URL('../../content-system/atmospheres/cinematic-dramatic.css', import.meta.url).href,
  'minimal-clinical': new URL('../../content-system/atmospheres/minimal-clinical.css', import.meta.url).href,
  'warm-soft': new URL('../../content-system/atmospheres/warm-soft.css', import.meta.url).href,
  'clean-bright': new URL('../../content-system/atmospheres/clean-bright.css', import.meta.url).href,
  'organic-textured': new URL('../../content-system/atmospheres/organic-textured.css', import.meta.url).href,
  'none': new URL('../../content-system/atmospheres/none.css', import.meta.url).href,
};

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
    <div style={{ padding: 'var(--padding-lg)' }}>
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
  title: 'Theming/Layers/Atmospheres',
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

export const EditorialLuxury: Story = {
  args: { atmosphere: 'editorial-luxury' },
};

export const CinematicDramatic: Story = {
  args: { atmosphere: 'cinematic-dramatic' },
};

export const MinimalClinical: Story = {
  args: { atmosphere: 'minimal-clinical' },
};

export const WarmSoft: Story = {
  args: { atmosphere: 'warm-soft' },
};

export const CleanBright: Story = {
  args: { atmosphere: 'clean-bright' },
};

export const OrganicTextured: Story = {
  args: { atmosphere: 'organic-textured' },
};

export const None: Story = {
  args: { atmosphere: 'none' },
};
