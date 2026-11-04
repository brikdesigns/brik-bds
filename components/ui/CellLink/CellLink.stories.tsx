import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CellLink } from './CellLink';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';

const meta: Meta<typeof CellLink> = {
  title: 'Components/cell-link',
  component: CellLink,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    href: {
      control: 'text',
      description: 'Destination. Present → renders an `<a>`; omitted → renders a `<button type="button">`.',
    },
    children: { control: 'text', description: 'Cell text — the row identifier.' },
    iconBefore: { control: false, description: 'Leading slot — company mark, avatar.' },
    iconAfter: { control: false, description: 'Trailing slot — a `Tag`, an external-link glyph.' },
  },
};

export default meta;
type Story = StoryObj<typeof CellLink>;

/**
 * Anchor form — neutral at rest, brand on hover, no underline.
 *
 * @summary Neutral row-identifier link, brand on hover
 */
export const Default: Story = {
  args: { href: '#', children: 'Acme Corporation' },
};

/**
 * No `href` renders a real `<button>` — for a row that opens a sheet or runs a
 * callback instead of navigating.
 *
 * @summary Button form for rows that open a sheet
 */
export const Button: Story = {
  args: { children: 'Acme Corporation', onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Acme Corporation' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(button).toHaveAttribute('type', 'button');
  },
};

/**
 * The link tracks the cell's own font size, so the linked and plain cells in a
 * column always match.
 *
 * @summary Cell link inside a table row
 */
export const InTable: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Plan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <CellLink href="#">Acme Corporation</CellLink>
          </TableCell>
          <TableCell>Growth</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <CellLink onClick={() => {}}>Globex</CellLink>
          </TableCell>
          <TableCell>Starter</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const root = within(canvasElement);
    const link = root.getByRole('link', { name: 'Acme Corporation' });
    const plain = root.getByText('Growth');
    await expect(getComputedStyle(link).fontSize).toBe(getComputedStyle(plain).fontSize);
  },
};
