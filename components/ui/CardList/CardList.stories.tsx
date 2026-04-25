import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardList } from './CardList';
import { Card, CardTitle, CardDescription, CardFooter } from '../Card/Card';
import { CardTestimonial } from '../CardTestimonial';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof CardList> = {
  title: 'Displays/Card/card-list',
  component: CardList,
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    gap: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    fitContent: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CardList>;

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%', maxWidth: 1100 }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
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
        </Card>
        <Card variant="outlined" padding="md">
          <CardTitle as="h4">Card two</CardTitle>
          <CardDescription>Short description for the second card in the list.</CardDescription>
        </Card>
        <Card variant="outlined" padding="md">
          <CardTitle as="h4">Card three</CardTitle>
          <CardDescription>Short description for the third card in the list.</CardDescription>
        </Card>
      </CardList>
    </div>
  ),
};

/* ─── Vertical layout ────────────────────────────────────────── */

export const Vertical: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Vertical — generic Card</SectionLabel>
      <div style={{ width: 480 }}>
        <CardList orientation="vertical" gap="md">
          <Card variant="outlined" padding="md">
            <CardTitle as="h4">Quarterly report</CardTitle>
            <CardDescription>Summary of Q1 performance across all channels.</CardDescription>
            <CardFooter>
              <Button variant="outline" size="sm">View</Button>
            </CardFooter>
          </Card>
          <Card variant="outlined" padding="md">
            <CardTitle as="h4">Team update</CardTitle>
            <CardDescription>New hires, role changes, and milestones this month.</CardDescription>
            <CardFooter>
              <Button variant="outline" size="sm">View</Button>
            </CardFooter>
          </Card>
          <Card variant="outlined" padding="md">
            <CardTitle as="h4">Product roadmap</CardTitle>
            <CardDescription>Upcoming features planned for the next two quarters.</CardDescription>
            <CardFooter>
              <Button variant="outline" size="sm">View</Button>
            </CardFooter>
          </Card>
        </CardList>
      </div>

    </Stack>
  ),
};

/* ─── Horizontal layout ──────────────────────────────────────── */

export const Horizontal: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Horizontal — equal columns (default)</SectionLabel>
      <CardList orientation="horizontal" gap="lg">
        <Card variant="outlined" padding="lg">
          <Badge>Design</Badge>
          <CardTitle>Design</CardTitle>
          <CardDescription>Brand, identity, and design systems.</CardDescription>
          <CardFooter>
            <Button variant="outline" size="sm">Learn more</Button>
          </CardFooter>
        </Card>
        <Card variant="outlined" padding="lg">
          <Badge>Development</Badge>
          <CardTitle>Development</CardTitle>
          <CardDescription>Full-stack product engineering.</CardDescription>
          <CardFooter>
            <Button variant="outline" size="sm">Learn more</Button>
          </CardFooter>
        </Card>
        <Card variant="outlined" padding="lg">
          <Badge>Strategy</Badge>
          <CardTitle>Strategy</CardTitle>
          <CardDescription>Roadmapping and growth operations.</CardDescription>
          <CardFooter>
            <Button variant="outline" size="sm">Learn more</Button>
          </CardFooter>
        </Card>
      </CardList>

      <SectionLabel>Horizontal — CardTestimonial (brand + outlined)</SectionLabel>
      <CardList orientation="horizontal" gap="lg">
        <CardTestimonial
          variant="brand"
          quote="Square has completely transformed how we handle payments. The analytics alone have helped us grow 40% this year."
          authorName="Sarah Chen"
          authorRole="Owner, Bloom Cafe"
          rating={5}
        />
        <CardTestimonial
          variant="outlined"
          quote="Professional, responsive, and creative. Our new site has driven 3x more leads."
          authorName="Marcus Johnson"
          authorRole="Marketing Director, Apex Corp"
          rating={5}
        />
        <CardTestimonial
          variant="brand"
          quote="Working with this team felt like an extension of our own company."
          authorName="Emily Rodriguez"
          authorRole="CEO, Greenfield Digital"
          rating={4}
        />
      </CardList>
    </Stack>
  ),
};

/* ─── Fit content ────────────────────────────────────────────── */

export const HorizontalFitContent: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Horizontal — fitContent (items size to own width)</SectionLabel>
      <CardList orientation="horizontal" gap="md" fitContent>
        <Card variant="outlined" padding="md" style={{ width: 200 }}>
          <CardTitle as="h4">200px</CardTitle>
          <CardDescription>Fixed width card.</CardDescription>
        </Card>
        <Card variant="outlined" padding="md" style={{ width: 280 }}>
          <CardTitle as="h4">280px</CardTitle>
          <CardDescription>Different fixed width.</CardDescription>
        </Card>
        <Card variant="outlined" padding="md" style={{ width: 160 }}>
          <CardTitle as="h4">160px</CardTitle>
          <CardDescription>Narrowest card.</CardDescription>
        </Card>
      </CardList>
    </Stack>
  ),
};

/* ─── Gap scale ──────────────────────────────────────────────── */

export const GapScale: Story = {
  render: () => (
    <Stack>
      {(['sm', 'md', 'lg', 'xl'] as const).map((g) => (
        <div key={g}>
          <SectionLabel>{`gap = ${g}`}</SectionLabel>
          <CardList orientation="horizontal" gap={g}>
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} variant="outlined" padding="md">
                <CardTitle as="h4">{`Card ${n}`}</CardTitle>
              </Card>
            ))}
          </CardList>
        </div>
      ))}
    </Stack>
  ),
};
