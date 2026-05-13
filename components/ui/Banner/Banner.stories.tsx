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
import { Banner } from './Banner';
import { Button } from '../Button';

const meta: Meta<typeof Banner> = {
  title: 'Components/Feedback/banner',
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
      options: ['announcement', 'warning', 'error', 'information'],
      description:
        '`announcement` (default) = brand-primary surface, `role="banner"`. ' +
        '`warning` / `error` / `information` = secondary surface with leading status Badge, `role="alert"`.',
    },
    action: {
      control: false,
      description:
        'Optional ReactNode aligned right (typically a Button). Use `variant="on-color"` for announcement tone; default variants for status tones.',
    },
    onDismiss: {
      action: 'dismissed',
      description:
        'Optional close handler. When provided, renders an × close button at the trailing edge. ' +
        'Caller owns the visibility state — see the Dismissible pattern story.',
    },
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

/* ─── Variants — one story per tone (Q3 semantic starting points) ─ */

/** @summary Announcement tone — brand-primary surface for marketing notices */
export const Announcement: Story = {
  args: {
    title: 'Limited time offer',
    description: 'Save 20% on all plans this month',
    action: <BannerAction>View plans</BannerAction>,
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

