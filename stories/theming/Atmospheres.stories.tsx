import type { Meta, StoryObj } from '@storybook/react-vite';
import { useGlobals } from 'storybook/preview-api';
import type { Atmosphere } from '../../content-system/vocabularies/atmosphere';
import { ATMOSPHERE_MANIFEST } from '../../content-system/atmospheres';
import { AtmospherePreview, type PreviewTheme } from '../foundation/_components/AtmospherePreview';

// Atmosphere CSS is loaded by the iframe via ?url imports — one import per
// slug, mapped by slug so the story can resolve the right asset URL.
import editorialLuxuryUrl    from '../../content-system/atmospheres/editorial-luxury.css?url';
import cinematicDramaticUrl  from '../../content-system/atmospheres/cinematic-dramatic.css?url';
import minimalClinicalUrl    from '../../content-system/atmospheres/minimal-clinical.css?url';
import warmSoftUrl           from '../../content-system/atmospheres/warm-soft.css?url';
import cleanBrightUrl        from '../../content-system/atmospheres/clean-bright.css?url';
import organicTexturedUrl    from '../../content-system/atmospheres/organic-textured.css?url';
import noneUrl               from '../../content-system/atmospheres/none.css?url';

const atmosphereCssMap: Record<Atmosphere, string> = {
  'editorial-luxury': editorialLuxuryUrl,
  'cinematic-dramatic': cinematicDramaticUrl,
  'minimal-clinical': minimalClinicalUrl,
  'warm-soft': warmSoftUrl,
  'clean-bright': cleanBrightUrl,
  'organic-textured': organicTexturedUrl,
  'none': noneUrl,
};

interface AtmosphereStoryArgs {
  atmosphere: Atmosphere;
}

function AtmosphereStoryRender({ atmosphere }: AtmosphereStoryArgs) {
  const [globals] = useGlobals();
  const themeNumber = (globals.themeNumber || 'brik') as PreviewTheme;
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
  title: 'Theming/Atmospheres',
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
  render: (args) => <AtmosphereStoryRender atmosphere={args.atmosphere} />,
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
