import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination';

/**
 * Pagination — page navigation with prev/next, ellipsis, and current-page
 * indicator. Controlled via `currentPage` + `onChange`. Three alignment positions.
 * @summary Page navigation with ellipsis
 */
const meta = {
  title: 'Components/Control/pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  argTypes: {
    position: { control: 'select', options: ['left', 'center', 'right'] },
    currentPage: { control: { type: 'number', min: 1, max: 100 } },
    totalPages: { control: { type: 'number', min: 1, max: 100 } },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Args-driven sandbox — wraps with `useState` so paging is interactive.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    currentPage: 44,
    totalPages: 80,
    position: 'center',
    onChange: () => {},
  },
  render: (args) => {
    const Demo = () => {
      const [page, setPage] = useState(args.currentPage);
      return <Pagination {...args} currentPage={page} onChange={setPage} />;
    };
    return <Demo />;
  },
};

/* ─── Position axis ──────────────────────────────────────────── */

/** Left-aligned position.
 *  @summary Left-aligned pagination */
export const Left: Story = {
  args: { currentPage: 5, totalPages: 20, position: 'left', onChange: () => {} },
};

/** Center-aligned position (default).
 *  @summary Center-aligned pagination */
export const Center: Story = {
  args: { currentPage: 10, totalPages: 20, position: 'center', onChange: () => {} },
};

/** Right-aligned position.
 *  @summary Right-aligned pagination */
export const Right: Story = {
  args: { currentPage: 15, totalPages: 20, position: 'right', onChange: () => {} },
};

/* ─── Page-count states ──────────────────────────────────────── */

/** Few pages — no ellipsis needed.
 *  @summary Pagination with no ellipsis */
export const FewPages: Story = {
  args: { currentPage: 3, totalPages: 5, position: 'center', onChange: () => {} },
};

/** Single page — confirms the disabled-prev/next state.
 *  @summary Single-page pagination */
export const SinglePage: Story = {
  args: { currentPage: 1, totalPages: 1, position: 'center', onChange: () => {} },
};
