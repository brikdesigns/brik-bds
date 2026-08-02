import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardList } from './CardList';
import { Card, CardTitle, CardDescription, CardFooter } from '../Card/Card';
import { Button } from '../Button';

const meta: Meta<typeof CardList> = {
  title: 'Cards/card-list',
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
 * @summary Card stack — orientation, gap, fitContent via Controls
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

/* `gap` is a Control on Default — the side-by-side scale lives in CardList.mdx
   as a docs-local demo (rule 5, #1489 / #1502). */
