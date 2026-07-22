import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardTestimonial } from './CardTestimonial';

const meta: Meta<typeof CardTestimonial> = {
  title: 'Cards/card-testimonial',
  component: CardTestimonial,
  tags: ['surface-web'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['brand', 'outlined'] },
    rating: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    quote: { control: 'text' },
    authorName: { control: 'text' },
    authorRole: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CardTestimonial>;

/**
 * Brand variant (default) — brand-tinted card surface for marketing sections.
 * Toggle `rating` and omit `authorRole` via Controls for other configurations.
 *
 * @summary Customer testimonial — brand surface, quote + attribution + stars
 */
export const Default: Story = {
  args: {
    quote: 'Square has completely transformed how we handle payments. The analytics alone have helped us grow 40% this year.',
    authorName: 'Sarah Chen',
    authorRole: 'Owner, Bloom Cafe',
    rating: 5,
    variant: 'brand',
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};

/**
 * `variant="outlined"` — neutral surface with border for light backgrounds
 * where the brand fill would compete with surrounding content.
 *
 * @summary variant="outlined" — neutral surface with border
 */
export const Outlined: Story = {
  args: {
    quote: 'Professional, responsive, and creative. Our new site has driven 3x more leads in six months.',
    authorName: 'Marcus Johnson',
    authorRole: 'Marketing Director, Apex Corp',
    rating: 5,
    variant: 'outlined',
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
