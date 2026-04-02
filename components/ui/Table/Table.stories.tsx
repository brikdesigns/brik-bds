import React, { type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { Badge } from '../Badge';
import { Tag } from '../Tag';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { TextInput } from '../TextInput';
import { TextLink } from '../TextLink';

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

/* ─── Shared Styles ───────────────────────────────────────────── */

const iconButtonStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  padding: 'var(--padding-tiny)',
  backgroundColor: 'var(--background-brand-primary)',
  color: 'var(--text-inverse)',
  border: 'none',
  borderRadius: 'var(--border-radius-md)',
  cursor: 'pointer',
  fontSize: 12, // bds-lint-ignore — matches Figma 28x28 icon button spec
};

const brandBadgeStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  backgroundColor: 'var(--background-brand-primary)',
  color: 'var(--text-inverse)',
  borderRadius: 'var(--border-radius-md)',
  fontSize: 'var(--label-sm)', // bds-lint-ignore — story decoration
};

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

/* ─── Sample Data ─────────────────────────────────────────────── */

const users = [
  { name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'positive' as const },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'positive' as const },
  { name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer', status: 'warning' as const },
  { name: 'Dan Lee', email: 'dan@example.com', role: 'Editor', status: 'info' as const },
  { name: 'Eve Johnson', email: 'eve@example.com', role: 'Admin', status: 'error' as const },
];

const statusLabel = (s: string) =>
  s === 'positive' ? 'Active' : s === 'warning' ? 'Pending' : s === 'error' ? 'Suspended' : 'Inactive';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Table> = {
  title: 'Displays/Table/table',
  component: Table,
  parameters: { layout: 'padded' },
  argTypes: {
    striped: { control: 'boolean' },
    size: { control: 'select', options: ['default', 'comfortable'] },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, striped, sortable, cell types
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => {
    const services = [
      { name: 'Design', icon: 'ph:palette' },
      { name: 'Development', icon: 'ph:code' },
      { name: 'Marketing', icon: 'ph:megaphone' },
      { name: 'Analytics', icon: 'ph:chart-line' },
      { name: 'Operations', icon: 'ph:gear' },
    ];
    const categories = ['Design', 'Development', 'Marketing', 'Strategy', 'Operations'];

    return (
      <Stack gap="var(--gap-huge)">
        {/* Size variants */}
        <div>
          <SectionLabel>Default size</SectionLabel>
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
        </div>

        <div>
          <SectionLabel>Comfortable size</SectionLabel>
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
        </div>

        {/* Striped */}
        <div>
          <SectionLabel>Striped</SectionLabel>
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
        </div>

        {/* Sortable headers + checkbox selection */}
        <div>
          <SectionLabel>Sortable headers + checkbox</SectionLabel>
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
        </div>

        {/* Cell types: icon left, icon right, tags, badges, actions, button, text link */}
        <div>
          <SectionLabel>Icon left cell</SectionLabel>
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: 'var(--label-lg)', color: 'var(--text-primary)' }}>
                        <Icon icon={s.icon} />
                      </span>
                      {s.name}
                    </span>
                  </TableCell>
                  <TableCell>{users[i].name}</TableCell>
                  <TableCell><Badge status="positive" size="sm">Active</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <SectionLabel>Icon right cell</SectionLabel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { label: 'Email', value: 'alice@example.com' },
                { label: 'Phone', value: '+1 (555) 123-4567' },
                { label: 'Address', value: '123 Main St, Suite 100' },
              ].map((f) => (
                <TableRow key={f.label}>
                  <TableCell>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {f.label}
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: 'var(--label-lg)', color: 'var(--text-muted)' }}>
                        <Icon icon="ph:info" />
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>{f.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <SectionLabel>Tags + brand badge + actions</SectionLabel>
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
                    <span style={brandBadgeStyles}><Icon icon={services[i].icon} /></span>
                  </TableCell>
                  <TableCell>{project}</TableCell>
                  <TableCell><Tag size="sm">{categories[i]}</Tag></TableCell>
                  <TableCell><Button variant="primary" size="sm">View</Button></TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--gap-sm)' }}>
                      <button type="button" style={iconButtonStyles} aria-label="Edit"><Icon icon="ph:pencil-square" /></button>
                      <button type="button" style={{ ...iconButtonStyles, backgroundColor: 'var(--color-system-red)' }} aria-label="Delete"><Icon icon="ph:trash" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <SectionLabel>Data input + text link</SectionLabel>
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
                  <TableCell><TextLink href="#">Edit</TextLink></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 2-line variants */}
        <div>
          <SectionLabel>Two-line cells</SectionLabel>
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
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
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
                      <div style={{ ...twoLineSecondary, marginTop: 4 }}>{row.since}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Stack>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Full-featured composite table
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => {
    const categories = ['Design', 'Development', 'Marketing', 'Strategy', 'Operations'];
    const icons = ['ph:palette', 'ph:code', 'ph:megaphone', 'ph:chart-line', 'ph:gear'];

    return (
      <Stack gap="var(--gap-huge)">
        {/* Full composite table */}
        <div>
          <SectionLabel>Full-featured team table</SectionLabel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 40 }}><Checkbox name="select-all" label="" value="all" /></TableHead>
                <TableHead sortable sortDirection="asc">Name</TableHead>
                <TableHead style={{ width: 60 }}>Badge</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => (
                <TableRow key={user.email} selected={i === 1}>
                  <TableCell><Checkbox name="select" label="" value={user.email} defaultChecked={i === 1} /></TableCell>
                  <TableCell>
                    <div>
                      <div style={twoLinePrimary}>{user.name}</div>
                      <div style={twoLineSecondary}>{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span style={brandBadgeStyles}><Icon icon={icons[i]} /></span>
                  </TableCell>
                  <TableCell><Tag size="sm">{categories[i]}</Tag></TableCell>
                  <TableCell>
                    <Badge status={user.status} size="sm">{statusLabel(user.status)}</Badge>
                  </TableCell>
                  <TableCell><Button variant="primary" size="sm">View</Button></TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--gap-sm)' }}>
                      <button type="button" style={iconButtonStyles} aria-label="Edit"><Icon icon="ph:pencil-square" /></button>
                      <button type="button" style={iconButtonStyles} aria-label="Download"><Icon icon="ph:download-simple" /></button>
                      <button type="button" style={iconButtonStyles} aria-label="More"><Icon icon="ph:dots-three-vertical" /></button>
                      <button type="button" style={{ ...iconButtonStyles, backgroundColor: 'var(--color-system-red)' }} aria-label="Delete"><Icon icon="ph:trash" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Striped comfortable table */}
        <div>
          <SectionLabel>Striped comfortable table</SectionLabel>
          <Table striped size="comfortable">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell><TextLink href="#">View profile</TextLink></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Stack>
    );
  },
};
