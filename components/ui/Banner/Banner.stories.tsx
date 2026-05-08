import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Banner } from './Banner';
import { Button } from '../Button';

const meta: Meta<typeof Banner> = {
  title: 'Components/Feedback/banner',
  component: Banner,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    tone: { control: 'select', options: ['announcement', 'warning', 'error', 'information'] },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

const BannerAction = ({ children }: { children: string }) => (
  <Button variant="on-color" size="md">{children}</Button>
);

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    action: <BannerAction>Learn more</BannerAction>,
  },
};

/* ─── Variants — one story per meaningful state ──────────────── */

/** @summary Default announcement tone with title, description, and action */
export const Announcement: Story = {
  args: {
    title: 'Limited time offer',
    description: 'Save 20% on all plans this month',
    action: <BannerAction>View plans</BannerAction>,
  },
};

/** @summary Announcement tone with only a title (no description, no action) */
export const TitleOnly: Story = {
  args: {
    title: 'New feature available',
  },
};

/** @summary Announcement tone with a dismiss affordance */
export const Dismissible: Story = {
  args: {
    title: 'Cookie notice',
    description: 'We use cookies to improve your experience',
    action: <BannerAction>Accept</BannerAction>,
    onDismiss: () => {},
  },
};

/** @summary Information tone — neutral status with leading Badge and `role="alert"` */
export const Information: Story = {
  args: {
    tone: 'information',
    title: 'Heads up',
    description: 'Your trial period ends in 7 days. Upgrade to keep access.',
    action: <Button size="sm">Upgrade</Button>,
  },
};

/** @summary Warning tone — caution status with leading Badge and `role="alert"` */
export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Slow connection detected',
    description: 'Some features may take longer to respond.',
  },
};

/** @summary Error tone — failure status with leading Badge and `role="alert"` */
export const Error: Story = {
  args: {
    tone: 'error',
    title: 'Sync failed',
    description: "We couldn't reach the server. Check your connection and try again.",
    action: <Button size="sm" variant="secondary">Retry</Button>,
  },
};

/* ─── Patterns — irreducible (hook usage) ────────────────────── */

/**
 * Dismissible banner wired up to local state — the canonical pattern for a
 * notice the user can hide and recover. Uses `useState` so the hide / show
 * cycle is demonstrable; render-mode is required because args alone can't
 * express the controlled toggle.
 *
 * @summary Dismissible banner with a hide / show toggle
 */
export const DismissibleWithToggle: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    if (!visible) {
      return (
        <button
          type="button"
          onClick={() => setVisible(true)}
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-sm)',
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Show banner again
        </button>
      );
    }

    return (
      <Banner
        title="Welcome back"
        description="You have 3 unread notifications"
        onDismiss={() => setVisible(false)}
      />
    );
  },
};
