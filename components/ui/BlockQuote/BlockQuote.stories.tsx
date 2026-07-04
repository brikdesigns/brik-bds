import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { BlockQuote } from './BlockQuote';

const meta: Meta<typeof BlockQuote> = {
  title: 'Components/block-quote',
  component: BlockQuote,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    quote: { control: 'text' },
    attribution: { control: 'text' },
    serviceLine: {
      control: 'radio',
      options: ['brand', 'marketing', 'information', 'product', 'back-office'],
      description:
        'Optional service line — drives the left-border accent + soft tint. Omit for the neutral treatment.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BlockQuote>;

const SAMPLE =
  'The website has made it so much easier to share what we do — new clients find us already knowing our story.';
const ATTRIBUTION = 'Joelle, Owner of Impressionz Salon & Spa';

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: { quote: SAMPLE, attribution: ATTRIBUTION, serviceLine: 'marketing' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Semantic structure: <figure> → <blockquote> + <figcaption><cite>.
    const fig = canvasElement.querySelector('figure.bds-block-quote');
    await expect(fig).not.toBeNull();
    await expect(fig).toHaveClass('bds-block-quote--marketing');
    await expect(canvas.getByText(/share what we do/)).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('blockquote.bds-block-quote__body'),
    ).not.toBeNull();
    await expect(
      canvasElement.querySelector('cite.bds-block-quote__cite'),
    ).not.toBeNull();
  },
};

/** @summary Neutral — no service line; default surface + border. */
export const Neutral: Story = {
  args: { quote: SAMPLE, attribution: ATTRIBUTION },
};

/** @summary Service-line accents — left-border + soft tint per line. */
export const ServiceLineAccents: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      {(['brand', 'marketing', 'information', 'product', 'back-office'] as const).map(
        (line) => (
          <BlockQuote
            key={line}
            serviceLine={line}
            quote={SAMPLE}
            attribution={`${line} service line`}
          />
        ),
      )}
    </div>
  ),
};
