import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta = {
  title: 'Components/pagination',
  component: Pagination,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Alignment of pagination controls',
    },
    currentPage: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Current active page',
    },
    totalPages: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Total number of pages',
    },
    siblingCount: {
      control: { type: 'number', min: 0, max: 3 },
      description: 'Number of sibling pages to show around current',
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default centered pagination with many pages
 */
export const Default: Story = {
  render: (args) => {
    const [page, setPage] = useState(args.currentPage);

    return (
      <Pagination
        {...args}
        currentPage={page}
        onChange={setPage}
      />
    );
  },
  args: {
    currentPage: 44,
    totalPages: 80,
    position: 'center',
    onChange: () => {},
  },
};

/**
 * Left-aligned pagination
 */
export const LeftAligned: Story = {
  render: (args) => {
    const [page, setPage] = useState(args.currentPage);

    return (
      <Pagination
        {...args}
        currentPage={page}
        onChange={setPage}
      />
    );
  },
  args: {
    currentPage: 1,
    totalPages: 20,
    position: 'left',
    onChange: () => {},
  },
};

/**
 * Right-aligned pagination
 */
export const RightAligned: Story = {
  render: (args) => {
    const [page, setPage] = useState(args.currentPage);

    return (
      <Pagination
        {...args}
        currentPage={page}
        onChange={setPage}
      />
    );
  },
  args: {
    currentPage: 20,
    totalPages: 20,
    position: 'right',
    onChange: () => {},
  },
};

/**
 * Small page count (no ellipsis needed)
 */
export const FewPages: Story = {
  render: (args) => {
    const [page, setPage] = useState(args.currentPage);

    return (
      <Pagination
        {...args}
        currentPage={page}
        onChange={setPage}
      />
    );
  },
  args: {
    currentPage: 3,
    totalPages: 5,
    position: 'center',
    onChange: () => {},
  },
};

/**
 * All three position variants side by side
 */
export const AllPositions: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Pagination position="left" currentPage={5} totalPages={20} onChange={setPage} />
<Pagination position="center" currentPage={5} totalPages={20} onChange={setPage} />
<Pagination position="right" currentPage={5} totalPages={20} onChange={setPage} />`,
      },
    },
  },
  render: () => {
    const [page1, setPage1] = useState(5);
    const [page2, setPage2] = useState(10);
    const [page3, setPage3] = useState(15);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---xl)' }}>
        <div>
          <p style={{
            fontFamily: 'var(--_typography---font-family--label)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--muted)',
            margin: '0 0 var(--_space---gap--md) 0',
          }}>
            position=&quot;left&quot;
          </p>
          <Pagination currentPage={page1} totalPages={20} position="left" onChange={setPage1} />
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--_typography---font-family--label)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--muted)',
            margin: '0 0 var(--_space---gap--md) 0',
          }}>
            position=&quot;center&quot;
          </p>
          <Pagination currentPage={page2} totalPages={20} position="center" onChange={setPage2} />
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--_typography---font-family--label)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--muted)',
            margin: '0 0 var(--_space---gap--md) 0',
          }}>
            position=&quot;right&quot;
          </p>
          <Pagination currentPage={page3} totalPages={20} position="right" onChange={setPage3} />
        </div>
      </div>
    );
  },
  args: {
    currentPage: 5,
    totalPages: 20,
    onChange: () => {},
  },
};

/**
 * Single page (arrows disabled)
 */
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    position: 'center',
    onChange: () => {},
  },
};
