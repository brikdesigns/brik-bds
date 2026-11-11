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
    pageSize: {
      control: { type: 'number', min: 1 },
      description: 'Rows per page. With `totalItems`, renders a "Showing X–Y of N" count.',
    },
    totalItems: {
      control: { type: 'number', min: 0 },
      description: 'Total rows across all pages.',
    },
    pageSizeOptions: {
      control: 'object',
      description: 'Row-count choices for the selector. Default `[25, 50, 100]`.',
    },
    onPageSizeChange: {
      control: false,
      description: 'Renders the rows-per-page selector when provided. Consumer resets `currentPage` to 1.',
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


/** @summary Rows-per-page selector with result count — the table footer */
export const WithPageSize: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const totalItems = args.totalItems ?? 0;
    return (
      <Pagination
        {...args}
        currentPage={page}
        pageSize={pageSize}
        totalPages={Math.max(1, Math.ceil(totalItems / pageSize))}
        onChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    );
  },
  args: { totalItems: 240, position: 'right', currentPage: 1, totalPages: 10, onChange: () => {} },
};
