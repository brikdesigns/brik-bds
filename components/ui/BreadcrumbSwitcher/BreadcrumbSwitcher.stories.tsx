import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { BreadcrumbSwitcher } from './BreadcrumbSwitcher';

/* ─── Meta ──────────────────────────────────────────────────────
   Deprecated shim over `Breadcrumb` (#2521). Hidden from MCP discovery
   (`!manifest`) and filed under Deprecated/ — new work uses
   `<Breadcrumb options={…} switchLabel={…} onNavigate={…} />`. The one
   interaction test below guards the deprecated public API the portal +
   brikdesigns wrappers still call, until they migrate. */

const meta: Meta<typeof BreadcrumbSwitcher> = {
  title: 'Deprecated/breadcrumb-switcher',
  component: BreadcrumbSwitcher,
  tags: ['surface-shared', '!manifest'],
  parameters: { layout: 'padded' },
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

/**
 * The deprecated `BreadcrumbSwitcher` API still forwards to `Breadcrumb`: the
 * caret opens the sibling menu and selecting an option fires `onNavigate`.
 * @summary Asserts the deprecated shim still drives the switcher
 */
export const InteractionTestShimForwards: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: SERVICE_TRAIL,
    options: SIBLING_SERVICES,
    switchLabel: 'Switch service',
    onNavigate: fn(),
  },
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole('button', { name: 'Switch service' });
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(await canvas.findByRole('menuitem', { name: 'Brand identity' }));
    await expect(args.onNavigate).toHaveBeenCalledWith('#brand-identity', {
      label: 'Brand identity',
      href: '#brand-identity',
    });
  },
};
