import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardTestimonial } from './CardTestimonial';

const meta: Meta<typeof CardTestimonial> = {
  title: 'Containers/card-testimonial',
  component: CardTestimonial,
  tags: ['surface-web'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['brand', 'outlined'],
      description: '`brand` (default) = colored background with inverse text; `outlined` = light background with border.',
    },
    quote: {
      control: 'text',
      description: 'Testimonial quote text.',
    },
    authorName: {
      control: 'text',
      description: 'Customer name rendered below the quote.',
    },
    authorRole: {
      control: 'text',
      description: 'Optional role or company rendered below the author name.',
    },
    rating: {
      control: { type: 'range', min: 0, max: 5, step: 1 },
      description: 'Star rating 0–5. Omit to hide the rating row entirely.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CardTestimonial>;

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive sandbox — toggle variant and rating via Controls */
export const Playground: Story = {
  args: {
    quote: 'Square has completely transformed how we handle payments. The analytics alone have helped us grow 40% this year.',
    authorName: 'Sarah Chen',
    authorRole: 'Owner, Bloom Cafe',
    rating: 5,
    variant: 'brand',
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};

/* ─── Variants (Q3 — one per semantic starting point) ────────── */

/**
 * `variant="brand"` — colored background with inverse text. Default variant.
 * Use on marketing pages with a brand-primary color field.
 *
 * @summary variant="brand" — colored background
 */
export const Brand: Story = {
  args: {
    variant: 'brand',
    quote: 'Incredible results from day one. Highly recommend.',
    authorName: 'Sarah Chen',
    authorRole: 'Owner, Bloom Cafe',
    rating: 5,
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};

/**
 * `variant="outlined"` — light background with border. Use when the
 * section background conflicts with the brand-colored card.
 *
 * @summary variant="outlined" — light background with border
 */
export const Outlined: Story = {
  args: {
    variant: 'outlined',
    quote: 'Professional, responsive, and creative. Our new site has driven 3x more leads.',
    authorName: 'Marcus Johnson',
    authorRole: 'Marketing Director, Apex Corp',
    rating: 5,
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};

/* ─── Patterns (Q4 — irreducible compositions) ───────────────── */

/**
 * Three testimonials in a responsive grid — the canonical social-proof
 * section layout mixing brand and outlined variants.
 *
 * @summary Mixed-variant testimonials grid
 */
export const TestimonialsGrid: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 1200 }}><Story /></div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-lg)' }}>
      <CardTestimonial
        variant="brand"
        quote="Square has completely transformed how we handle payments. The analytics alone have helped us grow 40% this year."
        authorName="Sarah Chen"
        authorRole="Owner, Bloom Cafe"
        rating={5}
      />
      <CardTestimonial
        variant="outlined"
        quote="The team was incredibly responsive and delivered beyond our expectations."
        authorName="Marcus Johnson"
        authorRole="Marketing Director, Apex Corp"
        rating={5}
      />
      <CardTestimonial
        variant="brand"
        quote="Best investment we made this year. Communication was seamless."
        authorName="Emily Rodriguez"
        authorRole="CEO, Greenfield Digital"
        rating={4}
      />
    </div>
  ),
};
