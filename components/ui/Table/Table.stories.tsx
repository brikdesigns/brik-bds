import { type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { Badge } from '../Badge';
import { Tag } from '../Tag';
import { Button, IconButton } from '../Button';
import { Checkbox } from '../Checkbox';
import { TextInput } from '../TextInput';
import { TextLink } from '../TextLink';
import { Tooltip } from '../Tooltip';

/**
 * Table — semantic `<table>` with bordered/striped variants and sortable
 * headers. Compose with `TableHeader`, `TableBody`, `TableRow`, `TableHead`,
 * `TableCell`. Cells accept any ReactNode — Badges, Tags, Buttons, TextLinks,
 * inputs, two-line content, icons.
 * @summary Semantic table with sortable headers
 */
const meta: Meta<typeof Table> = {
  title: 'Components/Container/table',
  component: Table,
  parameters: { layout: 'padded' },
  argTypes: {
    striped: { control: 'boolean' },
    size: { control: 'select', options: ['default', 'comfortable'] },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

/* ─── Sample data ────────────────────────────────────────────── */

const users = [
  { name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'positive' as const },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'positive' as const },
  { name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer', status: 'warning' as const },
  { name: 'Dan Lee', email: 'dan@example.com', role: 'Editor', status: 'info' as const },
  { name: 'Eve Johnson', email: 'eve@example.com', role: 'Admin', status: 'error' as const },
];

const services = [
  { name: 'Design', icon: 'ph:palette' },
  { name: 'Development', icon: 'ph:code' },
  { name: 'Marketing', icon: 'ph:megaphone' },
  { name: 'Analytics', icon: 'ph:chart-line' },
  { name: 'Operations', icon: 'ph:gear' },
];

const categories = ['Design', 'Development', 'Marketing', 'Strategy', 'Operations'];

const statusLabel = (s: string) =>
  s === 'positive' ? 'Active' : s === 'warning' ? 'Pending' : s === 'error' ? 'Suspended' : 'Inactive';

const twoLinePrimary: CSSProperties = {
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  fontSize: 'var(--body-md)',
  color: 'var(--text-primary)',
  lineHeight: 'var(--font-line-height-normal)',
};

const twoLineSecondary: CSSProperties = {
  fontSize: 'var(--body-sm)',
  color: 'var(--text-muted)',
  lineHeight: 'var(--font-line-height-normal)',
};

const IconLeftCell = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xs)' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: 'var(--label-lg)', color: 'var(--text-primary)', flexShrink: 0 }}>
      <Icon icon={icon} />
    </span>
    {children}
  </span>
);

/* ─── Sandbox ────────────────────────────────────────────────── */

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { striped: false, size: 'default' },
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.email}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Badge status={user.status} size="sm">{statusLabel(user.status)}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/* ─── Sizes / striping ───────────────────────────────────────── */

/** Default size — standard density.
 *  @summary Default density */
export const Default: Story = {
  render: () => (
    <Table size="default">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.slice(0, 3).map((u) => (
          <TableRow key={u.email}>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Comfortable size — looser row padding for readability-first surfaces.
 *  @summary Comfortable density */
export const Comfortable: Story = {
  render: () => (
    <Table size="comfortable">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.slice(0, 3).map((u) => (
          <TableRow key={u.email}>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Striped — alternating row backgrounds for dense data.
 *  @summary Striped rows */
export const Striped: Story = {
  render: () => (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.email}>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell><Badge status={u.status} size="sm">{statusLabel(u.status)}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/* ─── Header behaviors ───────────────────────────────────────── */

/** Sortable headers + checkbox selection — adds `sortable` to TableHead and
 *  uses `selected` on TableRow for the highlighted state.
 *  @summary Sortable headers with row selection */
export const SortableWithSelection: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: 40 }}><Checkbox name="select-all" label="" value="all" /></TableHead>
          <TableHead sortable sortDirection="asc">Name</TableHead>
          <TableHead sortable sortDirection="none">Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u, i) => (
          <TableRow key={u.email} selected={i === 0}>
            <TableCell><Checkbox name="select" label="" value={u.email} defaultChecked={i === 0} /></TableCell>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.role}</TableCell>
            <TableCell><Badge status={u.status} size="sm">{statusLabel(u.status)}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/* ─── Cell-content recipes ───────────────────────────────────── */

/** Icon-left cell — pairs an icon with text inside a single cell.
 *  @summary Icon-left cell content */
export const IconLeftCells: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((s, i) => (
          <TableRow key={s.name}>
            <TableCell>
              <IconLeftCell icon={s.icon}>{s.name}</IconLeftCell>
            </TableCell>
            <TableCell>{users[i].name}</TableCell>
            <TableCell><Badge status="positive" size="sm">Active</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Tooltip indicator next to a header label — for explaining columns inline.
 *  @summary Cell with tooltip indicator */
export const TooltipIndicatorCells: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { label: 'Email', value: 'alice@example.com', hint: 'Primary contact email' },
          { label: 'Phone', value: '+1 (555) 123-4567', hint: 'Direct line — business hours only' },
          { label: 'Address', value: '123 Main St, Suite 100', hint: 'Billing address on file' },
        ].map((f) => (
          <TableRow key={f.label}>
            <TableCell>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xs)' }}>
                {f.label}
                <Tooltip content={f.hint} placement="top">
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, fontSize: 'var(--label-md)', color: 'var(--text-muted)', cursor: 'help' }}>
                    <Icon icon="ph:info" />
                  </span>
                </Tooltip>
              </span>
            </TableCell>
            <TableCell>{f.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Tags, brand badge, button, and icon-button row actions in a single table.
 *  Common shape for "list of records with actions."
 *  @summary Tags + badges + buttons + actions */
export const ActionRowCells: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: 60 }}>Badge</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Action</TableHead>
          <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {['Brand Refresh', 'API Migration', 'Q1 Campaign', 'Roadmap 2026', 'Vendor Audit'].map((project, i) => (
          <TableRow key={project}>
            <TableCell>
              <Badge size="xs" status="brand" icon={<Icon icon={services[i].icon} />} />
            </TableCell>
            <TableCell>{project}</TableCell>
            <TableCell><Tag size="sm">{categories[i]}</Tag></TableCell>
            <TableCell><Button variant="primary" size="sm">View</Button></TableCell>
            <TableCell style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', gap: 'var(--gap-sm)' }}>
                <IconButton variant="primary" size="sm" icon={<Icon icon="ph:pencil-simple" />} label="Edit" />
                <IconButton variant="destructive" size="sm" icon={<Icon icon="ph:trash" />} label="Delete" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** TextLink cell — for "view profile"/"open"-style row links.
 *  @summary TextLink cell */
export const TextLinkCells: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Profile</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.slice(0, 3).map((u) => (
          <TableRow key={u.email}>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.role}</TableCell>
            <TableCell><TextLink href="#" size="small">View profile</TextLink></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Editable cells — `TextInput` rendered inside a TableCell. Common for
 *  inline-edit grids.
 *  @summary Editable input cells */
export const EditableCells: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { field: 'First name', placeholder: 'Enter first name' },
          { field: 'Last name', placeholder: 'Enter last name' },
          { field: 'Email', placeholder: 'Enter email' },
        ].map((row) => (
          <TableRow key={row.field}>
            <TableCell>{row.field}</TableCell>
            <TableCell><TextInput size="sm" placeholder={row.placeholder} /></TableCell>
            <TableCell><TextLink href="#" size="small">Edit</TextLink></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Two-line cells — primary + secondary text inside a single cell. Used for
 *  name + email, service + description, status + timestamp, etc.
 *  @summary Two-line content per cell */
export const TwoLineCells: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { name: 'Alice Chen', email: 'alice@example.com', service: 'Design', desc: 'Brand & visual identity', icon: 'ph:palette', status: 'positive' as const, since: 'Since Jan 2024' },
          { name: 'Bob Smith', email: 'bob@example.com', service: 'Development', desc: 'Frontend engineering', icon: 'ph:code', status: 'positive' as const, since: 'Since Mar 2024' },
          { name: 'Carol Davis', email: 'carol@example.com', service: 'Marketing', desc: 'Content & campaigns', icon: 'ph:megaphone', status: 'warning' as const, since: 'Since Jun 2024' },
        ].map((row) => (
          <TableRow key={row.email}>
            <TableCell>
              <div>
                <div style={twoLinePrimary}>{row.name}</div>
                <div style={twoLineSecondary}>{row.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--gap-xs)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: 'var(--label-lg)', color: 'var(--text-primary)', flexShrink: 0, marginTop: 2 }}>
                  <Icon icon={row.icon} />
                </span>
                <div>
                  <div style={twoLinePrimary}>{row.service}</div>
                  <div style={twoLineSecondary}>{row.desc}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <Badge status={row.status} size="sm">{statusLabel(row.status)}</Badge>
                <div style={{ ...twoLineSecondary, marginTop: 'var(--gap-xs)' }}>{row.since}</div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
