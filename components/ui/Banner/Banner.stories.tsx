import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from './Banner';
import { Button } from '../Button';

/**
 * Banner — full-width contextual banner. One component, two tone families:
 * `announcement` (brand surface, marketing notices) and the status tones
 * `information` / `warning` / `error` (alert role, replaces legacy AlertBanner).
 * @summary Full-width contextual banner with tone variants
 */
const meta: Meta<typeof Banner> = {
  title: 'Components/Feedback/banner',
  component: Banner,
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    tone: { control: 'select', options: ['announcement', 'warning', 'error', 'information'] },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

/* ─── Sandbox ────────────────────────────────────────────────── */

/** Args-driven sandbox. Use Controls to explore tones, content, and dismiss.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    action: <Button variant="on-color" size="md">Learn more</Button>,
  },
};

/* ─── Tones ──────────────────────────────────────────────────── */

/** Default tone — brand-primary surface for marketing notices and announcements.
 *  @summary Announcement tone with action */
export const Announcement: Story = {
  args: {
    title: 'Limited time offer',
    description: 'Save 20% on all plans this month.',
    action: <Button variant="on-color" size="md">View plans</Button>,
  },
};

/** Status tone — informational notice for non-blocking updates.
 *  @summary Information status tone */
export const Information: Story = {
  args: {
    tone: 'information',
    title: 'Heads up',
    description: 'Your trial period ends in 7 days. Upgrade to keep access.',
    action: <Button size="sm">Upgrade</Button>,
  },
};

/** Status tone — warning for degraded but recoverable conditions.
 *  @summary Warning status tone */
export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Slow connection detected',
    description: 'Some features may take longer to respond.',
  },
};

/** Status tone — error for failures that need user action.
 *  @summary Error status tone */
export const Error: Story = {
  args: {
    tone: 'error',
    title: 'Sync failed',
    description: "We couldn't reach the server. Check your connection and try again.",
    action: <Button size="sm" variant="secondary">Retry</Button>,
  },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Title-only — no description, no action. Minimal banner shape.
 *  @summary Banner with title only */
export const TitleOnly: Story = {
  args: {
    title: 'New feature available',
  },
};

/** Dismissible — adds a close button and onDismiss handler. Combine with any tone.
 *  @summary Dismissible banner with close button */
export const Dismissible: Story = {
  args: {
    title: 'Cookie notice',
    description: 'We use cookies to improve your experience.',
    action: <Button variant="on-color" size="md">Accept</Button>,
    onDismiss: () => {},
  },
};
