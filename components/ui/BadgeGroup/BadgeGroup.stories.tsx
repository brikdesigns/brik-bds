import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeGroup } from './BadgeGroup';
import { Badge } from '../Badge';
import { Field } from '../Field';

/**
 * BadgeGroup — horizontal cluster of `<Badge>` elements with locked spacing.
 * Replaces ad-hoc `flex` containers when grouping badges.
 * @summary Horizontal cluster of Badges with locked spacing
 */
const meta: Meta<typeof BadgeGroup> = {
  title: 'Components/Indicator/badge-group',
  component: BadgeGroup,
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
type Story = StoryObj<typeof BadgeGroup>;

const sampleBadges = (
  <>
    <Badge status="positive" size="sm">Active</Badge>
    <Badge status="warning" size="sm">Pending</Badge>
    <Badge status="info" size="sm">Draft</Badge>
    <Badge status="error" size="sm">Blocked</Badge>
  </>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { gap: 'xs', wrap: true, children: sampleBadges },
};

/** Side-by-side comparison of all gap values. ADR-006 axis-gallery exception.
 *  @summary All gap values rendered together */
export const Gaps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      <BadgeGroup gap="xs">
        <Badge status="positive" size="sm">xs gap</Badge>
        <Badge status="info" size="sm">tight</Badge>
        <Badge status="brand" size="sm">cluster</Badge>
      </BadgeGroup>
      <BadgeGroup gap="sm">
        <Badge status="positive" size="sm">sm gap</Badge>
        <Badge status="info" size="sm">standard</Badge>
        <Badge status="brand" size="sm">list</Badge>
      </BadgeGroup>
      <BadgeGroup gap="md">
        <Badge status="positive" size="md">md gap</Badge>
        <Badge status="info" size="md">roomy</Badge>
        <Badge status="brand" size="md">display</Badge>
      </BadgeGroup>
    </div>
  ),
};

/** Wrapped in a Field — the canonical use for grouped status indicators on a sheet.
 *  @summary BadgeGroup inside a Field label */
export const InsideField: Story = {
  render: () => (
    <Field label="Integrations health">
      <BadgeGroup>
        <Badge status="positive" size="sm">Helicone</Badge>
        <Badge status="positive" size="sm">Supabase</Badge>
        <Badge status="warning" size="sm">Stripe</Badge>
        <Badge status="error" size="sm">Twilio</Badge>
      </BadgeGroup>
    </Field>
  ),
};
