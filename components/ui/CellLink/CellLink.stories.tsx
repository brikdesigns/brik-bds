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
    onActivate: {
      control: false,
      description:
        'Anchor form only. Runs on a plain left-click after preventing navigation — e.g. open a sheet. Modified and middle clicks follow `href`.',
    },
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
 * `onActivate` keeps a real `href` but takes over a plain left-click — for a
 * cell that opens a sheet over the list. Cmd/Ctrl/Shift/Alt-click and
 * middle-click skip it, so the route still opens in a new tab.
 *
 * @summary Anchor that opens a sheet on plain click
 */
export const Activate: Story = {
  args: { href: '/companies/acme', children: 'Acme Corporation', onActivate: fn() },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Acme Corporation' });
    await expect(link).toHaveAttribute('href', '/companies/acme');
    await userEvent.click(link);
    await expect(args.onActivate).toHaveBeenCalledTimes(1);
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
