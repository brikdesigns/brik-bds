import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertBanner } from './AlertBanner';
import { Button } from '../Button';

const meta: Meta<typeof AlertBanner> = {
  title: 'Components/Feedback/alert-banner',
  component: AlertBanner,
  tags: ['!manifest'], // deprecated — hide from MCP discovery (use Banner)
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    variant: { control: 'radio', options: ['warning', 'error', 'information'] },
  },
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%' }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    variant: 'information',
    action: <Button variant="primary" size="sm">Primary button</Button>,
  },
};

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Information</SectionLabel>
      <AlertBanner
        variant="information"
        title="New update available"
        description="Version 2.1 includes performance improvements and bug fixes"
        action={<Button variant="primary" size="sm">Update</Button>}
      />

      <SectionLabel>Warning</SectionLabel>
      <AlertBanner
        variant="warning"
        title="Storage almost full"
        description="You have used 90% of your available storage"
        action={<Button variant="primary" size="sm">Manage storage</Button>}
      />

      <SectionLabel>Error</SectionLabel>
      <AlertBanner
        variant="error"
        title="Connection failed"
        description="Unable to reach the server. Please check your internet connection."
        action={<Button variant="primary" size="sm">Retry</Button>}
      />

      <SectionLabel>Title only</SectionLabel>
      <AlertBanner
        variant="information"
        title="Your session will expire in 5 minutes"
      />
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <SectionLabel>System maintenance notice</SectionLabel>
      <AlertBanner
        variant="warning"
        title="Scheduled maintenance"
        description="The system will be unavailable on Saturday from 2:00 AM to 4:00 AM EST."
      />

      <SectionLabel>Error with retry action</SectionLabel>
      <AlertBanner
        variant="error"
        title="Payment failed"
        description="Your payment method was declined. Please update your billing information."
        action={<Button variant="primary" size="sm">Update payment</Button>}
      />

      <SectionLabel>Informational with learn more</SectionLabel>
      <AlertBanner
        variant="information"
        title="New permissions model"
        description="We've updated how roles and permissions work. Your existing settings have been preserved."
        action={<Button variant="outline" size="sm">Learn more</Button>}
      />
    </Stack>
  ),
};
