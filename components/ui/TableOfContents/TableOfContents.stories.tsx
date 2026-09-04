import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { TableOfContents, type TableOfContentsProps, type TocItem } from './TableOfContents';

/* ─── Sample data ─────────────────────────────────────────────── */

const items: TocItem[] = [
  { id: 'the-challenge', label: 'The Challenge' },
  { id: 'the-approach', label: 'The Approach' },
  { id: 'the-solution', label: 'The Solution' },
  { id: 'results', label: 'Results' },
  { id: 'whats-next', label: "What's Next" },
];

/* ─── Story wrapper — TOC beside tall anchored sections ───────── */

function TocDemo(props: TableOfContentsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: 'var(--gap-xl)',
        padding: 'var(--padding-lg)',
        alignItems: 'start',
      }}
    >
      <TableOfContents {...props} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        {props.items.map((item) => (
          <section
            key={item.id}
            id={item.id}
            style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-family-heading)',
                fontSize: 'var(--heading-md)',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {item.label}
            </h2>
            <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-secondary)', margin: 0 }}>
              Scroll to watch the active item track this section.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ─── Rail wrapper — the consumer shape `variant="rail"` targets ───
 * The consumer's own wrapper is the sticky element and carries a card up with
 * the TOC, so the nav takes `sticky={false}`. The tint, radius and outer padding
 * are page chrome and stay here, not in the component. */

function RailTocDemo(props: TableOfContentsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '232px 1fr',
        gap: 'var(--gap-xl)',
        padding: 'var(--padding-lg)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 'var(--gap-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--gap-xl)',
            backgroundColor: 'var(--surface-secondary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: 'var(--padding-md) var(--padding-md) var(--padding-md) 0',
          }}
        >
          <TableOfContents {...props} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        {props.items.map((item) => (
          <section
            key={item.id}
            id={item.id}
            style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-family-heading)',
                fontSize: 'var(--heading-md)',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {item.label}
            </h2>
            <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-secondary)', margin: 0 }}>
              Scroll to watch the active item track this section.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ─── Meta ────────────────────────────────────────────────────── */

const meta = {
  title: 'Navigation/table-of-contents',
  component: TocDemo,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    items: { description: 'Ordered sections; each links to `#{id}`.', control: false },
    activeId: {
      description: 'Controlled active id — disables the internal scroll-spy. Omit for self-managed.',
      control: 'text',
    },
    title: { description: 'Optional header above the list.', control: 'text' },
    ariaLabel: { description: 'Accessible label for the nav landmark.', control: 'text' },
    scrollOffset: { description: 'Px offset for the scroll target (for a sticky page header).', control: 'number' },
    variant: {
      description: '`rail` renders items as text with a hairline rule instead of NavItem’s filled active pill.',
      control: 'inline-radio',
      options: ['default', 'rail'],
    },
    sticky: {
      description: 'Set `false` when the consumer’s own wrapper is the sticky element.',
      control: 'boolean',
    },
    linkComponent: { description: 'Router-aware link component (ADR-012). Rarely needed for anchors.', control: false },
    onItemClick: { description: 'Fired with the section id after a click.', control: false },
  },
  args: { onItemClick: fn() },
} satisfies Meta<typeof TocDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   Default — uncontrolled scroll-spy
   ═══════════════════════════════════════════════════════════════ */

/** @summary Sticky TOC that tracks the section in view */
export const Default: Story = {
  args: {
    items,
    title: 'On this page',
  },
};

/** @summary Controlled — the consumer owns the active section */
export const Controlled: Story = {
  args: {
    items,
    title: 'On this page',
    activeId: 'the-solution',
  },
};

/**
 * Text-only rail: quiet resting label, brand-colored active label, hairline rule
 * down the list's left edge. Switch the toolbar theme to Brik Brand (Dark) to
 * check the same story in dark mode — the light/dark split lives on `<html>`
 * (`:root[data-theme="dark"] .theme-brand-brik`), so one story covers both.
 *
 * @summary Text-only rail inside a consumer-owned sticky box
 */
export const Rail: Story = {
  render: (args) => <RailTocDemo {...args} />,
  args: {
    items,
    title: 'On this page',
    variant: 'rail',
    sticky: false,
  },
};

/** @summary Clicking an item fires onItemClick with its id */
export const InteractionTestClick: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items,
    title: 'On this page',
  },
  play: async ({ canvas, args }) => {
    // Active state after click is governed by the scroll-spy converging on the
    // scrolled-to section (see InteractionTestScrollSpy); the stable behavioral
    // contract of the click itself is that onItemClick fires with the id.
    const link = canvas.getByRole('link', { name: 'The Solution' });
    await userEvent.click(link);
    await expect(args.onItemClick).toHaveBeenCalledWith('the-solution');
  },
};

/** @summary Scroll-spy activates the item for the section in view */
export const InteractionTestScrollSpy: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items,
    title: 'On this page',
  },
  play: async ({ canvas, canvasElement }) => {
    // Bring the "Results" section to the top of the viewport, then wait for the
    // IntersectionObserver to promote its nav item to active.
    canvasElement.ownerDocument.getElementById('results')?.scrollIntoView();
    await waitFor(
      async () => {
        const active = canvas.getByRole('link', { name: 'Results' });
        await expect(active).toHaveAttribute('aria-current', 'page');
      },
      { timeout: 2000 },
    );
  },
};
