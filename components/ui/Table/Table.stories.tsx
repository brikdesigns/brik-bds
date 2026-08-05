import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSkeletonRow,
  TableActionsCell,
  TableAvatarCell,
  TableTextCell,
  TableIconCell,
  TableImageCell,
  TableLogoCell,
  TableServiceTagCell,
  TableSubheader,
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
 * cell-composition catalog in one place: `<TableIconCell>` for the icon-left
 * name, `<TableTextCell>` for the two-line owner, then a `<Tag>`, a status
 * `<Badge>`, an inline `<TextInput>`, a `<Tooltip>` header indicator, and a
 * `<TextLink>` inside plain cells. Irreducible because the cell variety is
 * composition, not a prop.
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
              <TableIconCell icon={<Icon icon={row.icon} />}>{row.service}</TableIconCell>
              <TableTextCell primary={row.owner} secondary={row.email} />
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

/**
 * `<TableSkeletonRow>` fills a loading `<TableBody>` — pass `columns` to
 * match the header, and `cellWidths` to hint per-cell placeholder width
 * (cycles if shorter than `columns`). Composes `TableRow` + `TableCell`,
 * so it automatically inherits the parent `Table`'s `size` row height.
 * Irreducible — the value is the exported subcomponent itself, not a
 * `Table` arg.
 *
 * @summary Skeleton rows filling a loading Table body
 */
export const Loading: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableSkeletonRow
            key={i}
            columns={4}
            cellWidths={['long', 'medium', 'short', 'short']}
          />
        ))}
      </TableBody>
    </Table>
  ),
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
              <Button variant="secondary" size="md" icon={<Icon icon={Eye} />} label="View" />
              <Button variant="secondary" size="md" icon={<Icon icon={Pen} />} label="Edit" />
              <Button variant="secondary" size="md" icon={<Icon icon={EllipsisVertical} />} label="More" />
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
                <TextLink href="#" size="small" onClick={(e) => e.preventDefault()}>
                  {service.name}
                </TextLink>
              </TableCell>
              <TableCell>
                <TextLink href="#" size="small" onClick={(e) => e.preventDefault()}>
                  {service.serviceLine}
                </TextLink>
              </TableCell>
              <TableCell><Badge status={service.status} size="sm">{statusLabel(service.status)}</Badge></TableCell>
              <TableActionsCell>
                <Button variant="primary" size="sm" icon={<Icon icon={Eye} />} label="View" />
                <Button variant="primary" size="sm" icon={<Icon icon={Pen} />} label="Edit" />
              </TableActionsCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/**
 * `<TableSubheader>` is a thin full-width section-divider row for grouping
 * body rows by phase or category. Drop it inside `<TableBody>` between row
 * groups; `colSpan` defaults to 100 so it spans any table. Irreducible —
 * the value is the exported subcomponent, not a `Table` arg.
 *
 * @summary Section-divider rows grouping the body
 */
export const WithSubheaders: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableSubheader label="Admins" />
        {users
          .filter((u) => u.role === 'Admin')
          .map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell><Badge status={user.status} size="sm">{statusLabel(user.status)}</Badge></TableCell>
            </TableRow>
          ))}
        <TableSubheader label="Editors & viewers" />
        {users
          .filter((u) => u.role !== 'Admin')
          .map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell><Badge status={user.status} size="sm">{statusLabel(user.status)}</Badge></TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   MEDIA CELLS — avatar / image / logo / service-tag typed cells (#1096)
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
 * `<TableLogoCell>` is the name-referenced counterpart to `<TableImageCell>` —
 * it renders a bundled brand `Logo` (referenced by `set` + `name`) in the same
 * square 1:1 footprint. Use it for payment methods, integrations, or client
 * marks bundled into BDS; use `<TableImageCell src>` for per-tenant uploaded
 * logos. Irreducible composition.
 *
 * @summary Bundled brand-logo cells (payment methods)
 */
export const WithLogoCell: Story = {
  render: () => {
    const methods = [
      { logo: { set: 'credit-card', name: 'visa' } as const, label: 'Visa ending 4242', status: 'positive' as const },
      { logo: { set: 'credit-card', name: 'mastercard' } as const, label: 'Mastercard ending 5555', status: 'positive' as const },
      { logo: { set: 'credit-card', name: 'amex' } as const, label: 'Amex ending 0005', status: 'warning' as const },
    ];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Card</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {methods.map((m) => (
            <TableRow key={m.label}>
              <TableLogoCell logo={m.logo} decorative />
              <TableCell>{m.label}</TableCell>
              <TableCell>
                <Badge status={m.status} size="sm">{statusLabel(m.status)}</Badge>
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
