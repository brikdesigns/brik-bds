import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { CommentComposer, type CommentMention } from './CommentComposer';

const mentions: CommentMention[] = [
  { id: 'agent-design-system', label: 'design-system', description: 'Components and tokens' },
  { id: 'agent-product-dev', label: 'product-dev', description: 'Portal features' },
  { id: 'agent-qa', label: 'qa', description: 'Code review' },
];

/**
 * Comment textarea with a submit button and optional `@mention` suggestions from a caller-supplied list.
 * @summary Comment textarea with submit and optional @mention suggestions
 */
const meta: Meta<typeof CommentComposer> = {
  title: 'Components/comment-composer',
  component: CommentComposer,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    onSubmit: { action: 'submitted', description: 'Called with `{ body, mentions }`. May return a Promise: pending shows until it settles, the text clears on resolve and stays on reject.' },
    mentions: { control: 'object', description: 'Suggestions offered after typing `@`: `{ id, label, description? }`. Omit for a plain composer.' },
    label: { control: 'text', description: 'Accessible name of the textarea.' },
    placeholder: { control: 'text', description: 'Placeholder text.' },
    submitLabel: { control: 'text', description: 'Submit button text.' },
    pending: { control: 'boolean', description: 'Caller-owned pending state. Adds to the composer\'s own while a returned Promise is in flight.' },
    disabled: { control: 'boolean', description: 'Disables the textarea and the submit button.' },
    error: { control: 'text', description: 'Error message under the textarea, owned by the caller.' },
    rows: { control: 'number', description: 'Visible textarea rows.' },
  },
  args: { onSubmit: fn(), placeholder: 'Write a comment…' },
  decorators: [
    (Story) => (
      <div style={{ width: 420, paddingBottom: 160 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CommentComposer>;

/** @summary Empty composer; submit is off until there is text */
export const Default: Story = {};

/** @summary Submit in flight; button spinner, text read-only */
export const Pending: Story = { args: { pending: true } };

/** @summary Typing `@` opens the suggestion list */
export const WithMentions: Story = {
  args: { mentions },
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: 'Add a comment' }), '@');
    await expect(await canvas.findAllByRole('option')).toHaveLength(3);
  },
};

/* ─── Interaction tests ───────────────────────────────────────── */

/** @summary Arrows move, Enter inserts, payload names the mention */
export const InteractionTestMentionKeyboard: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { mentions, onSubmit: fn(async () => {}) },
  play: async ({ args, canvas }) => {
    const textbox = canvas.getByRole('textbox', { name: 'Add a comment' });
    await userEvent.click(textbox);
    await userEvent.keyboard('@pro');
    await expect(canvas.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}@');
    await expect(canvas.getAllByRole('option')).toHaveLength(3);
    await userEvent.keyboard('{ArrowDown}');
    await expect(textbox).toHaveAttribute('aria-activedescendant', canvas.getByRole('option', { selected: true }).id);
    await userEvent.keyboard('{Enter}');
    await expect(textbox).toHaveValue('@product-dev ');
    await userEvent.keyboard('please look{Meta>}{Enter}{/Meta}');
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({
        body: '@product-dev please look',
        mentions: [mentions[1]],
      }),
    );
  },
};

/** @summary Submit clears the text and returns focus */
export const InteractionTestFocusReturn: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { onSubmit: fn(async () => {}) },
  play: async ({ canvas }) => {
    const textbox = canvas.getByRole('textbox', { name: 'Add a comment' });
    await userEvent.type(textbox, 'Shipped.');
    await userEvent.click(canvas.getByRole('button', { name: 'Comment' }));
    await waitFor(() => expect(textbox).toHaveValue(''));
    await expect(textbox).toHaveFocus();
  },
};

/** @summary A rejected submit keeps the text */
export const InteractionTestRejectedSubmit: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { onSubmit: fn(async () => { throw new Error('offline'); }), error: 'Could not post the comment.' },
  play: async ({ args, canvas }) => {
    const textbox = canvas.getByRole('textbox', { name: 'Add a comment' });
    await userEvent.type(textbox, 'Keep me');
    await userEvent.click(canvas.getByRole('button', { name: 'Comment' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Comment' })).toBeEnabled());
    await expect(textbox).toHaveValue('Keep me');
    await expect(textbox).toHaveFocus();
  },
};
