import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, waitFor } from 'storybook/test';
import { MediaTabs } from './MediaTabs';

/* ─── Fixture ─────────────────────────────────────────────────── */

/** Flat token-coloured panel — stands in for real media without a network fetch. */
const MediaPlaceholder = ({ label, hue }: { label: string; hue: string }) => (
  <div
    style={{
      display: 'grid',
      placeItems: 'center',
      background: hue,
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--label-lg)',
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--text-primary)',
    }}
  >
    {label}
  </div>
);

const tabs = [
  {
    id: 'marketing',
    label: 'Marketing',
    description:
      'Campaigns, content, and the site that carries them — shipped on a system your team can extend without us.',
    media: <MediaPlaceholder label="Marketing" hue="var(--surface-secondary)" />,
  },
  {
    id: 'back-office',
    label: 'Back office',
    description:
      'The unglamorous operations layer — intake, scheduling, billing — wired so the front of house can move.',
    media: <MediaPlaceholder label="Back office" hue="var(--surface-muted)" />,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description:
      'One place the numbers actually agree, so the next decision starts from evidence instead of a guess.',
    media: <MediaPlaceholder label="Analytics" hue="var(--surface-accent)" />,
  },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof MediaTabs> = {
  title: 'Containers/media-tabs',
  component: MediaTabs,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    tabs: {
      control: false,
      description:
        'Ordered tabs — each supplies its own `id`, `label`, optional `description`, and `media`.',
    },
    activeTab: {
      control: false,
      description: 'Controlled active tab id. Pair with `onActiveTabChange`.',
    },
    onActiveTabChange: {
      control: false,
      description: 'Called with the next tab id on click, keyboard, or auto-advance.',
    },
    defaultActiveTab: {
      control: 'text',
      description: 'Initial active tab id when uncontrolled. Defaults to the first tab.',
    },
    autoplay: {
      control: 'boolean',
      description: 'Auto-advance while in view. Always off under `prefers-reduced-motion: reduce`.',
    },
    interval: {
      control: 'text',
      description:
        'Dwell time per tab — CSS duration; number is treated as ms. Overrides `--bds-media-tabs-interval`.',
    },
    pauseOnHover: {
      control: 'boolean',
      description: 'Pause auto-advance on pointer hover. Focus always pauses.',
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Rail axis. Vertical also swaps the arrow-key axis to Up/Down.',
    },
    mediaPosition: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'Which side the media panel sits on.',
    },
    variant: {
      control: 'inline-radio',
      options: ['text', 'text-underline', 'tab', 'box'],
      description: 'Visual variant passed through to the underlying `TabBar` rail.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MediaTabs>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.

   Single-appearance component (ADR-010 matrix): `orientation`,
   `mediaPosition`, and `variant` are listed placement/appearance axes
   (Rule 5 — Control + MDX demo, never a story), `autoplay` /
   `pauseOnHover` are boolean toggles (Q2 — Controls only), `interval`
   and `defaultActiveTab` are tuning values rather than semantic starting
   points, and reduced motion is a toolbar-global axis (Q1). No value
   clears the Q3 bar, so this file ships `Default` plus Q5 interaction
   tests.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    tabs,
    autoplay: true,
    pauseOnHover: true,
    orientation: 'vertical',
    mediaPosition: 'end',
    variant: 'tab',
  },
};

/* ═══════════════════════════════════════════════════════════════
   Q5 — interaction assertions. Out of MCP discovery and the sidebar.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Asserts the click-to-override contract and the tabs ARIA wiring: real `role="tab"`
 * buttons, `aria-selected` tracking the active tab, each tab pointing at its
 * `tabpanel` via `aria-controls`, and `onActiveTabChange` firing with the clicked id.
 *
 * @summary Click selects a tab and reports the change
 */
export const InteractionTestTabSelection: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    tabs,
    // Autoplay off so the assertions race nothing.
    autoplay: false,
    onActiveTabChange: fn(),
  },
  play: async ({ canvas, args }) => {
    const first = canvas.getByRole('tab', { name: 'Marketing' });
    const third = canvas.getByRole('tab', { name: 'Analytics' });

    // First tab is active on mount, and is the one tab in the Tab sequence.
    await expect(first).toHaveAttribute('aria-selected', 'true');
    await expect(first).toHaveAttribute('tabindex', '0');
    await expect(third).toHaveAttribute('aria-selected', 'false');
    await expect(third).toHaveAttribute('tabindex', '-1');
    // Each tab controls its own panel, and that panel is labelled back by the tab.
    const activePanelId = first.getAttribute('aria-controls');
    await expect(activePanelId).toBeTruthy();
    await expect(first.getAttribute('aria-controls')).not.toBe(third.getAttribute('aria-controls'));
    await expect(document.getElementById(activePanelId as string)).toHaveAttribute(
      'aria-labelledby',
      first.id,
    );

    third.click();

    await expect(args.onActiveTabChange).toHaveBeenCalledWith('analytics');
    await expect(third).toHaveAttribute('aria-selected', 'true');
    await expect(first).toHaveAttribute('aria-selected', 'false');
  },
};

/**
 * Asserts the WAI-ARIA tabs keyboard contract delegated to `TabBar`: with a
 * vertical rail, ArrowDown moves focus and activates the next tab (automatic
 * activation), and Home returns to the first.
 *
 * @summary Arrow keys move and activate tabs
 */
export const InteractionTestKeyboard: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    tabs,
    autoplay: false,
    orientation: 'vertical',
    onActiveTabChange: fn(),
  },
  play: async ({ canvas, args, userEvent }) => {
    const first = canvas.getByRole('tab', { name: 'Marketing' });
    const second = canvas.getByRole('tab', { name: 'Back office' });

    first.focus();
    await expect(first).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(args.onActiveTabChange).toHaveBeenCalledWith('back-office'));
    await expect(second).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(args.onActiveTabChange).toHaveBeenCalledWith('marketing'));
    await expect(first).toHaveFocus();
  },
};
