import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useEffect, useCallback } from 'react';
import { TaskConsole, type TaskConsoleItem } from './TaskConsole';
import { Button } from '../Button';

const meta: Meta<typeof TaskConsole> = {
  title: 'Components/Feedback/task-console',
  component: TaskConsole,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    position: { control: 'select', options: ['bottom-right', 'bottom-left'] },
    defaultCollapsed: { control: 'boolean' },
    autoDismissDelay: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof TaskConsole>;

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 'var(--padding-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', minHeight: '400px' }}>
    {children}
  </div>
);

/* ─── Static examples ────────────────────────────────────────── */

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

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
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

/** @summary Component state variants */
export const States: Story = {
  name: 'States',
  render: () => (
    <Page>
      <SectionLabel>In progress (content generation)</SectionLabel>
      <TaskConsole
        title="Generating 14 pages"
        subtitle="Less than a minute left"
        items={contentPages}
        position="bottom-right"
        onDismiss={() => {}}
      />
    </Page>
  ),
};

/** @summary All completed */
export const AllCompleted: Story = {
  name: 'All completed',
  render: () => (
    <Page>
      <SectionLabel>All items completed</SectionLabel>
      <TaskConsole
        title="14 pages generated"
        items={contentPages.map((i) => ({ ...i, status: 'completed' as const }))}
        position="bottom-right"
        onDismiss={() => {}}
      />
    </Page>
  ),
};

/** @summary With errors */
export const WithErrors: Story = {
  name: 'With errors',
  render: () => (
    <Page>
      <SectionLabel>Some items failed</SectionLabel>
      <TaskConsole
        title="Generating 14 pages"
        subtitle="2 failed"
        items={contentPages.map((i, idx) => ({
          ...i,
          status: idx < 3 ? 'completed' as const
            : idx === 3 ? 'failed' as const
            : idx === 4 ? 'failed' as const
            : idx === 5 ? 'in_progress' as const
            : 'pending' as const,
          detail: idx === 3 ? 'API rate limit exceeded' : idx === 4 ? 'Notion write failed' : i.detail,
        }))}
        position="bottom-right"
        onDismiss={() => {}}
      />
    </Page>
  ),
};

/** @summary File upload style */
export const FileUploadStyle: Story = {
  name: 'File upload style',
  render: () => (
    <Page>
      <SectionLabel>Google Drive-style upload</SectionLabel>
      <TaskConsole
        title="Uploading 2 items"
        subtitle="Less than a minute left"
        items={fileUploads}
        position="bottom-right"
        onDismiss={() => {}}
      />
    </Page>
  ),
};

/** @summary Collapsed */
export const Collapsed: Story = {
  name: 'Collapsed',
  render: () => (
    <Page>
      <SectionLabel>Starts collapsed</SectionLabel>
      <TaskConsole
        title="Generating 14 pages"
        subtitle="4 of 14 completed"
        items={contentPages}
        defaultCollapsed
        position="bottom-right"
        onDismiss={() => {}}
      />
    </Page>
  ),
};

/* ─── Interactive demo ───────────────────────────────────────── */

/** @summary Live simulation */
export const LiveSimulation: Story = {
  name: 'Live simulation',
  render: () => {
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

    // Simulate progress
    useEffect(() => {
      if (!isOpen || items.length === 0) return;

      const currentIdx = items.findIndex((i) => i.status === 'pending' || i.status === 'in_progress');
      if (currentIdx === -1) return;

      const current = items[currentIdx];

      if (current.status === 'pending') {
        // Start this item
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
        // Complete this item after a delay
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
      <Page>
        <SectionLabel>Click to start a simulated content generation run</SectionLabel>
        <div>
          <Button
            variant="primary"
            size="sm"
            onClick={startSimulation}
            disabled={isOpen && !allDone}
          >
            {allDone ? 'Run again' : isOpen ? 'Running...' : 'Start generation'}
          </Button>
        </div>

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
      </Page>
    );
  },
};
