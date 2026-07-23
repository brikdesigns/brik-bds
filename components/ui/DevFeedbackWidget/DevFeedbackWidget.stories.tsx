import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrikDevBar } from '../BrikDevBar';
import { DevFeedbackWidget } from './DevFeedbackWidget';

/* ─── Layout helper (story-only) ──────────────────────── */

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      minHeight: 360,
      padding: 'var(--padding-xl)',
      fontFamily: 'var(--font-family-body)',
      color: 'var(--text-primary)',
    }}
  >
    {children}
  </div>
);

/**
 * Feedback widget — floating button (FAB) or a slot in the BrikDevBar shell.
 * @summary Dev/product feedback widget — FAB or DevBar slot
 */
const meta: Meta<typeof DevFeedbackWidget> = {
  title: 'Tools/dev-feedback-widget',
  component: DevFeedbackWidget,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: ['auto', 'slot', 'fab'],
      description: '`fab` renders a standalone floating button; `slot` registers with the DevBar shell; `auto` runtime-detects (default).',
    },
    endpoint: { control: 'text', description: 'POST endpoint for feedback submissions.' },
    contextLabel: { control: 'text', description: 'Label shown before the context value (e.g. "Page", "Story").' },
    getContextValue: { control: false, description: 'Returns the current context string (e.g. pathname or story name).' },
    fabPosition: { control: false, description: 'Standalone FAB position `{ bottom?, left?, right? }` when no DevBar is present.' },
    extraPayload: { control: false, description: 'Additional payload fields sent with every submission.' },
    page: { control: 'text', description: 'Human page name; falls back to the URL slug when unset.' },
    section: { control: 'text', description: 'Section label of the picked element (from the inspector).' },
    component: { control: 'text', description: 'BDS block class of the picked element (e.g. "bds-button").' },
    componentTitle: { control: 'text', description: 'Nearest BDS section title of the picked element.' },
    domPath: { control: 'text', description: 'Stable structural DOM path to the picked element.' },
  },
};

export default meta;
type Story = StoryObj<typeof DevFeedbackWidget>;

/* ─── Default — standalone FAB; toggle `variant` in Controls ─── */

/** @summary Feedback widget — toggle variant / endpoint via Controls */
export const Default: Story = {
  args: {
    variant: 'fab',
    endpoint: '/api/feedback',
    contextLabel: 'Story',
  },
  render: (args) => (
    <Frame>
      <p style={{ marginBottom: 'var(--gap-md)' }}>
        No DevBar present. <code>fab</code> renders the floating button; <code>auto</code> falls back to
        the FAB after its detection window.
      </p>
      <DevFeedbackWidget {...args} />
    </Frame>
  ),
};

/* ─── With DevBar — Q4 composition (registers into the shell) ── */

/**
 * Composed alongside `<BrikDevBar>`. `slot` seeds the shell immediately;
 * `auto` polls and settles into slot mode. The DevBar composition is what
 * args can't express — toggle `variant` to compare slot vs auto.
 *
 * @summary Feedback widget registered into the BrikDevBar shell
 */
export const WithDevBar: Story = {
  args: {
    variant: 'slot',
    endpoint: '/api/feedback',
    contextLabel: 'Story',
  },
  render: (args) => (
    <Frame>
      <p style={{ marginBottom: 'var(--gap-md)' }}>
        With the DevBar shell mounted, the widget registers as a slot instead of a FAB.
      </p>
      <BrikDevBar />
      <DevFeedbackWidget {...args} />
    </Frame>
  ),
};
