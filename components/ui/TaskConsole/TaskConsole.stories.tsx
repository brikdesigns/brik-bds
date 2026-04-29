import { useState, useEffect, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TaskConsole, type TaskConsoleItem } from './TaskConsole';
import { Button } from '../Button';

/**
 * TaskConsole — bottom-anchored progress overlay for long-running task batches.
 * Shows per-item status (pending / in_progress / completed / failed) with an
 * optional collapse and auto-dismiss.
 * @summary Bottom-anchored task progress overlay
 */
const meta: Meta<typeof TaskConsole> = {
  title: 'Components/Feedback/task-console',
  component: TaskConsole,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--padding-xl)', minHeight: '400px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    position: { control: 'select', options: ['bottom-right', 'bottom-left'] },
    defaultCollapsed: { control: 'boolean' },
    autoDismissDelay: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof TaskConsole>;

/* ─── Sample data ────────────────────────────────────────────── */

const contentPages: TaskConsoleItem[] = [
  { id: '1', label: 'About', status: 'completed' },
  { id: '2', label: 'Healthcare Real Estate', status: 'completed' },
  { id: '3', label: 'Commercial Real Estate', status: 'completed' },
  { id: '4', label: 'Land Development', status: 'in_progress', detail: 'Generating 5 sections...' },
  { id: '5', label: 'Team', status: 'pending' },
  { id: '6', label: 'Contact', status: 'pending' },
  { id: '7', label: 'Dental Practice Real Estate', status: 'pending' },
  { id: '8', label: 'Veterinary Practice Real Estate', status: 'pending' },
  { id: '9', label: 'Optometry Practice Real Estate', status: 'pending' },
  { id: '10', label: 'Office Leasing', status: 'pending' },
  { id: '11', label: 'Retail Properties', status: 'pending' },
  { id: '12', label: 'Investment Properties', status: 'pending' },
  { id: '13', label: 'Development Services', status: 'pending' },
  { id: '14', label: 'Land Sales', status: 'pending' },
];

const fileUploads: TaskConsoleItem[] = [
  { id: 'a', label: 'British Food.pdf', status: 'in_progress' },
  { id: 'b', label: '1st Cond - Guess my sentence.doc', status: 'completed' },
];

/* ─── Sandbox ────────────────────────────────────────────────── */

/** Args-driven sandbox. Use Controls to flip position, collapsed, autoDismissDelay.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    title: 'Generating 14 pages',
    subtitle: 'Less than a minute left',
    items: contentPages,
    isOpen: true,
    position: 'bottom-right',
    onDismiss: () => {},
  },
};

/* ─── States ─────────────────────────────────────────────────── */

/** In-progress run — mix of completed, in_progress, and pending items.
 *  @summary Mid-batch in-progress state */
export const InProgress: Story = {
  args: {
    title: 'Generating 14 pages',
    subtitle: 'Less than a minute left',
    items: contentPages,
    position: 'bottom-right',
    onDismiss: () => {},
  },
};

/** Terminal success — every item completed. The auto-dismiss timer typically
 *  fires from this state.
 *  @summary All items completed */
export const AllCompleted: Story = {
  args: {
    title: '14 pages generated',
    items: contentPages.map((i) => ({ ...i, status: 'completed' as const })),
    position: 'bottom-right',
    onDismiss: () => {},
  },
};

/** Mixed terminal state — some items completed, some failed with detail messages.
 *  @summary Run with failed items and error detail */
export const WithErrors: Story = {
  args: {
    title: 'Generating 14 pages',
    subtitle: '2 failed',
    items: contentPages.map((i, idx) => ({
      ...i,
      status:
        idx < 3 ? ('completed' as const)
        : idx === 3 ? ('failed' as const)
        : idx === 4 ? ('failed' as const)
        : idx === 5 ? ('in_progress' as const)
        : ('pending' as const),
      detail:
        idx === 3 ? 'API rate limit exceeded'
        : idx === 4 ? 'Notion write failed'
        : i.detail,
    })),
    position: 'bottom-right',
    onDismiss: () => {},
  },
};

/** Smaller batch with file labels — Google Drive-style upload progress.
 *  @summary File upload progress */
export const FileUploadStyle: Story = {
  args: {
    title: 'Uploading 2 items',
    subtitle: 'Less than a minute left',
    items: fileUploads,
    position: 'bottom-right',
    onDismiss: () => {},
  },
};

/** Starts collapsed — useful when the console would otherwise dominate the viewport.
 *  @summary Collapsed default state */
export const Collapsed: Story = {
  args: {
    title: 'Generating 14 pages',
    subtitle: '4 of 14 completed',
    items: contentPages,
    defaultCollapsed: true,
    position: 'bottom-right',
    onDismiss: () => {},
  },
};

/* ─── Interactive ────────────────────────────────────────────── */

/** Live simulation — uses `useState` + `useEffect` to drive a fake batch run
 *  end-to-end, so `render` is required.
 *  @summary Simulated batch run with timed transitions */
export const LiveSimulation: Story = {
  render: () => {
    const Simulator = () => {
      const pages = [
        'About', 'Healthcare RE', 'Commercial RE', 'Land Development',
        'Team', 'Contact', 'Dental Practice', 'Veterinary Practice',
      ];

      const [isOpen, setIsOpen] = useState(false);
      const [items, setItems] = useState<TaskConsoleItem[]>([]);

      const startSimulation = useCallback(() => {
        setIsOpen(true);
        setItems(pages.map((name, idx) => ({
          id: String(idx),
          label: name,
          status: 'pending',
        })));
      }, []);

      useEffect(() => {
        if (!isOpen || items.length === 0) return;
        const currentIdx = items.findIndex((i) => i.status === 'pending' || i.status === 'in_progress');
        if (currentIdx === -1) return;
        const current = items[currentIdx];

        if (current.status === 'pending') {
          const timer = setTimeout(() => {
            setItems((prev) => prev.map((item, idx) =>
              idx === currentIdx
                ? { ...item, status: 'in_progress', detail: `Generating ${3 + Math.floor(Math.random() * 4)} sections...` }
                : item,
            ));
          }, 300);
          return () => clearTimeout(timer);
        }

        if (current.status === 'in_progress') {
          const timer = setTimeout(() => {
            setItems((prev) => prev.map((item, idx) =>
              idx === currentIdx ? { ...item, status: 'completed', detail: undefined } : item,
            ));
          }, 800 + Math.random() * 1200);
          return () => clearTimeout(timer);
        }
      }, [isOpen, items]);

      const completedCount = items.filter((i) => i.status === 'completed').length;
      const allDone = items.length > 0 && completedCount === items.length;

      return (
        <>
          <Button
            variant="primary"
            size="sm"
            onClick={startSimulation}
            disabled={isOpen && !allDone}
          >
            {allDone ? 'Run again' : isOpen ? 'Running...' : 'Start generation'}
          </Button>
          {isOpen && (
            <TaskConsole
              title={allDone ? `${pages.length} pages generated` : `Generating ${pages.length} pages`}
              subtitle={allDone ? undefined : `${completedCount} of ${pages.length} completed`}
              items={items}
              position="bottom-right"
              onDismiss={() => setIsOpen(false)}
              autoDismissDelay={allDone ? 5000 : 0}
            />
          )}
        </>
      );
    };
    return <Simulator />;
  },
};
