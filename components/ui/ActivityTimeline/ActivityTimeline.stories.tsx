import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { expect, within } from 'storybook/test';
import { ActivityTimeline } from './ActivityTimeline';
import { Stack } from '../Stack';
import { Tag } from '../Tag';
import { TagGroup } from '../TagGroup';
import { TextLink } from '../TextLink';

/**
 * Vertical chronological event feed — icon, label, detail, optional rich content, timestamp per row.
 * @summary Chronological activity event feed
 */
const meta: Meta<typeof ActivityTimeline> = {
  title: 'Containers/activity-timeline',
  component: ActivityTimeline,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    events: { control: false, description: 'Events top → bottom (chronological). Each: `icon` node, `label`, optional `detail`, optional `content` (rich node between detail and timestamp), `timestamp`, `isOrigin`. Edit the sequence to see any shape — single event, full lifecycle, resolved flow.' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 380 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

/** @summary Canonical event feed — edit `events` in Controls */
export const Default: Story = {
  args: {
    events: [
      { icon: <Icon icon="ph:plus" />, label: 'Request submitted', detail: 'by Emily Rivera', timestamp: 'Apr 12, 2026, 1:04 PM', isOrigin: true },
      { icon: <Icon icon="ph:user" />, label: 'Assigned', detail: 'to Nick Stanerson', timestamp: 'Apr 12, 2026, 3:15 PM' },
      { icon: <Icon icon="ph:check-circle" />, label: 'Status changed to In Progress', timestamp: 'Apr 12, 2026, 3:15 PM' },
    ],
  },
};

const withContentEvents = [
  {
    icon: <Icon icon="ph:pencil" />,
    label: 'Profile updated',
    detail: 'by Emily Rivera',
    content: (
      <TagGroup>
        <Tag size="sm">Business name</Tag>
        <Tag size="sm">Phone</Tag>
        <Tag size="sm">Hours</Tag>
        <Tag size="sm">Service area</Tag>
        <Tag size="sm">Primary contact</Tag>
      </TagGroup>
    ),
    timestamp: 'Apr 12, 2026, 1:04 PM',
    isOrigin: true,
  },
  {
    icon: <Icon icon="ph:check-circle" />,
    label: 'Offline acceptance recorded',
    detail: 'by Nick Stanerson',
    content: (
      <Stack gap="xs" align="start">
        <Tag size="sm" color="green">Approval</Tag>
        <div>
          Client approved the revised scope by email.
          <br />
          Signed copy filed with the engagement.
        </div>
        <TextLink href="https://example.com/evidence/acceptance-2026-04-12.pdf" size="small">
          example.com/evidence/acceptance-2026-04-12.pdf
        </TextLink>
      </Stack>
    ),
    timestamp: 'Apr 12, 2026, 3:15 PM',
  },
];

/**
 * An event's `content` slot renders below the detail line and above the
 * timestamp. Compose any nodes — a `TagGroup` of changed fields, or a decision
 * body with a `Tag`, text, and a clickable `TextLink` to the evidence.
 *
 * @summary Rich `content` — tag cluster and decision body with a link
 */
export const WithContent: Story = {
  args: { events: withContentEvents },
};

/**
 * Guards the `content` slot contract: it sits after `detail`, before
 * `timestamp`, and a `TextLink` inside it is a real anchor (#1349).
 *
 * @summary Verifies content order and that its link is an anchor
 */
export const InteractionTestContent: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { events: withContentEvents },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const detail = canvas.getByText('by Nick Stanerson');
    const content = canvas.getByText('Client approved the revised scope by email.', { exact: false });
    const timestamp = canvas.getByText('Apr 12, 2026, 3:15 PM');
    await expect(detail.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(content.compareDocumentPosition(timestamp) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const link = canvas.getByRole('link', { name: /acceptance-2026-04-12\.pdf/ });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', 'https://example.com/evidence/acceptance-2026-04-12.pdf');
  },
};
