import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';
import { CREDIT_CARD_LOGOS, INTEGRATION_LOGOS } from './logos.generated';
import { Card, CardTitle, CardDescription } from '../Card';
import { Table, TableBody, TableRow, TableLogoCell, TableCell } from '../Table';

const meta: Meta<typeof Logo> = {
  title: 'Foundation/Assets/logo',
  component: Logo,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Full-color third-party / client brand mark from a bundled registry. Resolves offline (no runtime fetch) like `<Icon>`, but renders multi-fill brand art **exactly as authored** — never recolored. `set` (`credit-card` / `integration` / `client`) constrains the allowed `name`. Drops into any square media slot at the shared size scale — Card `media`, `TableLogoCell`, or the Card `logo` slot.',
      },
    },
  },
  argTypes: {
    set: {
      control: 'select',
      options: ['credit-card', 'integration', 'client'],
      description: 'Logo family — constrains the allowed `name`.',
    },
    name: {
      control: 'text',
      description: 'Mark within the set (e.g. `visa`, `notion`, `brik`).',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Square footprint on the Avatar scale — 32 / 40 / 48 / 64px.',
    },
    label: { control: 'text', description: 'Accessible-name override (defaults to the brand name).' },
    decorative: { control: 'boolean', description: 'Render aria-hidden when adjacent text names the brand.' },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

/** @summary Interactive playground */
export const Default: Story = {
  args: {
    set: 'integration',
    name: 'notion',
    size: 'lg',
  },
};

/** Every mark in the `credit-card` set — the payment-method row you'd render at
 *  a checkout or on a billing card. Side-by-side is the point: `name` is a
 *  Control, so the sidebar can't show the full set at once.
 *  @summary All credit-card marks */
export const CreditCard: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-md)', alignItems: 'center' }}>
      {CREDIT_CARD_LOGOS.map((name) => (
        <Logo key={name} set="credit-card" name={name} size="lg" />
      ))}
    </div>
  ),
};

/** Every mark in the `integration` set — third-party products a client account
 *  connects to. @summary All integration marks */
export const Integration: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-md)', alignItems: 'center' }}>
      {INTEGRATION_LOGOS.map((name) => (
        <Logo key={name} set="integration" name={name} size="lg" />
      ))}
    </div>
  ),
};

/** The four square footprints, keyed to the Avatar / Card-media scale.
 *  @summary Size scale sm / md / lg / xl */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-lg)', alignItems: 'flex-end' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} style={{ textAlign: 'center' }}>
          <Logo set="integration" name="figma" size={size} />
          <p
            style={{
              margin: 'var(--gap-sm) 0 0',
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            {size}
          </p>
        </div>
      ))}
    </div>
  ),
};

/** Logo dropped into the container media slots it's built for — the default
 *  Card `media={{ logo }}` slot and a `TableLogoCell`. Composition an
 *  args-driven story can't express. @summary In Card media + TableLogoCell */
export const InContainers: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-lg)', maxWidth: 420 }}>
      <Card media={{ logo: { set: 'integration', name: 'notion' } }}>
        <CardTitle as="h4">Notion</CardTitle>
        <CardDescription>Connected</CardDescription>
      </Card>
      <Table>
        <TableBody>
          <TableRow>
            <TableLogoCell logo={{ set: 'credit-card', name: 'visa' }} />
            <TableCell>Visa ending 4242</TableCell>
          </TableRow>
          <TableRow>
            <TableLogoCell logo={{ set: 'credit-card', name: 'mastercard' }} />
            <TableCell>Mastercard ending 5555</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
