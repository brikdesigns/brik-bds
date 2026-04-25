import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta = {
  title: 'Components/Control/pagination',
  component: Pagination,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'center', 'right'],
    },
    currentPage: {
      control: { type: 'number', min: 1, max: 100 },
    },
    totalPages: {
      control: { type: 'number', min: 1, max: 100 },
    },
    siblingCount: {
      control: { type: 'number', min: 0, max: 3 },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
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
   2. VARIANTS — Positions, few pages, single page
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  args: { currentPage: 5, totalPages: 20, onChange: () => {} },
  render: () => {
    function PaginationVariants() {
      const [left, setLeft] = useState(5);
      const [center, setCenter] = useState(10);
      const [right, setRight] = useState(15);
      const [few, setFew] = useState(3);

      return (
        <Stack>
          <div>
            <SectionLabel>Left aligned</SectionLabel>
            <Pagination currentPage={left} totalPages={20} position="left" onChange={setLeft} />
          </div>
          <div>
            <SectionLabel>Center aligned</SectionLabel>
            <Pagination currentPage={center} totalPages={20} position="center" onChange={setCenter} />
          </div>
          <div>
            <SectionLabel>Right aligned</SectionLabel>
            <Pagination currentPage={right} totalPages={20} position="right" onChange={setRight} />
          </div>
          <div>
            <SectionLabel>Few pages (no ellipsis)</SectionLabel>
            <Pagination currentPage={few} totalPages={5} position="center" onChange={setFew} />
          </div>
          <div>
            <SectionLabel>Single page</SectionLabel>
            <Pagination currentPage={1} totalPages={1} position="center" onChange={() => {}} />
          </div>
        </Stack>
      );
    }
    return <PaginationVariants />;
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Table pagination
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  args: { currentPage: 1, totalPages: 12, onChange: () => {} },
  render: () => {
    function TablePagination() {
      const [page, setPage] = useState(1);
      const totalPages = 12;
      const perPage = 10;

      return (
        <div>
          <SectionLabel>Table pagination</SectionLabel>
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
