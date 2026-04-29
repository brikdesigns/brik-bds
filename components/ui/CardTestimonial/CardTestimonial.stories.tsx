import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardTestimonial } from './CardTestimonial';

/**
 * CardTestimonial — customer quote card with optional 5-star rating and author
 * attribution. Two variants: `brand` (filled brand surface) and `outlined`.
 * @summary Customer testimonial card
 */
const meta: Meta<typeof CardTestimonial> = {
  title: 'Components/Card/card-testimonial',
  component: CardTestimonial,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
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

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    quote: 'Square has completely transformed how we handle payments. The analytics alone have helped us grow 40% this year.',
    authorName: 'Sarah Chen',
    authorRole: 'Owner, Bloom Cafe',
    rating: 5,
    variant: 'brand',
  },
};

/* ─── Variant axis ───────────────────────────────────────────── */

/** Brand variant — filled brand surface for marketing/landing pages.
 *  @summary Brand variant */
export const Brand: Story = {
  args: {
    variant: 'brand',
    quote: 'Incredible results from day one. Highly recommend.',
    authorName: 'Sarah Chen',
    authorRole: 'Owner, Bloom Cafe',
    rating: 5,
  },
};

/** Outlined variant — bordered surface for embedded testimonials.
 *  @summary Outlined variant */
export const Outlined: Story = {
  args: {
    variant: 'outlined',
    quote: 'Professional, responsive, and creative. Our new site has driven 3x more leads.',
    authorName: 'Marcus Johnson',
    authorRole: 'Marketing Director, Apex Corp',
    rating: 5,
  },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Without rating — `rating` is optional. Use for quotes that don't include a star score.
 *  @summary No rating */
export const WithoutRating: Story = {
  args: {
    variant: 'brand',
    quote: 'Working with this team felt like an extension of our own company.',
    authorName: 'Emily Rodriguez',
    authorRole: 'CEO, Greenfield Digital',
  },
};

/** Minimal attribution — name only, no role.
 *  @summary Name-only attribution */
export const NameOnly: Story = {
  args: {
    variant: 'brand',
    quote: 'Best investment we made this year. Period.',
    authorName: 'Alex Turner',
    rating: 5,
  },
};
