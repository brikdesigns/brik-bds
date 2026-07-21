import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination';

/* ─── Meta ────────────────────────────────────────────── */

const meta = {
  title: 'Components/pagination',
  component: Pagination,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Current active page (1-indexed).',
    },
    totalPages: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Total number of pages. Fewer than `siblingCount * 2 + 5` renders with no ellipsis.',
    },
    position: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Alignment of the pagination controls.',
    },
    onChange: {
      control: false,
      description: 'Callback fired with the new page number when a page or arrow control is clicked.',
    },
    siblingCount: {
      control: { type: 'number', min: 0, max: 3 },
      description: 'Number of sibling pages to show around the current page.',
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. `render` wraps the controlled
   `currentPage`/`onChange` pair in local state (Q4 — Controls alone
   can't drive click-through paging), so clicking pages/arrows works.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  render: (args) => {
    const [page, setPage] = useState(args.currentPage);
    return <Pagination {...args} currentPage={page} onChange={setPage} />;
  },
  args: {
    currentPage: 44,
    totalPages: 80,
    position: 'center',
    onChange: () => {},
  },
};

/* ═══════════════════════════════════════════════════════════════
   WITH RESULT COUNT — Q4 irreducible: the "Showing X–Y of Z"
   label is derived from controlled page state that args can't express
   ═══════════════════════════════════════════════════════════════ */

/** @summary Paired with a derived "Showing X–Y of Z results" label */
export const WithResultCount: Story = {
  args: { currentPage: 1, totalPages: 12, onChange: () => {} },
  render: () => {
    function TablePagination() {
      const [page, setPage] = useState(1);
      const totalPages = 12;
      const perPage = 10;

      return (
        <div>
          <div style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-sm)',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: 'var(--gap-md)',
          }}>
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, 120)} of 120 results
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} position="center" />
        </div>
      );
    }
    return <TablePagination />;
  },
};
