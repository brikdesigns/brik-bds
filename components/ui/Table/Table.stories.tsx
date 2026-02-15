import type { Meta, StoryObj } from '@storybook/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { Badge } from '../Badge';
import { Tag } from '../Tag';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
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

// Default — plain text cells
export const Default: Story = {
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

// With Badge status column
export const WithBadges: Story = {
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

// With Tag category column
export const WithTags: Story = {
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
                  <Tag>{categories[i]}</Tag>
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

// With action buttons (Font Awesome icons)
export const WithActions: Story = {
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
              <div style={{ display: 'inline-flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--_color---text--muted)',
                    padding: '4px',
                  }}
                  aria-label="Edit"
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--system--red)',
                    padding: '4px',
                  }}
                  aria-label="Delete"
                >
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

// With checkbox selection
export const WithCheckboxes: Story = {
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

// Striped rows
export const Striped: Story = {
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

// Kitchen-sink composite example
export const CompositeExample: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: '40px' }}>
            <Checkbox name="select-all" label="" value="all" />
          </TableHead>
          <TableHead sortable sortDirection="asc">Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
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
                <div style={{ fontWeight: 'var(--font-weight--medium)' }}>{user.name}</div>
                <div style={{
                  fontSize: 'var(--_typography---body--sm)',
                  color: 'var(--_color---text--muted)',
                }}>
                  {user.email}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Tag>{['Design', 'Development', 'Marketing', 'Strategy', 'Operations'][i]}</Tag>
            </TableCell>
            <TableCell>
              <Badge status={user.status} size="sm">
                {user.status === 'positive' ? 'Active' :
                 user.status === 'warning' ? 'Pending' :
                 user.status === 'error' ? 'Suspended' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell style={{ textAlign: 'right' }}>
              <Button variant="secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
