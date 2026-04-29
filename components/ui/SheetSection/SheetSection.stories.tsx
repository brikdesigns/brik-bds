import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetSection } from './SheetSection';

/**
 * SheetSection — named section wrapper for use inside a Sheet body. Pairs an
 * uppercase heading with content and locks vertical rhythm between sections.
 * @summary Named section wrapper for sheet bodies
 */
const meta: Meta<typeof SheetSection> = {
  title: 'Components/Container/sheet-section',
  component: SheetSection,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: '480px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    heading: { control: 'text' },
    description: { control: 'text' },
    spacing: { control: 'select', options: ['md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof SheetSection>;

const bodyText: React.CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)', // bds-lint-ignore
  color: 'var(--text-primary)',
  margin: 0,
};

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { heading: 'Color Primitives', spacing: 'lg' },
  render: (args) => (
    <SheetSection {...args}>
      <p style={bodyText}>Section content renders here.</p>
    </SheetSection>
  ),
};

/** Heading + content — most common shape.
 *  @summary Heading with content */
export const HeadingWithContent: Story = {
  args: { heading: 'Positioning' },
  render: (args) => (
    <SheetSection {...args}>
      <p style={bodyText}>A heading with content, no description.</p>
    </SheetSection>
  ),
};

/** Heading + description + content — adds a lead paragraph under the heading.
 *  @summary Heading with description */
export const HeadingWithDescription: Story = {
  args: {
    heading: 'Brand Identity',
    description: 'Birdwell & Mutlak Dentistry presents a bold, editorial identity anchored in a warm gold palette paired with neutral grays.',
  },
  render: (args) => (
    <SheetSection {...args}>
      <p style={bodyText}>A heading with both description and content.</p>
    </SheetSection>
  ),
};

/** Description-only — used for sheet-level lead copy. No uppercase heading is rendered.
 *  @summary Lead paragraph (no heading) */
export const DescriptionOnly: Story = {
  args: {
    description: 'An intro paragraph with no heading — use for sheet-level lead copy.',
  },
  render: (args) => (
    <SheetSection {...args}>
      <p style={bodyText}>Sections without a heading skip the uppercase label entirely.</p>
    </SheetSection>
  ),
};

/** Heading-only — placeholder for sections that haven't been populated yet.
 *  @summary Heading without content */
export const HeadingOnly: Story = {
  args: { heading: 'Standalone heading' },
};
