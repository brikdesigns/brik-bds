import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Board } from './Board';
import { BoardColumn } from './BoardColumn';
import { BoardHeader } from './BoardHeader';
import { BoardCard } from './BoardCard';
import { Tag } from '../Tag';
import { Badge } from '../Badge';

const meta: Meta<typeof Board> = {
  title: 'Containers/board',
  component: Board,
  tags: ['surface-product'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Board>;

// ─── Header-only stories ─────────────────────────────────────────────────────

const MOCK_HEADERS = [
  {
    title: 'Opening',
    items: [
      { name: 'Cassidy Moore', subtitle: 'Dental Hygienist', progress: 37 },
      { name: 'Alex Rivera', subtitle: 'Receptionist', progress: 62 },
    ],
  },
  {
    title: 'Clinical',
    items: [
      { name: 'Jordan Lee', subtitle: 'Dental Assistant', progress: 85 },
      { name: 'Morgan Chen', subtitle: 'Office Manager', progress: 20 },
      { name: 'Taylor Brooks', subtitle: 'Dental Hygienist', progress: 50 },
    ],
  },
  {
    title: 'Front Desk',
    items: [
      { name: 'Riley Kim', subtitle: 'Receptionist', progress: 100 },
    ],
  },
  {
    title: 'Closing',
    items: [
      { name: 'Sam Nguyen', subtitle: 'Dental Assistant', progress: 10 },
      { name: 'Jamie Patel', subtitle: 'Sterilization Tech', progress: 45 },
    ],
  },
];

/**
 * Default — four columns of BoardHeader entries (name + subtitle + progress).
 * Composition of Board > BoardColumn > BoardHeader, args can't express the
 * nested-children shape so this is the canonical render-mode sandbox.
 *
 * @summary Multi-column board of headers
 */
export const Default: Story = {
  render: () => (
    <Board style={{ height: '500px' }}>
      {MOCK_HEADERS.map((col) => (
        <BoardColumn key={col.title} title={col.title} count={col.items.length}>
          {col.items.map((item) => (
            <BoardHeader
              key={item.name}
              name={item.name}
              subtitle={item.subtitle}
              progress={item.progress}
            />
          ))}
        </BoardColumn>
      ))}
    </Board>
  ),
};

/**
 * A column with no children renders its header row only — no placeholder or
 * empty-state message inside the item area. Verifies columns with zero and
 * nonzero counts sit correctly side by side.
 *
 * @summary Board with an empty column alongside a populated one
 */
export const WithEmptyColumn: Story = {
  render: () => (
    <Board style={{ height: '300px' }}>
      <BoardColumn title="Backlog" count={0}>
        {null}
      </BoardColumn>
      <BoardColumn title="In Progress" count={1}>
        <BoardHeader name="Sam Nguyen" subtitle="Dental Assistant" progress={10} />
      </BoardColumn>
    </Board>
  ),
};

// ─── Card stories ────────────────────────────────────────────────────────────

function InteractiveCards() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Check and refill hand sanitizer stations', due: 'Due today', checked: false },
    { id: 2, title: 'Clean countertops and surfaces', due: 'Due today', checked: false },
    { id: 3, title: 'Empty trash bins and replace liners', due: 'Due today', checked: true },
  ]);

  const toggle = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)));

  return (
    <Board style={{ height: '600px' }}>
      <BoardColumn title="Maintenance" count={tasks.length}>
        <BoardHeader
          name="Rebecca"
          subtitle="Maintenance"
          avatarSrc="https://i.pravatar.cc/96?u=rebecca"
          progress={33}
        />
        {tasks.map((task) => (
          <BoardCard
            key={task.id}
            title={task.title}
            subtitle={task.due}
            checked={task.checked}
            onCheckedChange={() => toggle(task.id)}
            tags={
              <>
                <Tag size="sm">Engineering</Tag>
                <Tag size="sm">Daily</Tag>
              </>
            }
            trailingTag={<Badge status="error" size="sm">Critical</Badge>}
          />
        ))}
      </BoardColumn>
    </Board>
  );
}

/**
 * Controlled checkbox state on BoardCard — a hook-driven interaction args
 * can't express. Toggling a task's completion updates its checked state
 * and CompletionToggle visual without a page reload.
 *
 * @summary Board column with controlled task-card checkboxes
 */
export const WithTaskCards: Story = {
  render: () => <InteractiveCards />,
};

/**
 * `density="compact"` drops the title one type step and renders the
 * subtitle as label-family metadata — for dense, multi-card-per-column
 * boards. Shown side by side with default density since the comparison
 * is the entire point and there's no other surface (no Board-level
 * Control) to see the two together.
 *
 * @summary Default vs compact BoardCard density, side by side
 */
export const Density: Story = {
  render: () => (
    <Board style={{ height: '440px' }}>
      <BoardColumn title="Default density" count={2}>
        <BoardCard
          title="Check and refill hand sanitizer stations"
          subtitle="Due today"
          accentColor="var(--background-accent-blue)"
          checked={false}
          onCheckedChange={() => {}}
          tags={<Tag size="sm">Engineering</Tag>}
          trailingTag={<Badge status="error" size="sm">Critical</Badge>}
        />
        <BoardCard
          title="Clean countertops and surfaces"
          subtitle="Due today"
          accentColor="var(--background-accent-blue)"
          tags={<Tag size="sm">Cleaning</Tag>}
        />
      </BoardColumn>
      <BoardColumn title="Compact density" count={2}>
        <BoardCard
          density="compact"
          checkAccent="brand"
          title="Check and refill hand sanitizer stations"
          subtitle="Due today"
          accentColor="var(--background-accent-blue)"
          checked={false}
          onCheckedChange={() => {}}
          tags={<Tag size="sm">Engineering</Tag>}
          trailingTag={<Badge status="error" size="sm">Critical</Badge>}
        />
        <BoardCard
          density="compact"
          checkAccent="brand"
          title="Clean countertops and surfaces"
          subtitle="Due today"
          accentColor="var(--background-accent-blue)"
          tags={<Tag size="sm">Cleaning</Tag>}
        />
      </BoardColumn>
    </Board>
  ),
  // Computed-style regression guard for the density typography contract —
  // #412. Chromatic snapshot deferred (quota #771).
  play: async ({ canvasElement }) => {
    const defaultTitle = canvasElement.querySelector(
      '.bds-board-card:not(.bds-board-card--compact) .bds-board-card__title',
    ) as HTMLElement;
    const compactTitle = canvasElement.querySelector(
      '.bds-board-card--compact .bds-board-card__title',
    ) as HTMLElement;
    const compactSubtitle = canvasElement.querySelector(
      '.bds-board-card--compact .bds-board-card__subtitle',
    ) as HTMLElement;

    await expect(getComputedStyle(defaultTitle).fontSize).toBe('18px'); // --label-lg
    await expect(getComputedStyle(compactTitle).fontSize).toBe('16px'); // --label-md
    // Compact subtitle reads as label-family metadata (capitalize).
    await expect(getComputedStyle(compactSubtitle).textTransform).toBe('capitalize');
  },
};

// ─── Full board view (token-driven — responds to Storybook theme) ────────────

/**
 * Complete board view using only BDS tokens — headers, cards, controlled
 * checkbox state, and a per-column progress calculation together. Switch
 * themes in the Storybook toolbar to see the board adapt. Product-level
 * color overrides (per-user column colors) belong in the consuming app
 * (e.g. Renew PMS), not here.
 */

function FullBoardViewExample() {
  const [tasks, setTasks] = useState({
    rebecca: [
      { id: 'r1', title: 'Check and refill hand sanitizer stations', due: 'Due today', checked: true },
      { id: 'r2', title: 'Clean countertops and surfaces', due: 'Due today', checked: false },
      { id: 'r3', title: 'Empty trash bins and replace liners', due: 'Due today', checked: false },
    ],
    john: [
      { id: 'j1', title: 'Check and refill hand sanitizer stations', due: 'Due today', checked: true },
      { id: 'j2', title: 'Clean countertops and surfaces', due: 'Due today', checked: true },
      { id: 'j3', title: 'Empty trash bins and replace liners', due: 'Due today', checked: false },
      { id: 'j4', title: 'Restock cleaning supplies', due: 'Due tomorrow', checked: false },
    ],
    sarah: [
      { id: 's1', title: 'Sterilize instruments', due: 'Due 9:00 AM', checked: true },
      { id: 's2', title: 'Patient room prep', due: 'Due 10:00 AM', checked: false },
      { id: 's3', title: 'Update patient charts', due: 'Due 2:00 PM', checked: false },
    ],
    alex: [
      { id: 'a1', title: 'Restock PPE supplies', due: 'Due 8:00 AM', checked: false },
      { id: 'a2', title: 'Check autoclave logs', due: 'Due 11:00 AM', checked: false },
      { id: 'a3', title: 'Equipment maintenance check', due: 'Due 4:00 PM', checked: false },
    ],
  });

  const toggle = (column: keyof typeof tasks, id: string) =>
    setTasks((prev) => ({
      ...prev,
      [column]: prev[column].map((t) =>
        t.id === id ? { ...t, checked: !t.checked } : t
      ),
    }));

  const completionPct = (column: keyof typeof tasks) => {
    const items = tasks[column];
    return Math.round((items.filter((t) => t.checked).length / items.length) * 100);
  };

  const columnStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-secondary)',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
  };

  const renderCards = (column: keyof typeof tasks) =>
    tasks[column].map((task) => (
      <BoardCard
        key={task.id}
        title={task.title}
        subtitle={task.due}
        accentColor="var(--background-brand-primary)"
        checked={task.checked}
        onCheckedChange={() => toggle(column, task.id)}
        tags={
          <>
            <Tag size="sm">Engineering</Tag>
            <Tag size="sm">Daily</Tag>
          </>
        }
        trailingTag={<Badge status="error" size="sm">Critical</Badge>}
      />
    ));

  return (
    <div style={{
      background: 'var(--page-primary)',
      padding: 'var(--padding-xl)',
      borderRadius: 'var(--border-radius-200)',
    }}>
      <Board style={{ height: '800px' }}>
        <BoardColumn style={columnStyle}>
          <BoardHeader
            name="Rebecca"
            subtitle="Maintenance"
            avatarSrc="https://i.pravatar.cc/96?u=rebecca"
            progress={completionPct('rebecca')}
            style={headerStyle}
          />
          {renderCards('rebecca')}
        </BoardColumn>

        <BoardColumn style={columnStyle}>
          <BoardHeader
            name="John"
            subtitle="Maintenance"
            avatarSrc="https://i.pravatar.cc/96?u=john"
            progress={completionPct('john')}
            style={headerStyle}
          />
          {renderCards('john')}
        </BoardColumn>

        <BoardColumn style={columnStyle}>
          <BoardHeader
            name="Sarah"
            subtitle="Clinician"
            avatarSrc="https://i.pravatar.cc/96?u=sarah"
            progress={completionPct('sarah')}
            style={headerStyle}
          />
          {renderCards('sarah')}
        </BoardColumn>

        <BoardColumn style={columnStyle}>
          <BoardHeader
            name="Alex"
            subtitle="Front Desk"
            avatarSrc="https://i.pravatar.cc/96?u=alex"
            progress={completionPct('alex')}
            style={headerStyle}
          />
          {renderCards('alex')}
        </BoardColumn>
      </Board>
    </div>
  );
}

/**
 * Multi-column state machine — 4 columns, each with header + cards, checkbox
 * toggling recomputes that column's progress bar live. The composition and
 * hook-driven state genuinely can't be expressed as args.
 *
 * @summary Full interactive board — headers, cards, and progress
 */
export const WithFullBoard: Story = {
  name: 'Full Board View',
  render: () => <FullBoardViewExample />,
};
