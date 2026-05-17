import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardList } from './CardList';
import { Card, CardTitle, CardDescription, CardFooter } from '../Card/Card';
import { Button } from '../Button';

const meta: Meta<typeof CardList> = {
  title: 'Layouts/card-list',
  component: CardList,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    gap: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    fitContent: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CardList>;

/**
 * Layout wrapper for arrays of cards. Toggle `orientation`, `gap`, and
 * `fitContent` via Controls to exercise the full layout surface.
 *
 * @summary Stack of cards — orientation, gap, and fitContent via Controls
 */
export const Default: Story = {
  args: {
    orientation: 'vertical',
    gap: 'md',
    fitContent: false,
  },
  render: (args) => (
    <div style={{ width: 720 }}>
      <CardList {...args}>
        <Card variant="outlined" padding="md">
          <CardTitle as="h4">Card one</CardTitle>
          <CardDescription>Short description for the first card in the list.</CardDescription>
          <CardFooter><Button variant="outline" size="sm">View</Button></CardFooter>
        </Card>
        <Card variant="outlined" padding="md">
          <CardTitle as="h4">Card two</CardTitle>
          <CardDescription>Short description for the second card in the list.</CardDescription>
          <CardFooter><Button variant="outline" size="sm">View</Button></CardFooter>
        </Card>
        <Card variant="outlined" padding="md">
          <CardTitle as="h4">Card three</CardTitle>
          <CardDescription>Short description for the third card in the list.</CardDescription>
          <CardFooter><Button variant="outline" size="sm">View</Button></CardFooter>
        </Card>
      </CardList>
    </div>
  ),
};

/**
 * All four gap values side by side — `sm`, `md`, `lg`, `xl`.
 *
 * @summary Gap scale — sm / md / lg / xl
 */
export const GapScale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', maxWidth: 720 }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((g) => (
        <div key={g}>
          <p style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--gap-sm)' }}>{`gap = ${g}`}</p>
          <CardList orientation="horizontal" gap={g}>
            {[1, 2, 3].map((n) => (
              <Card key={n} variant="outlined" padding="md">
                <CardTitle as="h4">{`Card ${n}`}</CardTitle>
              </Card>
            ))}
          </CardList>
        </div>
      ))}
    </div>
  ),
};
