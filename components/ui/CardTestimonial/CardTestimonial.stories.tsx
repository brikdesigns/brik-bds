import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardTestimonial } from './CardTestimonial';

const meta: Meta<typeof CardTestimonial> = {
  title: 'Displays/Card/card-testimonial',
  component: CardTestimonial,
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

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%' }}>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap' }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

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

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Brand variant</SectionLabel>
      <Row>
        <div style={{ width: 380 }}>
          <CardTestimonial
            variant="brand"
            quote="Incredible results from day one. Highly recommend."
            authorName="Sarah Chen"
            authorRole="Owner, Bloom Cafe"
            rating={5}
          />
        </div>
      </Row>

      <SectionLabel>Outlined variant</SectionLabel>
      <Row>
        <div style={{ width: 380 }}>
          <CardTestimonial
            variant="outlined"
            quote="Professional, responsive, and creative. Our new site has driven 3x more leads."
            authorName="Marcus Johnson"
            authorRole="Marketing Director, Apex Corp"
            rating={5}
          />
        </div>
      </Row>

      <SectionLabel>Without rating</SectionLabel>
      <Row>
        <div style={{ width: 380 }}>
          <CardTestimonial
            variant="brand"
            quote="Working with this team felt like an extension of our own company."
            authorName="Emily Rodriguez"
            authorRole="CEO, Greenfield Digital"
          />
        </div>
      </Row>

      <SectionLabel>Minimal attribution (no role)</SectionLabel>
      <Row>
        <div style={{ width: 380 }}>
          <CardTestimonial
            variant="brand"
            quote="Best investment we made this year. Period."
            authorName="Alex Turner"
            rating={5}
          />
        </div>
      </Row>
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Mixed variant testimonials grid</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-lg)', maxWidth: 1200 }}>
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
    </Stack>
  ),
};
