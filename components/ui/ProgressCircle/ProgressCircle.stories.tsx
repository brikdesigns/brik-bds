import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressCircle } from './ProgressCircle';

/* ─── Layout helpers (story-only) ─────────────────────── */

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

const Row = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap, flexWrap: 'wrap' as const }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof ProgressCircle> = {
  title: 'Components/Feedback/progress-circle',
  component: ProgressCircle,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: { type: 'inline-radio' }, options: ['sm', 'md', 'lg'] },
    status: { control: { type: 'inline-radio' }, options: ['default', 'positive', 'warning', 'negative'] },
    label: { control: 'text' },
    showValue: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressCircle>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    value: 72,
    size: 'md',
    status: 'default',
    showValue: true,
    label: 'Onboarding completion',
    indeterminate: false,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. SIZES — sm / md / lg side by side
   ═══════════════════════════════════════════════════════════════ */

/** @summary All three diameter presets */
export const Sizes: Story = {
  render: () => (
    <Row>
      <div>
        <SectionLabel>sm — 64px</SectionLabel>
        <ProgressCircle value={50} size="sm" showValue label="Small" />
      </div>
      <div>
        <SectionLabel>md — 96px</SectionLabel>
        <ProgressCircle value={50} size="md" showValue label="Medium" />
      </div>
      <div>
        <SectionLabel>lg — 128px</SectionLabel>
        <ProgressCircle value={50} size="lg" showValue label="Large" />
      </div>
    </Row>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. STATUSES — default / positive / warning / negative
   ═══════════════════════════════════════════════════════════════ */

/** @summary Each canonical status token applied as fill */
export const Statuses: Story = {
  render: () => (
    <Row>
      <div>
        <SectionLabel>default (brand)</SectionLabel>
        <ProgressCircle value={72} status="default" showValue label="Default" />
      </div>
      <div>
        <SectionLabel>positive</SectionLabel>
        <ProgressCircle value={100} status="positive" showValue label="Complete" />
      </div>
      <div>
        <SectionLabel>warning</SectionLabel>
        <ProgressCircle value={45} status="warning" showValue label="At risk" />
      </div>
      <div>
        <SectionLabel>negative</SectionLabel>
        <ProgressCircle value={15} status="negative" showValue label="Failing" />
      </div>
    </Row>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   4. MATRIX — every size × status combination
   ═══════════════════════════════════════════════════════════════ */

/** @summary Full size × status matrix */
export const Matrix: Story = {
  render: () => {
    const statuses = ['default', 'positive', 'warning', 'negative'] as const;
    const sizes = ['sm', 'md', 'lg'] as const;
    return (
      <Stack>
        {statuses.map((status) => (
          <div key={status}>
            <SectionLabel>{status}</SectionLabel>
            <Row>
              {sizes.map((size) => (
                <ProgressCircle
                  key={size}
                  value={62}
                  size={size}
                  status={status}
                  showValue
                  label={`${status} ${size}`}
                />
              ))}
            </Row>
          </div>
        ))}
      </Stack>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   5. CUSTOM CENTER — arbitrary node content
   ═══════════════════════════════════════════════════════════════ */

/** @summary Centered slot accepts any ReactNode for custom labels */
export const CustomCenter: Story = {
  render: () => (
    <Row>
      <ProgressCircle
        value={70}
        size="lg"
        showValue={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--heading-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
              70%
            </div>
            <div style={{ fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
              of 200
            </div>
          </div>
        }
        label="Tasks complete"
      />
      <ProgressCircle
        value={3}
        size="lg"
        showValue={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--heading-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
              3
            </div>
            <div style={{ fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
              of 7 days
            </div>
          </div>
        }
        label="Streak"
      />
    </Row>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   6. INDETERMINATE — animated continuous spin
   ═══════════════════════════════════════════════════════════════ */

/** @summary Continuous spin for unknown-duration progress */
export const Indeterminate: Story = {
  render: () => (
    <Row>
      <ProgressCircle value={0} size="sm" indeterminate label="Loading small" />
      <ProgressCircle value={0} size="md" indeterminate label="Loading medium" />
      <ProgressCircle value={0} size="lg" indeterminate label="Loading large" />
    </Row>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   7. PATTERNS — animated determinate fill, dashboard widget
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  render: () => {
    function Animated() {
      const [progress, setProgress] = useState(0);
      useEffect(() => {
        const t = setInterval(() => {
          setProgress((p) => (p >= 100 ? 0 : p + 1));
        }, 60);
        return () => clearInterval(t);
      }, []);
      return (
        <Stack>
          <div>
            <SectionLabel>Animated determinate</SectionLabel>
            <ProgressCircle value={progress} size="lg" showValue label="Loading" />
          </div>
          <div>
            <SectionLabel>Dashboard widget</SectionLabel>
            <ProgressCircle
              value={68}
              size="lg"
              status="positive"
              showValue={
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--heading-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                    68%
                  </div>
                  <div style={{ fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
                    on track
                  </div>
                </div>
              }
              label="Quarter progress"
            />
          </div>
        </Stack>
      );
    }
    return <Animated />;
  },
};
