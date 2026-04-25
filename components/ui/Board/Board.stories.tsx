import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Board } from './Board';
import { BoardColumn } from './BoardColumn';
import { BoardHeader } from './BoardHeader';
import { BoardCard } from './BoardCard';
import { Tag } from '../Tag';
import { Badge } from '../Badge';

const meta: Meta<typeof Board> = {
  title: 'Displays/Board/board',
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

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
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

/** @summary Single column */
export const SingleColumn: Story = {
  render: () => (
    <Board style={{ height: '400px', maxWidth: '400px' }}>
      <BoardColumn title="In Progress" count={2}>
        <BoardHeader name="Cassidy Moore" subtitle="Dental Hygienist" progress={37} />
        <BoardHeader name="Alex Rivera" subtitle="Receptionist" progress={85} />
      </BoardColumn>
    </Board>
  ),
};

/** @summary With avatars */
export const WithAvatars: Story = {
  render: () => (
    <Board style={{ height: '400px' }}>
      <BoardColumn title="Team" count={3}>
        <BoardHeader
          name="Cassidy Moore"
          subtitle="Dental Hygienist"
          avatarSrc="https://i.pravatar.cc/96?u=cassidy"
          progress={37}
        />
        <BoardHeader
          name="Jordan Lee"
          subtitle="Dental Assistant"
          avatarSrc="https://i.pravatar.cc/96?u=jordan"
          progress={85}
        />
        <BoardHeader
          name="Riley Kim"
          subtitle="Receptionist"
          avatarSrc="https://i.pravatar.cc/96?u=riley"
          progress={100}
        />
      </BoardColumn>
    </Board>
  ),
};

/** @summary Empty column */
export const EmptyColumn: Story = {
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

/** @summary Task cards */
export const TaskCards: Story = {
  render: () => <InteractiveCards />,
};

/** @summary Card accent colors */
export const CardAccentColors: Story = {
  name: 'Card — Accent Colors',
  render: () => (
    <Board style={{ height: '400px' }}>
      <BoardColumn title="By Department">
        <BoardCard
          title="Sterilize instruments"
          subtitle="Due 9:00 AM"
          accentColor="var(--background-accent-blue)"
          tags={<Tag size="sm">Clinical</Tag>}
          trailingTag={<Badge status="warning" size="sm">Medium</Badge>}
        />
        <BoardCard
          title="Restock PPE supplies"
          subtitle="Due 10:00 AM"
          accentColor="var(--background-accent-red)"
          tags={<Tag size="sm">Front Desk</Tag>}
          trailingTag={<Badge status="error" size="sm">High</Badge>}
        />
        <BoardCard
          title="Update patient records"
          subtitle="Due 2:00 PM"
          accentColor="var(--background-accent-purple)"
          tags={<Tag size="sm">Admin</Tag>}
          trailingTag={<Badge status="info" size="sm">Low</Badge>}
        />
        <BoardCard
          title="Equipment maintenance check"
          subtitle="Due 4:00 PM"
          accentColor="var(--background-accent-green)"
          tags={<Tag size="sm">Engineering</Tag>}
          trailingTag={<Badge status="positive" size="sm">Done</Badge>}
          checked
        />
      </BoardColumn>
    </Board>
  ),
};

// ─── Full board (headers + cards) ────────────────────────────────────────────

/** @summary Full board */
export const FullBoard: Story = {
  name: 'Full Board — Headers + Cards',
  render: () => (
    <Board style={{ height: '700px' }}>
      <BoardColumn>
        <BoardHeader
          name="Rebecca"
          subtitle="Maintenance"
          avatarSrc="https://i.pravatar.cc/96?u=rebecca"
          progress={37}
        />
        <BoardCard
          title="Check hand sanitizer stations"
          subtitle="Due today"
          accentColor="var(--background-brand-primary)"
          tags={<><Tag size="sm">Engineering</Tag><Tag size="sm">Daily</Tag></>}
          trailingTag={<Badge status="error" size="sm">Critical</Badge>}
        />
        <BoardCard
          title="Clean countertops"
          subtitle="Due today"
          accentColor="var(--background-brand-primary)"
          tags={<><Tag size="sm">Engineering</Tag><Tag size="sm">Daily</Tag></>}
          trailingTag={<Badge status="error" size="sm">Critical</Badge>}
        />
      </BoardColumn>
      <BoardColumn>
        <BoardHeader
          name="John"
          subtitle="Maintenance"
          avatarSrc="https://i.pravatar.cc/96?u=john"
          progress={20}
        />
        <BoardCard
          title="Empty trash bins and replace liners"
          subtitle="Due today"
          accentColor="var(--background-accent-red)"
          tags={<><Tag size="sm">Cleaning</Tag><Tag size="sm">Daily</Tag></>}
          trailingTag={<Badge status="warning" size="sm">Medium</Badge>}
        />
      </BoardColumn>
      <BoardColumn>
        <BoardHeader
          name="Sarah"
          subtitle="Clinician"
          avatarSrc="https://i.pravatar.cc/96?u=sarah"
          progress={85}
        />
        <BoardCard
          title="Sterilize instruments"
          subtitle="Due 9:00 AM"
          accentColor="var(--background-accent-purple)"
          checked
          tags={<Tag size="sm">Clinical</Tag>}
          trailingTag={<Badge status="positive" size="sm">Done</Badge>}
        />
        <BoardCard
          title="Patient room prep"
          subtitle="Due 10:00 AM"
          accentColor="var(--background-accent-purple)"
          tags={<Tag size="sm">Clinical</Tag>}
        />
      </BoardColumn>
    </Board>
  ),
};

// ─── Full board view (token-driven — responds to Storybook theme) ────────────

/**
 * Complete board view using only BDS tokens. Switch themes in the
 * Storybook toolbar to see the board adapt. Product-level color
 * overrides (per-user column colors) belong in the consuming app
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

/** @summary Full board view */
export const FullBoardView: Story = {
  name: 'Full Board View',
  render: () => <FullBoardViewExample />,
};
