import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { Button } from './Button';
import { LinkButton } from './LinkButton';
import { IconButton } from './IconButton';

/**
 * Button — primary action element. Nine visual variants split into brand
 * (primary, outline, secondary, ghost, inverse, on-color) and system
 * (selected, destructive, positive). Five sizes (`tiny`/`sm`/`md`/`lg`/`xl`).
 * @summary Primary action element with variant and size axes
 */
const meta: Meta<typeof Button> = {
  title: 'Components/Action/button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'outline', 'secondary', 'ghost', 'inverse', 'on-color', 'destructive', 'positive', 'selected'] },
    size: { control: 'select', options: ['tiny', 'sm', 'md', 'lg', 'xl'] },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/* ─── Inline icons (story-only) ──────────────────────────────── */

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

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--padding-sm)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/* ─── Sandbox ────────────────────────────────────────────────── */

/** Args-driven sandbox. Includes a basic click-fires-onClick interaction test.
 *  @summary Live playground with interaction test */
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

/** Disabled buttons must not fire onClick. Asserts the contract.
 *  @summary Interaction test: disabled blocks click */
export const DisabledClickBlocked: Story = {
  args: { variant: 'primary', size: 'md', children: 'Submit', disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Submit' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/* ─── Axis galleries (ADR-006 exception) ─────────────────────── */

/** All nine variants side-by-side at one size. ADR-006 axis-gallery exception.
 *  @summary All variants rendered together */
export const Variants: Story = {
  render: () => {
    const brandVariants = ['primary', 'outline', 'secondary', 'ghost'] as const;
    const inverseVariant = 'inverse' as const;
    const onColorVariant = 'on-color' as const;
    const systemVariants = ['selected', 'destructive', 'positive'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        <Row>
          {brandVariants.map((v) => <Button key={v} variant={v} size="md">{v}</Button>)}
        </Row>
        <div style={{ background: 'var(--surface-inverse)', padding: 'var(--padding-md)', borderRadius: 'var(--border-radius-md)' }}>
          <Button variant={inverseVariant} size="md">{inverseVariant}</Button>
        </div>
        <div style={{ background: 'var(--surface-brand-primary)', padding: 'var(--padding-md)', borderRadius: 'var(--border-radius-md)' }}>
          <Button variant={onColorVariant} size="md">{onColorVariant}</Button>
        </div>
        <Row>
          {systemVariants.map((v) => <Button key={v} variant={v} size="md">{v}</Button>)}
        </Row>
      </div>
    );
  },
};

/** All five sizes side-by-side at one variant. ADR-006 axis-gallery exception.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
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

/* ─── Content shapes ─────────────────────────────────────────── */

/** Leading icon — common for "create"/"add" actions.
 *  @summary Button with leading icon */
export const WithIconBefore: Story = {
  args: { variant: 'outline', children: 'Add item', iconBefore: <Plus /> },
};

/** Trailing icon — common for "next"/"continue" actions.
 *  @summary Button with trailing icon */
export const WithIconAfter: Story = {
  args: { variant: 'primary', children: 'Get started', iconAfter: <ArrowRight /> },
};

/* ─── States ─────────────────────────────────────────────────── */

/** Disabled state.
 *  @summary Disabled button */
export const Disabled: Story = {
  args: { variant: 'primary', children: 'Submit', disabled: true },
};

/** Loading state with `useState` toggle — clicks trigger a 2s simulated async
 *  action. Spinner replaces text while preserving button width.
 *  @summary Interactive loading toggle */
export const Loading: Story = {
  render: () => {
    const Demo = () => {
      const [loading, setLoading] = useState(false);
      const handleClick = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      };
      return (
        <Row>
          <Button variant="primary" loading={loading} onClick={handleClick}>Save changes</Button>
          <Button variant="outline" loading={loading} onClick={handleClick}>Save changes</Button>
          <Button variant="destructive" loading={loading} onClick={handleClick}>Delete</Button>
        </Row>
      );
    };
    return <Demo />;
  },
};

/* ─── Sibling components ─────────────────────────────────────── */

/** LinkButton — the `<a>`-rendered sibling of Button. Same variants and sizes.
 *  Use when the action is navigation (has `href`) instead of a click handler.
 *  @summary LinkButton sibling — anchor with Button styling */
export const LinkButtonShowcase: Story = {
  name: 'LinkButton',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      <Row>
        <LinkButton href="#" variant="primary">Get started</LinkButton>
        <LinkButton href="#" variant="outline">Documentation</LinkButton>
        <LinkButton href="#" variant="ghost">Learn more</LinkButton>
      </Row>
      <Row>
        <LinkButton href="#" variant="primary" iconAfter={<ArrowRight />}>Sign up</LinkButton>
        <LinkButton href="#" variant="ghost" iconBefore={<Download />}>Download PDF</LinkButton>
      </Row>
    </div>
  ),
};

/** IconButton — the icon-only sibling of Button. Requires `label` for accessibility.
 *  @summary IconButton sibling — icon-only with accessible label */
export const IconButtonShowcase: Story = {
  name: 'IconButton',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
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
        <IconButton icon={<Plus />} label="Add" size="tiny" />
        <IconButton icon={<Plus />} label="Add" size="sm" />
        <IconButton icon={<Plus />} label="Add" size="md" />
        <IconButton icon={<Plus />} label="Add" size="lg" />
        <IconButton icon={<Plus />} label="Add" size="xl" />
      </Row>
    </div>
  ),
};
