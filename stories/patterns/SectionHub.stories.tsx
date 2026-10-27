import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { SubNavigation, type SubNavItem } from '../../components/ui/SubNavigation/SubNavigation';
import { Page, PageContent } from '../../components/ui/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { TabBar } from '../../components/ui/TabBar';
import { FilterBar } from '../../components/ui/FilterBar';
import { FilterButton } from '../../components/ui/FilterButton';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';

/* ─── Sample data ─────────────────────────────────────────────── */

type Status = 'planned' | 'in-progress' | 'done';

type Project = {
  id: string;
  name: string;
  line: string;
  status: Status;
};

const projects: Project[] = [
  { id: '1', name: 'Website redesign', line: 'web', status: 'in-progress' },
  { id: '2', name: 'Brand refresh', line: 'brand', status: 'planned' },
  { id: '3', name: 'Quarterly campaign', line: 'marketing', status: 'in-progress' },
  { id: '4', name: 'Logo suite', line: 'brand', status: 'done' },
  { id: '5', name: 'Landing page', line: 'web', status: 'done' },
  { id: '6', name: 'Email nurture', line: 'marketing', status: 'planned' },
  { id: '7', name: 'Style guide', line: 'brand', status: 'in-progress' },
];

const statusTabs: { id: Status | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'planned', label: 'Planned' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
];

const statusLabel: Record<Status, string> = {
  planned: 'Planned',
  'in-progress': 'In progress',
  done: 'Done',
};

const statusTone: Record<Status, BadgeTone> = {
  planned: 'neutral',
  'in-progress': 'info',
  done: 'positive',
};

const lineOptions = [
  { id: 'web', label: 'Web' },
  { id: 'brand', label: 'Brand' },
  { id: 'marketing', label: 'Marketing' },
];

/** The rail: the entity that partitions rows. Each item is its own route. */
const railItems: SubNavItem[] = [
  { label: 'Projects', href: '#projects', icon: <Icon icon="ph:folder" />, active: true },
  { label: 'Backlog', href: '#backlog', icon: <Icon icon="ph:list-checks" /> },
  { label: 'Releases', href: '#releases', icon: <Icon icon="ph:package" /> },
];

/* ─── Meta ────────────────────────────────────────────────────── */

/**
 * The Section hub archetype — the level-1 landing page of a product section.
 * See the build standard: Page Archetypes → Section hub.
 */
const meta: Meta = {
  title: 'Layouts/section-hub',
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

/* ─── Default ─────────────────────────────────────────────────── */

/**
 * Every chrome layer on one page, each carrying exactly one kind of thing:
 * the `SubNavigation` rail switches the entity (Projects / Backlog /
 * Releases), the `PageHeader` `TabBar` switches lifecycle status, and the
 * `FilterBar` narrows by an attribute (service line). Status tabs and the
 * filter compose: pick `In progress`, then `Brand`, and both apply. The body
 * is the Collection archetype.
 *
 * The rail is a full-height sibling of `Page`, never inside `PageContent`.
 *
 * @summary Rail = entity, header tabs = status, filter bar = attributes
 */
export const Default: Story = {
  render: () => {
    const [status, setStatus] = useState<Status | 'all'>('all');
    const [line, setLine] = useState<string | undefined>(undefined);

    const byStatus = useMemo(
      () => projects.filter((p) => status === 'all' || p.status === status),
      [status],
    );
    const visible = useMemo(
      () => byStatus.filter((p) => !line || p.line === line),
      [byStatus, line],
    );

    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <SubNavigation items={railItems} />
        {/* <main> is the flex-COLUMN parent Page needs so its fill-height body works. */}
        <main style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--bds-padding-xl)',
          backgroundColor: 'var(--bds-page-primary)',
        }}>
          <Page padding="none">
            <PageHeader
              title="Projects"
              subtitle="Every project across all service lines."
              tabs={
                <TabBar
                  items={statusTabs.map((t) => ({
                    label: t.label,
                    active: status === t.id,
                    onClick: () => setStatus(t.id),
                  }))}
                />
              }
            />
            <PageContent>
              <FilterBar
                title="Projects"
                label="projects"
                total={byStatus.length}
                filtered={visible.length}
                onClear={() => setLine(undefined)}
                activeFilterCount={line ? 1 : 0}
              >
                <FilterButton
                  label="Service line"
                  options={lineOptions}
                  value={line}
                  onChange={setLine}
                />
              </FilterBar>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Service line</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{lineOptions.find((o) => o.id === p.line)?.label}</TableCell>
                      <TableCell>
                        <Badge tone={statusTone[p.status]} size="sm">{statusLabel[p.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </PageContent>
          </Page>
        </main>
      </div>
    );
  },
};
