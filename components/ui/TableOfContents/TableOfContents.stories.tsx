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

/** @summary Clicking an item activates it and fires onItemClick */
export const ClickActivates: Story = {
  args: {
    items,
    title: 'On this page',
  },
  play: async ({ canvas, args }) => {
    const link = canvas.getByRole('link', { name: 'The Solution' });
    await userEvent.click(link);
    await expect(args.onItemClick).toHaveBeenCalledWith('the-solution');
    await expect(link).toHaveAttribute('aria-current', 'page');
  },
};

/** @summary Scroll-spy activates the item for the section in view */
export const ScrollSpy: Story = {
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
