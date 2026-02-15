import type { Meta, StoryObj } from '@storybook/react';
import { type CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faTrash,
  faCircleInfo,
  faEllipsisVertical,
  faDownload,
  faPalette,
  faCode,
  faBullhorn,
  faChartLine,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { Badge } from '../Badge';
import { Tag } from '../Tag';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Input } from '../Input';
import { Link } from '../Link';

const meta: Meta<typeof Table> = {
  title: 'Components/table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    striped: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

// Sample data
const users = [
  { name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'positive' as const },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'positive' as const },
  { name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer', status: 'warning' as const },
  { name: 'Dan Lee', email: 'dan@example.com', role: 'Editor', status: 'neutral' as const },
  { name: 'Eve Johnson', email: 'eve@example.com', role: 'Admin', status: 'error' as const },
];

/**
 * Icon button styles matching Figma bds-icon-button spec:
 * 28x28, primary bg, border-radius md, centered icon
 */
const iconButtonStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  padding: 'var(--_space---tiny)',
  backgroundColor: 'var(--_color---background--brand-primary)',
  color: 'var(--_color---text--inverse)',
  border: 'none',
  borderRadius: 'var(--_border-radius---md)',
  cursor: 'pointer',
  fontSize: 12,
};

/**
 * Brand badge styles matching Figma bds-badge-brik-cell:
 * 28x28, yellow bg, border-radius md, centered icon
 */
const brandBadgeStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  backgroundColor: 'var(--_color---background--branding)',
  color: 'var(--_color---text--branding-dark)',
  borderRadius: 'var(--_border-radius---md)',
  fontSize: 14,
};

/**
 * 2-line cell content styles matching Figma spec
 */
const twoLinePrimary: CSSProperties = {
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  fontSize: 'var(--_typography---body--md-base)',
  color: 'var(--_color---text--primary)',
  lineHeight: 1.5,
};

const twoLineSecondary: CSSProperties = {
  fontSize: 'var(--_typography---body--sm)',
  color: 'var(--_color---text--muted)',
  lineHeight: 1.5,
};

// ─── Text Cell (1-line) ──────────────────────────────────────────

/**
 * Text cell — plain text data in cells (bds-text-cell)
 */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Alice Chen</TableCell>
      <TableCell>alice@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Bob Smith</TableCell>
      <TableCell>bob@example.com</TableCell>
      <TableCell>Editor</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Location</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.email}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>Engineering</TableCell>
            <TableCell>Remote</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── Text + Icon Left Cell ───────────────────────────────────────

/**
 * Text with left icon — leading icon for visual context (bds-text-icon-left-cell)
 */
export const WithTextIconLeft: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Service</TableHead>
      <TableHead>Owner</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FontAwesomeIcon icon={faPalette} style={{ width: 24, textAlign: 'center' }} />
          Design
        </span>
      </TableCell>
      <TableCell>Alice Chen</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => {
    const services = [
      { name: 'Design', icon: faPalette, owner: 'Alice Chen' },
      { name: 'Development', icon: faCode, owner: 'Bob Smith' },
      { name: 'Marketing', icon: faBullhorn, owner: 'Carol Davis' },
      { name: 'Analytics', icon: faChartLine, owner: 'Dan Lee' },
      { name: 'Operations', icon: faCog, owner: 'Eve Johnson' },
    ];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.name}>
              <TableCell>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: 'var(--_typography---label--le)', color: 'var(--_color---text--primary)' }}>
                    <FontAwesomeIcon icon={s.icon} />
                  </span>
                  {s.name}
                </span>
              </TableCell>
              <TableCell>{s.owner}</TableCell>
              <TableCell>
                <Badge status="positive" size="sm">Active</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

// ─── Text + Icon Right Cell ──────────────────────────────────────

/**
 * Text with right icon — trailing icon for info or actions (bds-text-icon-right-cell)
 */
export const WithTextIconRight: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Field</TableHead>
      <TableHead>Value</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Email
          <FontAwesomeIcon icon={faCircleInfo} style={{ width: 24, textAlign: 'center' }} />
        </span>
      </TableCell>
      <TableCell>alice@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => {
    const fields = [
      { label: 'Email', value: 'alice@example.com' },
      { label: 'Phone', value: '+1 (555) 123-4567' },
      { label: 'Address', value: '123 Main St, Suite 100' },
      { label: 'Timezone', value: 'PST (UTC-8)' },
      { label: 'Join date', value: 'Jan 15, 2024' },
    ];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((f) => (
            <TableRow key={f.label}>
              <TableCell>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {f.label}
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: 'var(--_typography---label--le)', color: 'var(--_color---text--muted)' }}>
                    <FontAwesomeIcon icon={faCircleInfo} />
                  </span>
                </span>
              </TableCell>
              <TableCell>{f.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

// ─── Badge Cell ──────────────────────────────────────────────────

/**
 * Badge status column (bds-badge-cell)
 */
export const WithBadges: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Alice Chen</TableCell>
      <TableCell>alice@example.com</TableCell>
      <TableCell>
        <Badge status="positive" size="sm">Active</Badge>
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Carol Davis</TableCell>
      <TableCell>carol@example.com</TableCell>
      <TableCell>
        <Badge status="warning" size="sm">Pending</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
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
        {users.map((user) => (
          <TableRow key={user.email}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Badge
                status={user.status}
                size="sm"
              >
                {user.status === 'positive' ? 'Active' :
                 user.status === 'warning' ? 'Pending' :
                 user.status === 'error' ? 'Suspended' : 'Inactive'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── Tag Cell ────────────────────────────────────────────────────

/**
 * Tag category column (bds-tag-cell)
 */
export const WithTags: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Project</TableHead>
      <TableHead>Category</TableHead>
      <TableHead>Owner</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Brand Refresh</TableCell>
      <TableCell><Tag size="sm">Design</Tag></TableCell>
      <TableCell>Alice Chen</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>API Migration</TableCell>
      <TableCell><Tag size="sm">Development</Tag></TableCell>
      <TableCell>Bob Smith</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => {
    const categories = ['Design', 'Development', 'Marketing', 'Strategy', 'Operations'];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {['Brand Refresh', 'API Migration', 'Q1 Campaign', 'Roadmap 2026', 'Vendor Audit'].map(
            (project, i) => (
              <TableRow key={project}>
                <TableCell>{project}</TableCell>
                <TableCell>
                  <Tag size="sm">{categories[i]}</Tag>
                </TableCell>
                <TableCell>{users[i].name}</TableCell>
                <TableCell>Feb {10 + i}, 2026</TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    );
  },
};

// ─── Checkbox Cell ───────────────────────────────────────────────

/**
 * Row selection using checkboxes (bds-checkbox-cell)
 */
export const WithCheckboxes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead><Checkbox name="select-all" label="" value="all" /></TableHead>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell><Checkbox name="select" label="" value="alice" /></TableCell>
      <TableCell>Alice Chen</TableCell>
      <TableCell>alice@example.com</TableCell>
    </TableRow>
    <TableRow>
      <TableCell><Checkbox name="select" label="" value="bob" /></TableCell>
      <TableCell>Bob Smith</TableCell>
      <TableCell>bob@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: '40px' }}>
            <Checkbox name="select-all" label="" value="all" />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.email}>
            <TableCell>
              <Checkbox name="select" label="" value={user.email} />
            </TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── Data Input Cell ─────────────────────────────────────────────

/**
 * Inline data input — editable text input in cells (bds-data-input-left-cell)
 */
export const WithDataInput: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Field</TableHead>
      <TableHead>Value</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Name</TableCell>
      <TableCell>
        <Input size="sm" placeholder="Enter name" />
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Email</TableCell>
      <TableCell>
        <Input size="sm" placeholder="Enter email" />
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
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
          { field: 'First name', placeholder: 'Enter first name' },
          { field: 'Last name', placeholder: 'Enter last name' },
          { field: 'Email', placeholder: 'Enter email' },
          { field: 'Phone', placeholder: 'Enter phone' },
          { field: 'Company', placeholder: 'Enter company' },
        ].map((row) => (
          <TableRow key={row.field}>
            <TableCell>{row.field}</TableCell>
            <TableCell>
              <Input size="sm" placeholder={row.placeholder} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── Badge Brik Cell ─────────────────────────────────────────────

/**
 * Brand badge icon — service/brand indicator (bds-badge-brik-cell)
 */
export const WithBadgeBrik: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Badge</TableHead>
      <TableHead>Service</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, backgroundColor: 'var(--_color---background--branding)',
          color: 'var(--_color---text--branding-dark)', borderRadius: 'var(--_border-radius---md)',
          fontSize: 14,
        }}>
          <FontAwesomeIcon icon={faPalette} />
        </span>
      </TableCell>
      <TableCell>Design</TableCell>
      <TableCell><Badge status="positive" size="sm">Active</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => {
    const services = [
      { name: 'Design', icon: faPalette },
      { name: 'Development', icon: faCode },
      { name: 'Marketing', icon: faBullhorn },
      { name: 'Analytics', icon: faChartLine },
      { name: 'Operations', icon: faCog },
    ];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: '60px' }}>Badge</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s, i) => (
            <TableRow key={s.name}>
              <TableCell>
                <span style={brandBadgeStyles}>
                  <FontAwesomeIcon icon={s.icon} />
                </span>
              </TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>{users[i].name}</TableCell>
              <TableCell>
                <Badge status="positive" size="sm">Active</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

// ─── Actions Cell ────────────────────────────────────────────────

/**
 * Icon action buttons — 28x28 primary square buttons (bds-actions-cell)
 */
export const WithActions: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Alice Chen</TableCell>
      <TableCell>alice@example.com</TableCell>
      <TableCell style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', gap: 'var(--_space---gap--sm)' }}>
          <button type="button" style={iconButtonStyles} aria-label="Edit">
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
          <button type="button" style={iconButtonStyles} aria-label="Download">
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <button type="button" style={iconButtonStyles} aria-label="More">
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
          <button type="button" style={{ ...iconButtonStyles, backgroundColor: 'var(--system--red)' }} aria-label="Delete">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.email}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', gap: 'var(--_space---gap--sm)' }}>
                <button type="button" style={iconButtonStyles} aria-label="Edit">
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button type="button" style={iconButtonStyles} aria-label="Download">
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button type="button" style={iconButtonStyles} aria-label="More">
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
                <button type="button" style={{ ...iconButtonStyles, backgroundColor: 'var(--system--red)' }} aria-label="Delete">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── Button Cell ─────────────────────────────────────────────────

/**
 * Primary button in cell — call-to-action column (bds-button-cell)
 */
export const WithButton: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Action</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Alice Chen</TableCell>
      <TableCell>alice@example.com</TableCell>
      <TableCell>
        <Button variant="primary" size="sm">View profile</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.email}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Button variant="primary" size="sm">View profile</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── Text Link Cell ──────────────────────────────────────────────

/**
 * Text link in cell — clickable link for navigation (bds-text-link-cell)
 */
export const WithTextLink: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Profile</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Alice Chen</TableCell>
      <TableCell>alice@example.com</TableCell>
      <TableCell>
        <Link href="#">View profile</Link>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
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
        {users.map((user) => (
          <TableRow key={user.email}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Link href="#">View profile</Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── 2-Line Variants ─────────────────────────────────────────────

/**
 * Two-line cell variants — primary + secondary text per row for all cell types
 */
export const TwoLineVariants: Story = {
  parameters: {
    docs: {
      source: {
        code: `{/* 2-line text cell */}
<TableCell>
  <div>
    <div style={{ fontWeight: 600 }}>Alice Chen</div>
    <div style={{ fontSize: '...body--sm', color: '...text--muted' }}>alice@example.com</div>
  </div>
</TableCell>

{/* 2-line text + icon left cell */}
<TableCell>
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
    <FontAwesomeIcon icon={faPalette} style={{ width: 24, marginTop: 2 }} />
    <div>
      <div style={{ fontWeight: 600 }}>Design</div>
      <div style={{ fontSize: '...body--sm', color: '...text--muted' }}>Brand &amp; visual identity</div>
    </div>
  </div>
</TableCell>

{/* 2-line badge cell */}
<TableCell>
  <div>
    <Badge status="positive" size="sm">Active</Badge>
    <div style={{ fontSize: '...body--sm', color: '...text--muted' }}>Since Jan 2024</div>
  </div>
</TableCell>`,
      },
    },
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Badge</TableHead>
          <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { name: 'Alice Chen', email: 'alice@example.com', service: 'Design', desc: 'Brand & visual identity', cat: 'Creative', since: 'Since Jan 2024', icon: faPalette, status: 'positive' as const },
          { name: 'Bob Smith', email: 'bob@example.com', service: 'Development', desc: 'Frontend engineering', cat: 'Engineering', since: 'Since Mar 2024', icon: faCode, status: 'positive' as const },
          { name: 'Carol Davis', email: 'carol@example.com', service: 'Marketing', desc: 'Content & campaigns', cat: 'Growth', since: 'Since Jun 2024', icon: faBullhorn, status: 'warning' as const },
          { name: 'Dan Lee', email: 'dan@example.com', service: 'Analytics', desc: 'Data & reporting', cat: 'Intelligence', since: 'Since Sep 2024', icon: faChartLine, status: 'neutral' as const },
        ].map((row) => (
          <TableRow key={row.email}>
            {/* 2-line text cell */}
            <TableCell>
              <div>
                <div style={twoLinePrimary}>{row.name}</div>
                <div style={twoLineSecondary}>{row.email}</div>
              </div>
            </TableCell>
            {/* 2-line text + icon left cell */}
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: 'var(--_typography---label--le)', color: 'var(--_color---text--primary)', flexShrink: 0, marginTop: 2 }}>
                  <FontAwesomeIcon icon={row.icon} />
                </span>
                <div>
                  <div style={twoLinePrimary}>{row.service}</div>
                  <div style={twoLineSecondary}>{row.desc}</div>
                </div>
              </div>
            </TableCell>
            {/* 2-line tag cell */}
            <TableCell>
              <div>
                <Tag size="sm">{row.cat}</Tag>
                <div style={{ ...twoLineSecondary, marginTop: 4 }}>{row.desc}</div>
              </div>
            </TableCell>
            {/* 2-line badge cell */}
            <TableCell>
              <div>
                <Badge status={row.status} size="sm">
                  {row.status === 'positive' ? 'Active' :
                   row.status === 'warning' ? 'Pending' : 'Inactive'}
                </Badge>
                <div style={{ ...twoLineSecondary, marginTop: 4 }}>{row.since}</div>
              </div>
            </TableCell>
            {/* 2-line badge brik cell */}
            <TableCell>
              <span style={brandBadgeStyles}>
                <FontAwesomeIcon icon={row.icon} />
              </span>
            </TableCell>
            {/* Actions cell */}
            <TableCell style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', gap: 'var(--_space---gap--sm)' }}>
                <button type="button" style={iconButtonStyles} aria-label="Edit">
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button type="button" style={{ ...iconButtonStyles, backgroundColor: 'var(--system--red)' }} aria-label="Delete">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── Striped Rows ────────────────────────────────────────────────

/**
 * Alternating row background colors
 */
export const Striped: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table striped>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Alice Chen</TableCell>
      <TableCell>alice@example.com</TableCell>
      <TableCell><Badge status="positive" size="sm">Active</Badge></TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Bob Smith</TableCell>
      <TableCell>bob@example.com</TableCell>
      <TableCell><Badge status="warning" size="sm">Pending</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user, i) => (
          <TableRow
            key={user.email}
            style={i % 2 === 1 ? { backgroundColor: 'var(--_color---background--secondary)' } : {}}
          >
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Badge status={user.status} size="sm">
                {user.status === 'positive' ? 'Active' :
                 user.status === 'warning' ? 'Pending' :
                 user.status === 'error' ? 'Suspended' : 'Inactive'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── Header With Checkbox ────────────────────────────────────────

/**
 * Header cell with optional checkbox — matching bds-header-cell Figma spec
 */
export const HeaderWithCheckbox: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead style={{ width: 40 }}>
        <Checkbox name="select-all" label="" value="all" />
      </TableHead>
      <TableHead sortable sortDirection="asc">Name</TableHead>
      <TableHead sortable>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell><Checkbox name="select" label="" value="alice" /></TableCell>
      <TableCell>Alice Chen</TableCell>
      <TableCell>alice@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: 40 }}>
            <Checkbox name="select-all" label="" value="all" />
          </TableHead>
          <TableHead sortable sortDirection="asc">Name</TableHead>
          <TableHead sortable sortDirection="none">Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user, i) => (
          <TableRow key={user.email} selected={i === 0}>
            <TableCell>
              <Checkbox name="select" label="" value={user.email} defaultChecked={i === 0} />
            </TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Badge status={user.status} size="sm">
                {user.status === 'positive' ? 'Active' :
                 user.status === 'warning' ? 'Pending' :
                 user.status === 'error' ? 'Suspended' : 'Inactive'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─── Composite Example ───────────────────────────────────────────

/**
 * Full-featured table — all cell types combined
 */
export const CompositeExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead><Checkbox name="select-all" label="" value="all" /></TableHead>
      <TableHead sortable sortDirection="asc">Name</TableHead>
      <TableHead>Badge</TableHead>
      <TableHead>Category</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Action</TableHead>
      <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow selected>
      <TableCell><Checkbox name="select" label="" value="alice" defaultChecked /></TableCell>
      <TableCell>
        <div>Alice Chen</div>
        <div>alice@example.com</div>
      </TableCell>
      <TableCell><span style={brandBadgeStyles}><FontAwesomeIcon icon={faPalette} /></span></TableCell>
      <TableCell><Tag size="sm">Design</Tag></TableCell>
      <TableCell><Badge status="positive" size="sm">Active</Badge></TableCell>
      <TableCell><Button variant="primary" size="sm">View</Button></TableCell>
      <TableCell>
        <button style={iconButtonStyles}><FontAwesomeIcon icon={faPenToSquare} /></button>
        <button style={iconButtonStyles}><FontAwesomeIcon icon={faTrash} /></button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      },
    },
  },
  render: () => {
    const categories = ['Design', 'Development', 'Marketing', 'Strategy', 'Operations'];
    const icons = [faPalette, faCode, faBullhorn, faChartLine, faCog];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: '40px' }}>
              <Checkbox name="select-all" label="" value="all" />
            </TableHead>
            <TableHead sortable sortDirection="asc">Name</TableHead>
            <TableHead style={{ width: '60px' }}>Badge</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, i) => (
            <TableRow key={user.email} selected={i === 1}>
              <TableCell>
                <Checkbox name="select" label="" value={user.email} defaultChecked={i === 1} />
              </TableCell>
              <TableCell>
                <div>
                  <div style={twoLinePrimary}>{user.name}</div>
                  <div style={twoLineSecondary}>{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <span style={brandBadgeStyles}>
                  <FontAwesomeIcon icon={icons[i]} />
                </span>
              </TableCell>
              <TableCell>
                <Tag size="sm">{categories[i]}</Tag>
              </TableCell>
              <TableCell>
                <Badge status={user.status} size="sm">
                  {user.status === 'positive' ? 'Active' :
                   user.status === 'warning' ? 'Pending' :
                   user.status === 'error' ? 'Suspended' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="primary" size="sm">View</Button>
              </TableCell>
              <TableCell style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', gap: 'var(--_space---gap--sm)' }}>
                  <button type="button" style={iconButtonStyles} aria-label="Edit">
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button type="button" style={{ ...iconButtonStyles, backgroundColor: 'var(--system--red)' }} aria-label="Delete">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};
