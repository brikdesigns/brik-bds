import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagGroup } from './TagGroup';
import { Tag } from '../Tag';
import { Field } from '../Field';

const meta: Meta<typeof TagGroup> = {
  title: 'Components/Indicator/tag-group',
  component: TagGroup,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    gap: { control: 'select', options: ['xs', 'sm', 'md'] },
    wrap: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TagGroup>;

const Frame = ({ width = '360px', children }: { width?: string; children: React.ReactNode }) => (
  <div style={{ width, padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

/* ─── 1. Playground ──────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    gap: 'xs',
    wrap: true,
  },
  render: (args) => (
    <Frame>
      <TagGroup {...args}>
        <Tag size="sm">Cosmetic</Tag>
        <Tag size="sm">General</Tag>
        <Tag size="sm">Implants</Tag>
        <Tag size="sm">Invisalign</Tag>
      </TagGroup>
    </Frame>
  ),
};

/* ─── 2. Gaps ────────────────────────────────────────────────── */

export const Gaps: Story = {
  render: () => (
    <Frame>
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
    </Frame>
  ),
};

/* ─── 3. Inside a Field ──────────────────────────────────────── */

export const InsideField: Story = {
  render: () => (
    <Frame>
      <Field label="Services offered">
        <TagGroup>
          <Tag size="sm">Cosmetic</Tag>
          <Tag size="sm">General</Tag>
          <Tag size="sm">Implants</Tag>
          <Tag size="sm">Invisalign</Tag>
          <Tag size="sm">Whitening</Tag>
        </TagGroup>
      </Field>
    </Frame>
  ),
};

/* ─── 4. Patterns ────────────────────────────────────────────── */

export const Patterns: Story = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        <Field label="Industries">
          <TagGroup>
            <Tag size="sm">Dental</Tag>
            <Tag size="sm">Medical</Tag>
            <Tag size="sm">Legal</Tag>
          </TagGroup>
        </Field>

        <Field label="Voice traits">
          <TagGroup>
            <Tag size="sm">Warm</Tag>
            <Tag size="sm">Authoritative</Tag>
            <Tag size="sm">Clear</Tag>
          </TagGroup>
        </Field>

        <Field label="Brand personality">
          <TagGroup>
            <Tag size="sm">Sophisticated</Tag>
            <Tag size="sm">Approachable</Tag>
            <Tag size="sm">Trustworthy</Tag>
          </TagGroup>
        </Field>
      </div>
    </Frame>
  ),
};
