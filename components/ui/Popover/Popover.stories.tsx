import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from '../Button';

/* ─── Shared Content ──────────────────────────────────── */

const sampleContent = (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--gap-sm)',
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--body-md)',
    color: 'var(--text-primary)',
  }}>
    <strong style={{ fontWeight: 'var(--font-weight-semibold)' as unknown as number }}>
      Popover title
    </strong>
    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
      This is some helpful content inside the popover panel.
    </p>
  </div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Popover> = {
  title: 'Components/popover',
  component: Popover,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ padding: '120px' /* bds-lint-ignore — space for popover overflow */ }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    content: { control: false, description: 'Popover panel content.' },
    children: { control: false, description: 'The trigger element.' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
    isOpen: {
      control: false,
      description: 'Controlled open state. Leave unset for uncontrolled mode (Popover manages its own state).',
    },
    onOpenChange: {
      control: false,
      description: 'Controlled change handler — fires with the next open state on trigger interaction.',
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Popover manages its own open
   state internally when `isOpen` is left unset, so args alone
   drive the trigger interaction — no render/hook wiring needed.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Click the trigger to reveal the panel. Switch `placement` and `trigger`
 * via Controls.
 *
 * @summary Floating content panel anchored to a trigger
 */
export const Default: Story = {
  args: {
    content: sampleContent,
    placement: 'bottom',
    trigger: 'click',
    children: <Button variant="outline">Click me</Button>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   PLACEMENTS — narrow axis-only-gallery exception (ADR-006): side
   by side is the entire point, and the Controls panel can only
   show one placement at a time. Mirrors the sibling Tooltip file.
   ═══════════════════════════════════════════════════════════════ */

/* `placement` is a Control on Default — the four-placement comparison lives
   in Popover.mdx as a docs-local demo (#1489). */
