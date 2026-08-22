/**
 * Reference implementation for ADR-010 — see #587 Phase 2.
 *
 * This file is the gold-standard template Phase 3 mirrors when batch-
 * migrating the remaining component story files. Five exports, every prop
 * declared in `argTypes`. No `Disabled` / `Loading` / icon-slot stories —
 * boolean states are Controls. Banner has no Q4 irreducible compositions,
 * so no `## Patterns` story; recipe amendment tracked separately.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { Banner } from './Banner';
import { Button } from '../Button';

const meta: Meta<typeof Banner> = {
  title: 'Components/banner',
  component: Banner,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: {
      control: 'text',
      description: 'Bold title text. Accepts ReactNode for inline composition.',
    },
    description: {
      control: 'text',
      description: 'Optional description rendered below the title.',
    },
    tone: {
      control: 'select',
      options: ['announcement', 'warning', 'negative', 'info', 'positive'],
      description:
        '`announcement` (default) = brand-primary surface, `role="banner"`. ' +
        '`warning` / `negative` / `info` = secondary surface with leading status Badge, `role="alert"`. ' +
        '`positive` = secondary surface with a leading positive Badge, `role="status"`.',
    },
    action: {
      control: false,
      description:
        'Optional ReactNode aligned right (typically a Button). Use `variant="on-color"` for announcement tone; default variants for status tones.',
    },
    onDismiss: {
      action: 'dismissed',
      description:
        'Optional close handler. When provided, renders a CloseButton at the trailing edge, ' +
        'labelled `aria-label="Dismiss banner"`. Caller owns the visibility state.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

const BannerAction = ({ children }: { children: string }) => (
  <Button variant="on-color" size="md">{children}</Button>
);

/* ─── Default ────────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    action: <BannerAction>Learn more</BannerAction>,
  },
};

/* ─── Variants — one story per tone (Q3 semantic starting points) ─ */

/**
 * Brand-primary surface for marketing notices.
 * @summary Announcement tone banner
 */
export const Announcement: Story = {
  args: {
    title: 'Limited time offer',
    description: 'Save 20% on all plans this month',
    action: <BannerAction>View plans</BannerAction>,
  },
};

/**
 * Neutral status with leading Badge and `role="alert"`.
 * @summary Information tone banner
 */
export const Information: Story = {
  args: {
    tone: 'info',
    title: 'Heads up',
    description: 'Your trial period ends in 7 days. Upgrade to keep access.',
    action: <Button size="sm">Upgrade</Button>,
  },
};

/**
 * Caution status with leading Badge and `role="alert"`.
 * @summary Warning tone banner
 */
export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Slow connection detected',
    description: 'Some features may take longer to respond.',
  },
};

/**
 * Failure status with leading Badge and `role="alert"`.
 * @summary Error tone banner
 */
export const Error: Story = {
  args: {
    tone: 'negative',
    title: 'Sync failed',
    description: "We couldn't reach the server. Check your connection and try again.",
    action: <Button size="sm" variant="secondary">Retry</Button>,
  },
};

/**
 * Positive confirmation with leading Badge and `role="status"`.
 * @summary Success tone banner
 */
export const Success: Story = {
  args: {
    tone: 'positive',
    title: 'Changes published',
    description: 'Your updates are live and visible to clients.',
  },
};

/* ─── Interaction test (Q5 — hidden from MCP) ────────────────── */

/**
 * Gates the dismiss affordance's accessible name. `Banner` overrides
 * `CloseButton`'s default `"Close"` with the contextual `"Dismiss banner"`,
 * and that string is documented on the component page — asserting it here
 * means a change to the label breaks a test instead of silently orphaning
 * the doc, which is how it drifted in the first place (#1989).
 *
 * @summary Verifies the dismiss label and that onDismiss fires
 */
export const InteractionTestDismiss: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    tone: 'warning',
    title: 'Brand assets are incomplete',
    onDismiss: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Dismiss banner'));
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};

