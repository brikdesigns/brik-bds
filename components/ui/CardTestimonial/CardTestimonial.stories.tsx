import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardTestimonial } from './CardTestimonial';

const meta: Meta<typeof CardTestimonial> = {
  title: 'Components/Card/card-testimonial',
  component: CardTestimonial,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['brand', 'outlined'],
      description: 'Visual variant',
    },
    rating: {
      control: { type: 'range', min: 0, max: 5, step: 1 },
      description: 'Star rating (1-5)',
    },
    quote: { control: 'text' },
    authorName: { control: 'text' },
    authorRole: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CardTestimonial>;

export const Default: Story = {
  args: {
    quote: 'Square has completely transformed how we handle payments. The analytics alone have helped us grow 40% this year.',
    authorName: 'Sarah Chen',
    authorRole: 'Owner, Bloom Cafe',
    rating: 5,
    variant: 'brand',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Outlined: Story = {
  args: {
    quote: 'The team was incredibly responsive and delivered beyond our expectations. Our new site has driven 3x more leads.',
    authorName: 'Marcus Johnson',
    authorRole: 'Marketing Director, Apex Corp',
    rating: 5,
    variant: 'outlined',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithoutRating: Story = {
  args: {
    quote: 'Working with this team felt like having an extension of our own company. Communication was seamless throughout.',
    authorName: 'Emily Rodriguez',
    authorRole: 'CEO, Greenfield Digital',
    variant: 'brand',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
};

export const MinimalAttribution: Story = {
  args: {
    quote: 'Best investment we made this year. Period.',
    authorName: 'Alex Turner',
    rating: 5,
    variant: 'brand',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '380px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Grid: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
  <CardTestimonial
    quote="Amazing service and results."
    authorName="Sarah Chen"
    authorRole="Owner, Bloom Cafe"
    rating={5}
  />
  {/* ... more testimonials */}
</div>`,
      },
    },
  },
  render: () => {
    const testimonials = [
      {
        quote: 'Square has completely transformed how we handle payments. The analytics alone have helped us grow 40% this year.',
        authorName: 'Sarah Chen',
        authorRole: 'Owner, Bloom Cafe',
        rating: 5 as const,
      },
      {
        quote: 'The team was incredibly responsive and delivered beyond our expectations. Our new site has driven 3x more leads.',
        authorName: 'Marcus Johnson',
        authorRole: 'Marketing Director, Apex Corp',
        rating: 5 as const,
      },
      {
        quote: 'Best investment we made this year. Communication was seamless and the results speak for themselves.',
        authorName: 'Emily Rodriguez',
        authorRole: 'CEO, Greenfield Digital',
        rating: 4 as const,
      },
    ];

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--padding-lg)',
        maxWidth: '1200px',
      }}>
        {testimonials.map((t) => (
          <CardTestimonial key={t.authorName} {...t} />
        ))}
      </div>
    );
  },
};

export const MixedVariants: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 'var(--padding-lg)',
      maxWidth: '800px',
    }}>
      <CardTestimonial
        variant="brand"
        quote="Incredible results from day one."
        authorName="Sarah Chen"
        authorRole="Owner, Bloom Cafe"
        rating={5}
      />
      <CardTestimonial
        variant="outlined"
        quote="Professional, responsive, and creative."
        authorName="Marcus Johnson"
        authorRole="Director, Apex Corp"
        rating={5}
      />
    </div>
  ),
};
