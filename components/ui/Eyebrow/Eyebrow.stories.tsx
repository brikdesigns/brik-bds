import type { Meta, StoryObj } from '@storybook/react-vite';
import { Eyebrow } from './Eyebrow';
import { ContentBlock } from '../ContentBlock';

/**
 * Eyebrow — the short uppercase kicker above a heading. Renders `p`/`span`,
 * never a heading.
 * @summary Uppercase kicker above a heading
 */
const meta: Meta<typeof Eyebrow> = {
  title: 'Content/eyebrow',
  component: Eyebrow,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    as: { control: 'select', options: ['p', 'span'] },
    tone: { control: 'select', options: ['muted', 'primary'] },
    onColor: {
      control: { type: 'boolean' },
      description:
        'Swaps text to `--bds-text-on-color-dark` for an eyebrow on a filled brand/dark surface. On `--bds-surface-brand-primary` the pair is 3.78:1 — AA-large, not AA.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Eyebrow>;

const Frame = ({
  background = 'var(--bds-surface-primary)',
  children,
}: {
  background?: string;
  children: React.ReactNode;
}) => <div style={{ width: '360px', padding: 'var(--bds-padding-lg)', background }}>{children}</div>;

/**
 * @summary Default muted eyebrow
 */
export const Default: Story = {
  args: { children: 'Direction A' },
};

/**
 * The canonical pairing — the eyebrow sits directly above a `ContentBlock`
 * title and owns the tight gap to it.
 * @summary Eyebrow above a ContentBlock title
 */
export const AboveContentBlock: Story = {
  render: () => (
    <Frame>
      <Eyebrow>Membership</Eyebrow>
      <ContentBlock
        title="Membership Plans"
        description="Every plan includes unlimited support and quarterly reviews."
      />
    </Frame>
  ),
};

/**
 * `onColor` swaps to `--bds-text-on-color-dark` (mode-invariant white) with no
 * per-instance `color` or `opacity`. White on `--bds-surface-brand-primary` is
 * 3.78:1 — AA-large, not AA (`tokens/contrast-pairings.json`).
 * @summary On a filled brand band
 */
export const OnColor: Story = {
  render: () => (
    <Frame background="var(--bds-surface-brand-primary)">
      <Eyebrow onColor>Client review</Eyebrow>
      <ContentBlock onColor title="Get in touch" size="lg" />
    </Frame>
  ),
};

/**
 * `primary` tone for stronger emphasis; `muted` is the default.
 * @summary Primary tone
 */
export const Primary: Story = {
  args: { children: 'Brand guide', tone: 'primary' },
};
