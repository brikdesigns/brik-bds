import React, { type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActionsCell,
  TableAvatarCell,
  TableImageCell,
  TableServiceTagCell,
} from './Table';
import { Badge } from '../Badge';
import { Tag } from '../Tag';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { TextInput } from '../TextInput';
import { TextLink } from '../TextLink';
import { Tooltip } from '../Tooltip';
import { ServiceTag, type ServiceLine } from '../ServiceTag';
import { Eye, Pen, EllipsisVertical } from '../../icons';

/* ─── Layout helper (story-only) ──────────────────────────────── */

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Shared cell styles + helpers (story-only) ───────────────── */

const twoLinePrimary: CSSProperties = {
  fontWeight: 'var(--font-weight-semibold)' as unknown as number,
  fontSize: 'var(--body-md)',
  color: 'var(--text-primary)',
  lineHeight: 'var(--font-line-height-normal)',
};

const twoLineSecondary: CSSProperties = {
  fontSize: 'var(--body-sm)',
  color: 'var(--text-muted)',
  lineHeight: 'var(--font-line-height-normal)',
};

/** Standard icon-left cell layout: 24px icon + text, vertically centered */
const IconLeftCell = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xs)' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: 'var(--label-lg)', color: 'var(--text-primary)', flexShrink: 0 }}>
      <Icon icon={icon} />
    </span>
    {children}
  </span>
);

/* ─── Sample data ─────────────────────────────────────────────── */

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
  title: 'Containers/table',
  component: Table,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    striped: { control: 'boolean', description: 'Zebra-stripe alternate body rows.' },
    size: {
      control: 'select',
      options: ['default', 'comfortable'],
      description: 'Row density — `default` (compact) or `comfortable` (72px cell height).',
    },
    headerBorder: {
      control: 'boolean',
      description: 'Show a bottom border under the header row. Off by default.',
    },
    headerBorderWeight: {
      control: 'select',
      options: ['md', 'sm'],
      description:
        'Weight of the header bottom border when `headerBorder` is on — `md` (default) or `sm` to match the data-row divider. No effect when `headerBorder` is off.',
    },
    roundedTop: {
      control: 'boolean',
      description: 'Round the top-left / top-right outer corners (draws a subtle outer border). On by default.',
    },
    roundedBottom: {
      control: 'boolean',
      description: 'Round the bottom-left / bottom-right outer corners (draws a subtle outer border). On by default.',
    },
    headerBackground: {
      control: 'select',
      options: ['secondary', 'primary'],
      description: 'Header row background fill — `secondary` (default) or `primary` to match the body.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * Canonical table. Toggle `striped`, `size`, `headerBorder`,
 * `headerBorderWeight`, `roundedTop`, `roundedBottom`, and `headerBackground`
 * via Controls. Cells accept any content — see the Variants stories for the
 * composition catalog.
 *
 * @summary Themed data table — striped + size are Controls
 */
export const Default: Story = {
  args: {
    striped: false,
    size: 'default',
    headerBorder: false,
    headerBorderWeight: 'md',
    roundedTop: true,
    roundedBottom: true,
    headerBackground: 'secondary',
  },
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
   VARIANTS — irreducible compositions (sub-component props)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Sortable headers (`sortable` + `sortDirection` on `<TableHead>`) plus
 * checkbox row selection (`selected` on `<TableRow>` + a `<Checkbox>` cell).
 * Irreducible — the interactivity lives on the sub-components, not on
 * `Table` args, so Controls can't express it.
 *
 * @summary Sortable headers + checkbox row selection
 */
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

/**
 * A `<TableCell>` accepts any content. This realistic table exercises the
 * cell-composition catalog in one place: icon-left name, a two-line
 * owner cell, a `<Tag>`, a status `<Badge>`, an inline `<TextInput>`, a
 * `<Tooltip>` header indicator, and a `<TextLink>`. Irreducible because
 * the cell variety is composition, not a prop.
 *
 * @summary Cell-content catalog — icons, tags, badges, inputs, links
 */
export const CellTypes: Story = {
  render: () => {
    const rows = [
      { service: 'Brand Identity', icon: 'ph:palette', owner: 'Alice Chen', email: 'alice@example.com', category: 'Design', status: 'positive' as const },
      { service: 'API Migration', icon: 'ph:code', owner: 'Bob Smith', email: 'bob@example.com', category: 'Development', status: 'positive' as const },
      { service: 'Q1 Campaign', icon: 'ph:megaphone', owner: 'Carol Davis', email: 'carol@example.com', category: 'Marketing', status: 'warning' as const },
    ];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xs)' }}>
                Status
                <Tooltip content="Lifecycle state — synced nightly" placement="top">
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, fontSize: 'var(--label-md)', color: 'var(--text-muted)', cursor: 'help' }}>
                    <Icon icon="ph:info" />
                  </span>
                </Tooltip>
              </span>
            </TableHead>
            <TableHead>Rename</TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.service}>
              <TableCell><IconLeftCell icon={row.icon}>{row.service}</IconLeftCell></TableCell>
              <TableCell>
                <div>
                  <div style={twoLinePrimary}>{row.owner}</div>
                  <div style={twoLineSecondary}>{row.email}</div>
                </div>
              </TableCell>
              <TableCell><Tag size="sm">{row.category}</Tag></TableCell>
              <TableCell><Badge status={row.status} size="sm">{statusLabel(row.status)}</Badge></TableCell>
              <TableCell><TextInput size="sm" placeholder={row.service} /></TableCell>
              <TableCell>
                <TextLink href="#" size="small" iconAfter={<Icon icon="ph:arrow-square-out" />}>Open</TextLink>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   PATTERNS — actions cell + cell-level interactivity canon
   ═══════════════════════════════════════════════════════════════ */

/**
 * Right-aligned `[View][Edit][⋯]` cluster using `<TableActionsCell>`.
 * Owns alignment, shrink-to-content width, and the `--gap-sm` rhythm —
 * consumers stop hand-rolling `style={{ textAlign: 'right' }}` on
 * `<TableCell>`.
 *
 * @summary With actions cell
 */
export const WithActionsCell: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.email}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell><Badge status={user.status} size="sm">{statusLabel(user.status)}</Badge></TableCell>
            <TableActionsCell>
              <Button variant="primary" size="sm" icon={<Icon icon={Eye} />} label="View" />
              <Button variant="primary" size="sm" icon={<Icon icon={Pen} />} label="Edit" />
              <Button variant="ghost" size="sm" icon={<Icon icon={EllipsisVertical} />} label="More" />
            </TableActionsCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * The canonical read/edit canon table layout. **No row-level click.**
 * Three cell classes carry interactivity:
 * - **Name cell** — `<TextLink>` opening the read sheet for that row.
 * - **Foreign-key cell** — `<TextLink>` opening the read sheet of the
 *   referenced entity (Service Line, Company, etc.).
 * - **Actions cell** — `<TableActionsCell>` hosting `[View][Edit]` icon
 *   buttons (optional `[⋯]` overflow for tertiary actions).
 *
 * Read-only display cells (Status / Public / Featured) stay plain
 * `<Badge>` or text — not interactive.
 *
 * @summary Cell-level interactivity
 */
export const CellLevelInteractivity: Story = {
  render: () => {
    const services = [
      { name: 'Brand Identity Bundle', serviceLine: 'Brand', category: 'Brand', status: 'positive' as const },
      { name: 'Website Design', serviceLine: 'Marketing', category: 'Marketing', status: 'positive' as const },
      { name: 'SEO Audit', serviceLine: 'Marketing', category: 'Marketing', status: 'warning' as const },
    ];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Service line</TableHead>
            <TableHead>Status</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.name}>
              <TableCell>
                <TextLink href="#" size="small" onClick={(e) => { e.preventDefault(); alert(`Open ${service.name} read sheet`); }}>
                  {service.name}
                </TextLink>
              </TableCell>
              <TableCell>
                <TextLink href="#" size="small" onClick={(e) => { e.preventDefault(); alert(`Open ${service.serviceLine} service line read sheet`); }}>
                  {service.serviceLine}
                </TextLink>
              </TableCell>
              <TableCell><Badge status={service.status} size="sm">{statusLabel(service.status)}</Badge></TableCell>
              <TableActionsCell>
                <Button variant="primary" size="sm" icon={<Icon icon={Eye} />} label="View" onClick={() => alert(`View ${service.name}`)} />
                <Button variant="primary" size="sm" icon={<Icon icon={Pen} />} label="Edit" onClick={() => alert(`Edit ${service.name}`)} />
              </TableActionsCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/**
 * **Anti-pattern — do not do this.** Whole-row `onClick` violates table
 * cell semantics, breaks screen-reader expectations, and conflicts with
 * cell-level affordances. The row appears clickable but the keyboard /
 * AT user has no equivalent activation path, and any nested `<TextLink>`
 * or `<Button>` fights the row handler for click events.
 *
 * The canonical pattern is shown in `CellLevelInteractivity` above —
 * Name and FK cells are `<TextLink>`s, and a `<TableActionsCell>` hosts
 * the trailing actions. Consumers migrating off `onRowClick` should
 * delete the `<tr>` handler and add cell-level affordances.
 *
 * @summary Row click anti pattern
 */
export const RowClickAntiPattern: Story = {
  render: () => (
    <Stack>
      <div
        role="note"
        style={{
          padding: 'var(--padding-md)',
          background: 'var(--surface-warning)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--border-radius-md)',
          border: 'var(--border-width-sm) solid var(--border-warning)',
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-sm)',
        }}
      >
        <strong>Anti-pattern.</strong> The row below has{' '}
        <code>onClick</code> bound to the <code>&lt;tr&gt;</code>. Do not
        ship this. See <code>CellLevelInteractivity</code> for the
        canonical replacement.
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.slice(0, 3).map((user) => (
            <TableRow
              key={user.email}
              onClick={() => alert(`Don't do this. Row click on ${user.name}.`)}
              style={{ cursor: 'pointer' }}
            >
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   MEDIA CELLS — avatar / image / service-tag typed cells (#1096)
   ═══════════════════════════════════════════════════════════════ */

/** Map a Badge status onto an Avatar presence dot (story-only). */
const presence = (s: string): 'online' | 'away' | 'busy' | 'offline' =>
  s === 'positive' ? 'online' : s === 'warning' ? 'away' : s === 'error' ? 'busy' : 'offline';

/**
 * `<TableAvatarCell>` pairs an `Avatar` with a name and an optional secondary
 * line (email / role). Initials render when no `src` is set; pass `primary` as
 * a `<TextLink>` when the name should navigate. Irreducible — the cell is
 * composition, not a `Table` arg.
 *
 * @summary Avatar identity cells (name + email)
 */
export const WithAvatarCell: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u, i) => (
          <TableRow key={u.email}>
            <TableAvatarCell
              name={u.name}
              secondary={u.email}
              status={presence(u.status)}
              primary={
                i === 0 ? (
                  <TextLink href="#" size="small" onClick={(e) => e.preventDefault()}>
                    {u.name}
                  </TextLink>
                ) : undefined
              }
            />
            <TableCell>{u.role}</TableCell>
            <TableCell>
              <Badge status={u.status} size="sm">{statusLabel(u.status)}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * `<TableImageCell>` renders a fixed square (1:1) thumbnail for a logo or
 * product image, shrink-to-content width. `fit="contain"` keeps a logo
 * uncropped; `fit="cover"` fills the square for product photos. Upload / edit
 * wiring is consumer-side.
 *
 * @summary Square logo / product thumbnail cells
 */
export const WithImageCell: Story = {
  render: () => {
    const orgs = [
      { name: 'Brik Designs', plan: 'Enterprise', status: 'positive' as const },
      { name: 'Vantage Partners', plan: 'Growth', status: 'positive' as const },
      { name: 'Renew PMS', plan: 'Starter', status: 'warning' as const },
    ];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orgs.map((o) => (
            <TableRow key={o.name}>
              <TableImageCell src="/brik-logo.svg" alt={`${o.name} logo`} fit="contain" />
              <TableCell>{o.name}</TableCell>
              <TableCell>{o.plan}</TableCell>
              <TableCell>
                <Badge status={o.status} size="sm">{statusLabel(o.status)}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/**
 * `<TableServiceTagCell>` hosts one or more `ServiceTag`s on a row, wrapping
 * with a consistent gap. Supply `variant="icon"` for icon-only classification
 * or `variant="icon-text"` for a labeled tag. Irreducible composition.
 *
 * @summary Service-tag cells (icon-only + labeled)
 */
export const WithServiceTagCell: Story = {
  render: () => {
    // serviceNames proven against ServiceTag's own stories so glyphs resolve.
    const labeled: Record<ServiceLine, string> = {
      brand: 'Brand Identity Bundle',
      marketing: 'Custom Standard Web Development and Design',
      information: 'Information Design',
      product: 'Product Design Systems',
      'back-office': 'Digital File Organization',
      service: 'Digital File Organization',
    };
    const rows: { name: string; lines: ServiceLine[] }[] = [
      { name: 'Brand Identity Bundle', lines: ['brand', 'marketing'] },
      { name: 'Website Design', lines: ['marketing'] },
      { name: 'Ops Automation', lines: ['back-office', 'product', 'information'] },
    ];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Lines (icon-only)</TableHead>
            <TableHead>Primary line (labeled)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableServiceTagCell>
                {row.lines.map((line) => (
                  <ServiceTag key={line} category={line} variant="icon" />
                ))}
              </TableServiceTagCell>
              <TableServiceTagCell>
                <ServiceTag
                  category={row.lines[0]}
                  variant="icon-text"
                  serviceName={labeled[row.lines[0]]}
                />
              </TableServiceTagCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};
