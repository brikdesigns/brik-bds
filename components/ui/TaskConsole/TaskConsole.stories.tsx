import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useEffect, useCallback } from 'react';
import { TaskConsole, type TaskConsoleItem } from './TaskConsole';
import { Button } from '../Button';

/**
 * Floating task console — progress checklist for long-running background work.
 * @summary Floating progress console for long-running tasks
 */
const meta: Meta<typeof TaskConsole> = {
  title: 'Containers/task-console',
  component: TaskConsole,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Console header title (e.g. "Generating 14 pages").' },
    subtitle: { control: 'text', description: 'Optional subtitle (e.g. "Less than a minute left").' },
    items: { control: false, description: 'Task items to display, each with `id` / `label` / `status` / optional `detail`.' },
    isOpen: { control: 'boolean', description: 'Whether the console is visible.' },
    position: { control: 'select', options: ['bottom-right', 'bottom-left'], description: 'Screen corner the console anchors to.' },
    defaultCollapsed: { control: 'boolean', description: 'Start collapsed (header only, items hidden).' },
    autoDismissDelay: { control: 'number', description: 'Auto-dismiss delay (ms) after all items complete. `0` = no auto-dismiss.' },
    onDismiss: { control: false, description: 'Called when the close button is clicked.' },
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
];

/* ─── Default — status/items/collapsed are Controls ──────────── */

/** @summary Canonical console — items / position via Controls */
export const Default: Story = {
  args: {
    title: 'Generating 14 pages',
    subtitle: 'Less than a minute left',
    items: contentPages,
    isOpen: true,
    position: 'bottom-right',
    onDismiss: () => {},
  },
};

/* ─── Live simulation — Q4 hook-driven progression ───────────── */

/**
 * Hook-driven run that advances items pending → in-progress → completed on
 * timers. Irreducible: the progression is state args can't express.
 *
 * @summary Live simulated content-generation run
 */
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
