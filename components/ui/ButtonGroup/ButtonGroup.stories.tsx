import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/Action/button-group',
  component: ButtonGroup,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

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

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </ButtonGroup>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Orientations, widths, sizes
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Horizontal (default)</SectionLabel>
        <ButtonGroup>
          <Button variant="primary">Save</Button>
          <Button variant="outline">Preview</Button>
          <Button variant="ghost">Cancel</Button>
        </ButtonGroup>
      </div>
      <div>
        <SectionLabel>Vertical</SectionLabel>
        <ButtonGroup orientation="vertical">
          <Button variant="primary" fullWidth>Sign up</Button>
          <Button variant="outline" fullWidth>Log in</Button>
        </ButtonGroup>
      </div>
      <div>
        <SectionLabel>Full width</SectionLabel>
        <div style={{ width: 400 }}>
          <ButtonGroup fullWidth>
            <Button variant="primary" fullWidth>Confirm</Button>
            <Button variant="secondary" fullWidth>Cancel</Button>
          </ButtonGroup>
        </div>
      </div>
      <div>
        <SectionLabel>Small buttons</SectionLabel>
        <ButtonGroup>
          <Button variant="primary" size="sm">Accept</Button>
          <Button variant="ghost" size="sm">Decline</Button>
        </ButtonGroup>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Dialog actions</SectionLabel>
        <ButtonGroup>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save changes</Button>
        </ButtonGroup>
      </div>
      <div>
        <SectionLabel>Destructive confirmation</SectionLabel>
        <ButtonGroup>
          <Button variant="ghost">Keep</Button>
          <Button variant="danger">Delete project</Button>
        </ButtonGroup>
      </div>
      <div>
        <SectionLabel>Form footer</SectionLabel>
        <div style={{ width: 400 }}>
          <ButtonGroup fullWidth>
            <Button variant="secondary" fullWidth>Back</Button>
            <Button variant="primary" fullWidth>Continue</Button>
          </ButtonGroup>
        </div>
      </div>
    </Stack>
  ),
};
