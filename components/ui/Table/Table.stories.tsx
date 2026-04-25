import React, { type CSSProperties } from 'react';
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

/* ─── Reusable Cell Patterns (story-only) ─────────────────────── */

/** Standard icon-left cell layout: 24px icon + text, vertically centered */
const IconLeftCell = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xs)' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: 'var(--label-lg)', color: 'var(--text-primary)', flexShrink: 0 }}>
      <Icon icon={icon} />
    </span>
    {children}
  </span>
);

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
  tags: ['surface-shared'],
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

/** @summary Interactive playground for prop tweaking */
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

/** @summary All variants side by side */
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

        {/* Cell types: icon left, tooltip indicator, tags, badges, actions, button, text link */}
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
                    <IconLeftCell icon={s.icon}>{s.name}</IconLeftCell>
                  </TableCell>
                  <TableCell>{users[i].name}</TableCell>
                  <TableCell><Badge status="positive" size="sm">Active</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <SectionLabel>Tooltip indicator cell</SectionLabel>
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
                    <Badge size="xs" status="brand" icon={<Icon icon={services[i].icon} />} />
                  </TableCell>
                  <TableCell>{project}</TableCell>
                  <TableCell><Tag size="sm">{categories[i]}</Tag></TableCell>
                  <TableCell><Button variant="primary" size="sm">View</Button></TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--gap-sm)' }}>
                      <IconButton variant="primary" size="sm" icon={<Icon icon="ph:pencil-simple" />} label="Edit" />
                      <IconButton variant="danger" size="sm" icon={<Icon icon="ph:trash" />} label="Delete" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <SectionLabel>Text link cell — standard</SectionLabel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Link</TableHead>
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
        </div>

        <div>
          <SectionLabel>Text link cell — with icon</SectionLabel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: 'Q1 Report.pdf', date: 'Apr 10, 2026' },
                { name: 'Brand Guidelines.pdf', date: 'Mar 28, 2026' },
                { name: 'Invoice #1042.pdf', date: 'Apr 1, 2026' },
              ].map((doc) => (
                <TableRow key={doc.name}>
                  <TableCell>{doc.name}</TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>
                    <TextLink href="#" size="small" iconAfter={<Icon icon="ph:arrow-square-out" />}>
                      Open
                    </TextLink>
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
                  <TableCell><TextLink href="#" size="small">Edit</TextLink></TableCell>
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
        </div>
      </Stack>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Full-featured composite table
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
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
                    <Badge size="xs" status="brand" icon={<Icon icon={icons[i]} />} />
                  </TableCell>
                  <TableCell><Tag size="sm">{categories[i]}</Tag></TableCell>
                  <TableCell>
                    <Badge status={user.status} size="sm">{statusLabel(user.status)}</Badge>
                  </TableCell>
                  <TableCell><Button variant="primary" size="sm">View</Button></TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--gap-sm)' }}>
                      <IconButton variant="primary" size="sm" icon={<Icon icon="ph:pencil-simple" />} label="Edit" />
                      <IconButton variant="secondary" size="sm" icon={<Icon icon="ph:download-simple" />} label="Download" />
                      <IconButton variant="ghost" size="sm" icon={<Icon icon="ph:dots-three-vertical" />} label="More options" />
                      <IconButton variant="danger" size="sm" icon={<Icon icon="ph:trash" />} label="Delete" />
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
                  <TableCell><TextLink href="#" size="small">View profile</TextLink></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Stack>
    );
  },
};
