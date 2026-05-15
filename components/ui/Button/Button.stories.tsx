import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { useState } from 'react';
import { Button } from './Button';
import { LinkButton } from './LinkButton';
import { IconButton } from './IconButton';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Button> = {
  title: 'Components/Action/button',
  component: Button,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Button label. Accepts ReactNode for inline composition.',
    },
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'secondary', 'ghost', 'inverse', 'on-color', 'destructive', 'positive', 'selected'],
      description:
        'Brand hierarchy: `primary` → `outline` → `secondary` → `ghost`. ' +
        '`inverse` for inverse surfaces; `on-color` for brand-primary surfaces. ' +
        'System: `destructive`, `positive`, `selected`. ' +
        'Legacy aliases (`danger`, `danger-outline`, `danger-ghost`) are TS-valid but prefer `destructive`.',
    },
    size: {
      control: 'select',
      options: ['tiny', 'sm', 'md', 'lg', 'xl'],
      description: 'Size token on the 4-point grid. Default `md`.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill the container width.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the button — non-interactive, muted appearance, blocks `onClick`.',
    },
    loading: {
      control: 'boolean',
      description: 'Async-pending state — spinner replaces label, width preserved, click blocked.',
    },
    iconBefore: {
      control: false,
      description: 'Optional leading icon node. Common for actions like Add / Download.',
    },
    iconAfter: {
      control: false,
      description: 'Optional trailing icon node. Common for forward-motion CTAs.',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler. Not invoked when `disabled` or `loading`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/* ─── Inline SVG Icons (story-only) ───────────────────────────── */

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

/* ─── Layout helpers (story-only) ─────────────────────────────── */

const Row = ({ children, gap = 'var(--padding-sm)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const InverseSurface = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'var(--surface-inverse)', padding: 'var(--padding-md)', borderRadius: 'var(--border-radius-md)' }}>
    {children}
  </div>
);

const BrandSurface = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'var(--surface-brand-primary)', padding: 'var(--padding-md)', borderRadius: 'var(--border-radius-md)' }}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PLAYGROUND
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: { variant: 'primary', size: 'md', children: 'Button', onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button' });

    await expect(button).toBeVisible();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** @summary Interaction test — disabled blocks click */
export const InteractionTestDisabled: Story = {
  tags: ['!manifest'],
  args: { variant: 'primary', size: 'md', children: 'Submit', disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Submit' });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — one story per variant (brand hierarchy)
   ═══════════════════════════════════════════════════════════════ */

/** @summary Primary — highest emphasis brand action */
export const Primary: Story = {
  args: { variant: 'primary', size: 'md', children: 'Get started' },
};

/** @summary Outline — secondary emphasis with brand-color outline */
export const Outline: Story = {
  args: { variant: 'outline', size: 'md', children: 'Learn more' },
};

/** @summary Secondary — neutral emphasis on secondary surface */
export const Secondary: Story = {
  args: { variant: 'secondary', size: 'md', children: 'Save draft' },
};

/** @summary Ghost — lowest emphasis, no surface, no border */
export const Ghost: Story = {
  args: { variant: 'ghost', size: 'md', children: 'Cancel' },
};

/** @summary Inverse — designed for use on inverse / dark surfaces */
export const Inverse: Story = {
  args: { variant: 'inverse', size: 'md', children: 'Continue' },
  decorators: [(StoryFn) => <InverseSurface><StoryFn /></InverseSurface>],
};

/** @summary OnColor — designed for use on brand-primary surfaces */
export const OnColor: Story = {
  args: { variant: 'on-color', size: 'md', children: 'Sign up' },
  decorators: [(StoryFn) => <BrandSurface><StoryFn /></BrandSurface>],
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — system / semantic actions
   ═══════════════════════════════════════════════════════════════ */

/** @summary Selected — indicates an active filter or selection */
export const Selected: Story = {
  args: { variant: 'selected', size: 'md', children: 'Active' },
};

/** @summary Destructive — irreversible actions like delete or discard */
export const Destructive: Story = {
  args: { variant: 'destructive', size: 'md', children: 'Delete project' },
};

/** @summary Positive — confirmation of a beneficial action */
export const Positive: Story = {
  args: { variant: 'positive', size: 'md', children: 'Approve' },
};

/* ═══════════════════════════════════════════════════════════════
   AXIS-ONLY GALLERY (ADR-006 exception)
   `disabled` / `loading` / `iconBefore` / `iconAfter` / `fullWidth`
   collapsed to Controls per ADR-010 Q2.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Sizes axis — qualifies as the ADR-006 §"axis-only gallery" exception:
 * one component, one variant, the size axis varied. Useful for visually
 * comparing the size scale at a glance — sidebar order isn't enough.
 *
 * @summary All five sizes side-by-side
 */
export const Sizes: Story = {
  parameters: { docs: { description: { story: 'Axis-only gallery showing the five size tokens (tiny/sm/md/lg/xl) on the primary variant.' } } },
  render: () => (
    <Row>
      <Button variant="primary" size="tiny">Tiny</Button>
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="md">Medium</Button>
      <Button variant="primary" size="lg">Large</Button>
      <Button variant="primary" size="xl">X-Large</Button>
    </Row>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   IRREDUCIBLE — sibling components + stateful demos
   ═══════════════════════════════════════════════════════════════ */

/**
 * `LinkButton` — same visual as `Button` but renders an `<a href>` for
 * navigation. Lives in this stories file because it shares the Button
 * design vocabulary; render-mode shows the cross-variant set since the
 * sibling component doesn't have its own dedicated stories file.
 *
 * @summary LinkButton — anchor-rendered button for navigation
 */
export const LinkButtonShowcase: Story = {
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

/**
 * `IconButton` — square button for icon-only actions, with required
 * `label` prop for assistive tech. Same variants and sizes as Button.
 *
 * @summary IconButton — icon-only button with accessible label
 */
export const IconButtonShowcase: Story = {
  name: 'IconButton',
  render: () => (
    <Stack>
      <Row>
        <IconButton icon={<Plus />} label="Add" variant="primary" />
        <IconButton icon={<Edit />} label="Edit" variant="secondary" />
        <IconButton icon={<Download />} label="Download" variant="outline" />
        <IconButton icon={<Close />} label="Close" variant="ghost" />
      </Row>
      <Row>
        <IconButton icon={<Trash />} label="Delete" variant="destructive" />
        <IconButton icon={<Plus />} label="Approve" variant="positive" />
      </Row>
      <Row>
        <IconButton icon={<Plus />} label="Add" variant="primary" size="tiny" />
        <IconButton icon={<Plus />} label="Add" variant="primary" size="sm" />
        <IconButton icon={<Plus />} label="Add" variant="primary" size="md" />
        <IconButton icon={<Plus />} label="Add" variant="primary" size="lg" />
        <IconButton icon={<Plus />} label="Add" variant="primary" size="xl" />
      </Row>
    </Stack>
  ),
};

/**
 * Loading state wired up to local state — click to simulate an async
 * action. Spinner replaces text while preserving button width. Play-only
 * regression demo; the canonical loading docs are the Playground `loading`
 * control.
 *
 * @summary Loading toggle — play-only interaction demo
 */
export const LoadingToggle: Story = {
  tags: ['!manifest'],
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
        <Button variant="destructive" loading={loading} onClick={handleClick}>Delete</Button>
      </Row>
    );
  },
};

