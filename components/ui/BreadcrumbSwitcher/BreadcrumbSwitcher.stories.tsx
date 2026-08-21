import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { BreadcrumbSwitcher } from './BreadcrumbSwitcher';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof BreadcrumbSwitcher> = {
  title: 'Navigation/breadcrumb-switcher',
  component: BreadcrumbSwitcher,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    items: {
      control: 'object',
      description:
        'Full crumb trail (reuses `Breadcrumb` — the last item is the current page).',
    },
    options: {
      control: 'object',
      description:
        'Sibling records to switch between, including the current one. The caret only renders when there is more than one option.',
    },
    switchLabel: {
      control: 'text',
      description: 'Accessible label for the switch trigger, e.g. `Switch service`.',
    },
    separator: {
      control: 'select',
      options: ['slash', 'chevron'],
      description:
        'Visual separator between crumbs. Forwarded to the internal `Breadcrumb`. Default `slash` (`/`); `chevron` renders `›`.',
    },
    linkComponent: {
      description:
        'Render linked crumbs with a router-aware component (Next.js `Link`, Remix `Link`) for client-side routing instead of the default `<a>`. Forwarded to the internal `Breadcrumb`. See ADR-012.',
      control: false,
    },
    onNavigate: {
      description:
        'Called with the selected href when a non-current option is chosen. Defaults to a full-page navigation — pass a router-aware handler for client-side routing.',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof BreadcrumbSwitcher>;

const SERVICE_TRAIL = [
  { label: 'Home', href: '#' },
  { label: 'Services', href: '#' },
  { label: 'Brand strategy' },
];

const SIBLING_SERVICES = [
  { label: 'Brand strategy', href: '#brand-strategy', current: true },
  { label: 'Brand identity', href: '#brand-identity' },
  { label: 'Brand guidelines', href: '#brand-guidelines' },
];

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Playground — many options render the caret + menu */
export const Default: Story = {
  args: {
    items: SERVICE_TRAIL,
    options: SIBLING_SERVICES,
    switchLabel: 'Switch service',
    onNavigate: fn(),
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Q3 semantic states
   ═══════════════════════════════════════════════════════════════ */

/** @summary A single option omits the caret — nothing to switch to */
export const SingleOption: Story = {
  args: {
    items: SERVICE_TRAIL,
    options: [{ label: 'Brand strategy', href: '#brand-strategy', current: true }],
    switchLabel: 'Switch service',
  },
};

/**
 * `separator="chevron"` reaches the internal `Breadcrumb`, so a switcher trail
 * can match the chevron breadcrumbs elsewhere on the same page. The visual
 * gate is the only thing that catches a regression here. See #1941.
 * @summary Chevron separator forwarded to the inner Breadcrumb
 */
export const ChevronSeparator: Story = {
  args: {
    items: SERVICE_TRAIL,
    options: SIBLING_SERVICES,
    switchLabel: 'Switch service',
    separator: 'chevron',
    onNavigate: fn(),
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. INTERACTION TESTS — non-visual wiring assertions (rule 3)
   ═══════════════════════════════════════════════════════════════ */

/**
 * The caret trigger opens the menu on click, closes on Escape, and returns
 * focus to the trigger — the keyboard open/close + focus-management contract.
 * @summary Asserts keyboard open/close and focus return
 */
export const InteractionTestKeyboardOpenClose: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: SERVICE_TRAIL,
    options: SIBLING_SERVICES,
    switchLabel: 'Switch service',
    onNavigate: fn(),
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Switch service' });

    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await expect(canvas.getByRole('menu')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/**
 * Selecting a non-current option calls `onNavigate` with its href instead of
 * performing the default full-page navigation.
 * @summary Asserts onNavigate wiring on option select
 */
export const InteractionTestOnNavigate: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: SERVICE_TRAIL,
    options: SIBLING_SERVICES,
    switchLabel: 'Switch service',
    onNavigate: fn(),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Switch service' }));
    await userEvent.click(await canvas.findByRole('menuitem', { name: 'Brand identity' }));
    await expect(args.onNavigate).toHaveBeenCalledWith('#brand-identity', {
      label: 'Brand identity',
      href: '#brand-identity',
    });
  },
};
