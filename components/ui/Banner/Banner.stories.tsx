import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Banner } from './Banner';
import { Button } from '../Button';

const meta: Meta<typeof Banner> = {
  title: 'Components/Feedback/marketing-banner',
  component: Banner,
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

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

const BannerAction = ({ children }: { children: string }) => (
  <Button variant="on-color" size="md">{children}</Button>
);

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    action: <BannerAction>Learn more</BannerAction>,
  },
};

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>With action</SectionLabel>
      <Banner
        title="Limited time offer"
        description="Save 20% on all plans this month"
        action={<BannerAction>View plans</BannerAction>}
      />

      <SectionLabel>Title only</SectionLabel>
      <Banner title="New feature available" />

      <SectionLabel>Dismissible</SectionLabel>
      <Banner
        title="Cookie notice"
        description="We use cookies to improve your experience"
        action={<BannerAction>Accept</BannerAction>}
        onDismiss={() => {}}
      />
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <Stack>
        <SectionLabel>Announcement banner</SectionLabel>
        <Banner
          title="v2.0 is here"
          description="Check out the new features and improvements"
          action={<BannerAction>What&apos;s new</BannerAction>}
        />

        <SectionLabel>Dismissible with toggle</SectionLabel>
        {visible ? (
          <Banner
            title="Welcome back"
            description="You have 3 unread notifications"
            onDismiss={() => setVisible(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setVisible(true)}
            style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Show banner again
          </button>
        )}
      </Stack>
    );
  },
};
