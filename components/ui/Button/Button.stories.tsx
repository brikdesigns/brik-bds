import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './Button';
import { LinkButton } from './LinkButton';
import { IconButton } from './IconButton';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Button> = {
  title: 'Components/Action/button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'secondary', 'ghost', 'danger', 'danger-outline', 'danger-ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/* ─── Inline SVG Icons ────────────────────────────────────────── */

const ArrowRight = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8.354 1.646a.5.5 0 0 0-.708.708L12.793 7.5H2a.5.5 0 0 0 0 1h10.793l-5.147 5.146a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708l-6-6z" />
  </svg>
);

const Plus = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
  </svg>
);

const Download = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.1a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-2.1a.5.5 0 0 1 1 0v2.1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5v-2.1a.5.5 0 0 1 .5-.5z" />
    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
  </svg>
);

const Close = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
  </svg>
);

const Trash = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H5.5l1-1h3l1 1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
  </svg>
);

const Edit = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
  </svg>
);

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Row = ({ children, gap = 'var(--padding-sm)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: { variant: 'primary', size: 'md', children: 'Button' },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — All variants × all sizes in one grid
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      {(['primary', 'outline', 'secondary', 'ghost', 'danger', 'danger-outline', 'danger-ghost'] as const).map((variant) => (
        <div key={variant}>
          <SectionLabel>{variant}</SectionLabel>
          <Row>
            <Button variant={variant} size="sm">Small</Button>
            <Button variant={variant} size="md">Medium</Button>
            <Button variant={variant} size="lg">Large</Button>
            <Button variant={variant} size="md" disabled>Disabled</Button>
            <Button variant={variant} size="md" fullWidth>Full Width</Button>
          </Row>
        </div>
      ))}
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. ICONS — Icon slots across all sizes
   ═══════════════════════════════════════════════════════════════ */

export const Icons: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Icon positions</SectionLabel>
        <Row>
          <Button variant="primary" iconAfter={<ArrowRight />}>Get started</Button>
          <Button variant="outline" iconBefore={<Plus />}>Add item</Button>
          <Button variant="secondary" iconAfter={<Download />}>Download</Button>
          <Button variant="ghost" iconBefore={<Plus />}>New</Button>
        </Row>
      </div>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <SectionLabel>{size}</SectionLabel>
          <Row>
            <Button variant="primary" size={size} iconBefore={<Plus />}>Create</Button>
            <Button variant="outline" size={size} iconAfter={<ArrowRight />}>Continue</Button>
            <Button variant="ghost" size={size} iconBefore={<Download />}>Export</Button>
          </Row>
        </div>
      ))}
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   4. STATES — Hover, focus, disabled, loading across all variants
   ═══════════════════════════════════════════════════════════════ */

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Hover, click, and tab through to see all interactive states.',
      },
    },
  },
  render: () => (
    <Stack gap="var(--gap-huge)">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr',
        gap: 'var(--gap-lg) var(--gap-xl)',
        alignItems: 'center',
      }}>
        <div />
        <SectionLabel>Default</SectionLabel>
        <SectionLabel>Hover / Focus</SectionLabel>
        <SectionLabel>Disabled</SectionLabel>
        <SectionLabel>Loading</SectionLabel>

        {(['primary', 'outline', 'secondary', 'ghost', 'danger', 'danger-outline', 'danger-ghost'] as const).map((variant) => (
          <React.Fragment key={variant}>
            <SectionLabel>{variant}</SectionLabel>
            <Button variant={variant} size="md">Button</Button>
            <Button variant={variant} size="md">Hover me</Button>
            <Button variant={variant} size="md" disabled>Disabled</Button>
            <Button variant={variant} size="md" loading>Loading</Button>
          </React.Fragment>
        ))}
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   5. LOADING — Interactive toggle demo
   ═══════════════════════════════════════════════════════════════ */

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Click to simulate an async action. Spinner replaces text while preserving button width.',
      },
    },
  },
  render: () => {
    const [loading, setLoading] = useState(false);
    const handleClick = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };
    return (
      <Row gap="var(--gap-lg)">
        <Button variant="primary" loading={loading} onClick={handleClick}>Save Changes</Button>
        <Button variant="outline" loading={loading} onClick={handleClick}>Save Changes</Button>
        <Button variant="danger" loading={loading} onClick={handleClick}>Delete</Button>
      </Row>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   6. LINK BUTTON — Navigation styled as button
   ═══════════════════════════════════════════════════════════════ */

export const Link: Story = {
  name: 'LinkButton',
  render: () => (
    <Stack>
      <Row>
        <LinkButton href="#" variant="primary">Get started</LinkButton>
        <LinkButton href="#" variant="outline">Documentation</LinkButton>
        <LinkButton href="#" variant="ghost">Learn more</LinkButton>
      </Row>
      <Row>
        <LinkButton href="#" variant="primary" iconAfter={<ArrowRight />}>Sign up</LinkButton>
        <LinkButton href="#" variant="outline" iconAfter={<ArrowRight />}>View docs</LinkButton>
        <LinkButton href="#" variant="ghost" iconBefore={<Download />}>Download PDF</LinkButton>
      </Row>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   7. ICON BUTTON — Icon-only with accessible label
   ═══════════════════════════════════════════════════════════════ */

export const IconOnly: Story = {
  name: 'IconButton',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Standard</SectionLabel>
        <Row>
          <IconButton icon={<Close />} label="Close" variant="ghost" />
          <IconButton icon={<Edit />} label="Edit" variant="secondary" />
          <IconButton icon={<Plus />} label="Add" variant="primary" />
          <IconButton icon={<Download />} label="Download" variant="outline" />
        </Row>
      </div>
      <div>
        <SectionLabel>Danger</SectionLabel>
        <Row>
          <IconButton icon={<Trash />} label="Delete" variant="danger" />
          <IconButton icon={<Trash />} label="Delete" variant="danger-outline" />
          <IconButton icon={<Trash />} label="Delete" variant="danger-ghost" />
        </Row>
      </div>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Row>
          <IconButton icon={<Edit />} label="Edit" variant="secondary" size="sm" />
          <IconButton icon={<Edit />} label="Edit" variant="secondary" size="md" />
          <IconButton icon={<Edit />} label="Edit" variant="secondary" size="lg" />
        </Row>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   8. PATTERNS — Real-world compositions
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  name: 'Patterns',
  parameters: {
    docs: {
      description: {
        story: 'Real-world button compositions: confirmation dialogs, inline delete, and mixed actions.',
      },
    },
  },
  render: () => (
    <Stack gap="var(--gap-huge)">
      {/* Confirmation dialog */}
      <div>
        <SectionLabel>Confirmation dialog</SectionLabel>
        <div style={{
          padding: 'var(--padding-lg)',
          border: 'var(--border-width-sm) solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          maxWidth: '400px',
        }}>
          <div style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'var(--heading-sm)',
            marginBottom: 'var(--gap-sm)',
          }}>
            Delete project?
          </div>
          <div style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-sm)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--gap-xl)',
          }}>
            This action cannot be undone. All data will be permanently removed.
          </div>
          <Row>
            <Button variant="danger">Delete project</Button>
            <Button variant="ghost">Cancel</Button>
          </Row>
        </div>
      </div>

      {/* Inline delete */}
      <div>
        <SectionLabel>Inline delete</SectionLabel>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--padding-md)',
          border: 'var(--border-width-sm) solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          maxWidth: '400px',
        }}>
          <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)' }}>
            document-final-v2.pdf
          </span>
          <IconButton icon={<Trash />} label="Delete file" variant="danger-ghost" size="sm" />
        </div>
      </div>

      {/* Action bar */}
      <div>
        <SectionLabel>Action bar</SectionLabel>
        <Row gap="var(--gap-lg)">
          <Button variant="primary" iconAfter={<ArrowRight />}>Continue</Button>
          <Button variant="outline">Save draft</Button>
          <Button variant="danger-ghost">Discard</Button>
        </Row>
      </div>
    </Stack>
  ),
};
