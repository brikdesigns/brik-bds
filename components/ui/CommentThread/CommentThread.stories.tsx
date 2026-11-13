import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Icon } from '../Icon';
import { TextLink } from '../TextLink';
import { Gear } from '../../icons';
import { CommentThread, type CommentThreadEvent } from './CommentThread';

const events: CommentThreadEvent[] = [
  {
    id: 'e1',
    actor: 'Emily Rivera',
    action: 'commented',
    kind: 'Comment',
    kindColor: 'blue',
    body: 'Can we get the Activity section on the backlog item page?',
    timestamp: 'Apr 12, 2026, 1:04 PM',
    dateTime: '2026-04-12T13:04:00Z',
  },
  {
    id: 'e2',
    actor: 'design-system',
    action: 'opened a pull request',
    kind: 'Reference',
    kindColor: 'purple',
    body: <TextLink href="https://example.com/pull/3138" size="small">example.com/pull/3138</TextLink>,
    timestamp: 'Apr 12, 2026, 3:15 PM',
    dateTime: '2026-04-12T15:15:00Z',
    icon: <Icon icon={Gear} />,
  },
  {
    id: 'e3',
    actor: 'Nick Stanerson',
    action: 'commented',
    kind: 'Comment',
    kindColor: 'blue',
    body: 'Thanks, merging after the visual check.',
    timestamp: 'Apr 12, 2026, 4:40 PM',
    dateTime: '2026-04-12T16:40:00Z',
  },
];

/**
 * An `ActivityTimeline` of events with a `CommentComposer` below it. Events run oldest first, newest last.
 * @summary Activity timeline with a comment composer
 */
const meta: Meta<typeof CommentThread> = {
  title: 'Containers/comment-thread',
  component: CommentThread,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    events: { control: 'object', description: 'Events oldest first: `{ id, actor, action?, kind?, kindColor?, body?, timestamp, dateTime?, icon? }`. `kind` renders as a read-only `Tag`.' },
    onSubmit: { action: 'submitted', description: 'Called with `{ body, mentions }` (see `CommentComposer`). Omit for a read-only thread with no composer.' },
    emptyMessage: { control: 'text', description: 'Shown when `events` is empty.' },
    mentions: { control: 'object', description: 'Mention suggestions passed to the composer: `{ id, label, description? }`.' },
    label: { control: 'text', description: 'Accessible name of the composer textarea.' },
    placeholder: { control: 'text', description: 'Composer placeholder.' },
    submitLabel: { control: 'text', description: 'Composer submit button text.' },
    pending: { control: 'boolean', description: 'Caller-owned pending state of the composer.' },
    disabled: { control: 'boolean', description: 'Disables the composer.' },
    error: { control: 'text', description: 'Composer error message, owned by the caller.' },
  },
  args: { events, onSubmit: fn(), placeholder: 'Write a comment…' },
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CommentThread>;

/** @summary Populated thread with the composer last */
export const Default: Story = {};

/** @summary No events yet */
export const Empty: Story = { args: { events: [] } };
