import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagList } from './TagList';
import { Tag } from '../Tag';
import { Field } from '../Field';

const meta: Meta<typeof TagList> = {
  title: 'Displays/Sheet/tag-list',
  component: TagList,
  parameters: { layout: 'padded' },
  argTypes: {
    gap: { control: 'select', options: ['xs', 'sm', 'md'] },
    wrap: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TagList>;

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
      <TagList {...args}>
        <Tag size="sm">Cosmetic</Tag>
        <Tag size="sm">General</Tag>
        <Tag size="sm">Implants</Tag>
        <Tag size="sm">Invisalign</Tag>
      </TagList>
    </Frame>
  ),
};

/* ─── 2. Gaps ────────────────────────────────────────────────── */

export const Gaps: Story = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        <TagList gap="xs">
          <Tag size="sm">xs gap</Tag>
          <Tag size="sm">tight</Tag>
          <Tag size="sm">cluster</Tag>
        </TagList>

        <TagList gap="sm">
          <Tag size="sm">sm gap</Tag>
          <Tag size="sm">standard</Tag>
          <Tag size="sm">list</Tag>
        </TagList>

        <TagList gap="md">
          <Tag size="md">md gap</Tag>
          <Tag size="md">roomy</Tag>
          <Tag size="md">display</Tag>
        </TagList>
      </div>
    </Frame>
  ),
};

/* ─── 3. Inside a Field ──────────────────────────────────────── */

export const InsideField: Story = {
  render: () => (
    <Frame>
      <Field label="Services offered">
        <TagList>
          <Tag size="sm">Cosmetic</Tag>
          <Tag size="sm">General</Tag>
          <Tag size="sm">Implants</Tag>
          <Tag size="sm">Invisalign</Tag>
          <Tag size="sm">Whitening</Tag>
        </TagList>
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
          <TagList>
            <Tag size="sm">Dental</Tag>
            <Tag size="sm">Medical</Tag>
            <Tag size="sm">Legal</Tag>
          </TagList>
        </Field>

        <Field label="Voice traits">
          <TagList>
            <Tag size="sm">Warm</Tag>
            <Tag size="sm">Authoritative</Tag>
            <Tag size="sm">Clear</Tag>
          </TagList>
        </Field>

        <Field label="Brand personality">
          <TagList>
            <Tag size="sm">Sophisticated</Tag>
            <Tag size="sm">Approachable</Tag>
            <Tag size="sm">Trustworthy</Tag>
          </TagList>
        </Field>
      </div>
    </Frame>
  ),
};
