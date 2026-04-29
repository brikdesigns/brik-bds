import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagGroup } from './TagGroup';
import { Tag } from '../Tag';
import { Field } from '../Field';

/**
 * TagGroup — horizontal cluster of `<Tag>` elements with locked spacing.
 * Indicator-family sibling of `BadgeGroup` — same API, different child.
 * @summary Horizontal cluster of Tags with locked spacing
 */
const meta: Meta<typeof TagGroup> = {
  title: 'Components/Indicator/tag-group',
  component: TagGroup,
  parameters: { layout: 'padded' },
  argTypes: {
    gap: { control: 'select', options: ['xs', 'sm', 'md'] },
    wrap: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TagGroup>;

const sampleTags = (
  <>
    <Tag size="sm">Cosmetic</Tag>
    <Tag size="sm">General</Tag>
    <Tag size="sm">Implants</Tag>
    <Tag size="sm">Invisalign</Tag>
  </>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { gap: 'xs', wrap: true, children: sampleTags },
};

/** Side-by-side comparison of all gap values. ADR-006 axis-gallery exception.
 *  @summary All gap values rendered together */
export const Gaps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      <TagGroup gap="xs">
        <Tag size="sm">xs gap</Tag>
        <Tag size="sm">tight</Tag>
        <Tag size="sm">cluster</Tag>
      </TagGroup>
      <TagGroup gap="sm">
        <Tag size="sm">sm gap</Tag>
        <Tag size="sm">standard</Tag>
        <Tag size="sm">list</Tag>
      </TagGroup>
      <TagGroup gap="md">
        <Tag size="md">md gap</Tag>
        <Tag size="md">roomy</Tag>
        <Tag size="md">display</Tag>
      </TagGroup>
    </div>
  ),
};

/** Wrapped in a Field — canonical use for grouped categorization labels.
 *  @summary TagGroup inside a Field label */
export const InsideField: Story = {
  render: () => (
    <Field label="Services offered">
      <TagGroup>
        <Tag size="sm">Cosmetic</Tag>
        <Tag size="sm">General</Tag>
        <Tag size="sm">Implants</Tag>
        <Tag size="sm">Invisalign</Tag>
        <Tag size="sm">Whitening</Tag>
      </TagGroup>
    </Field>
  ),
};
