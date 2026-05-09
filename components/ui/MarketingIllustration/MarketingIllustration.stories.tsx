import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingIllustration } from './MarketingIllustration';

const meta: Meta<typeof MarketingIllustration> = {
  title: 'Components/Marketing/marketing-illustration',
  component: MarketingIllustration,
  tags: ['surface-web'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Composable illustration scene primitive. Composes Avatars, photo circles, chat bubbles, message tiles, and accent shapes into a marketing-callout illustration. Replaces the per-consumer pattern of reinventing absolute-positioned scene compositions in repo-local CSS (BDS #480; surfaced in the `support_plan_callout_split` blueprint spec — PR #477).',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['persona-cluster'] },
    ratio: { control: 'select', options: ['square', 'portrait', 'landscape'] },
  },
};

export default meta;
type Story = StoryObj<typeof MarketingIllustration>;

/* ─── Story-only: stable demo avatars (data URI, no network) ─── */

const personaA =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#e4b596"/><circle cx="32" cy="26" r="10" fill="#fff"/><path d="M12 60c4-12 14-18 20-18s16 6 20 18z" fill="#fff"/></svg>',
  );

const personaB =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#a8c8b8"/><circle cx="32" cy="26" r="10" fill="#fff"/><path d="M12 60c4-12 14-18 20-18s16 6 20 18z" fill="#fff"/></svg>',
  );

/* ═══════════════════════════════════════════════════════════════
   PLAYGROUND
   ═══════════════════════════════════════════════════════════════ */

/** @summary Default persona-cluster — 5 tiles, square aspect */
export const Playground: Story = {
  args: {
    variant: 'persona-cluster',
    ratio: 'square',
    tiles: [
      { kind: 'avatar', src: personaA, alt: 'Strategist Sam', name: 'Sam' },
      { kind: 'chat-bubble', content: 'How can I help today?', accent: 'inverse' },
      { kind: 'message', accent: 'positive' },
      { kind: 'photo', src: personaB, alt: 'Operations Olivia' },
      { kind: 'chat-bubble', content: 'We need an email campaign', accent: 'neutral' },
    ],
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <MarketingIllustration {...args} />
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   BLUEPRINT FIXTURE — what `support_plan_callout_split` would pass
   ═══════════════════════════════════════════════════════════════ */

/** @summary Fixture matching the support_plan_callout_split blueprint — Brik Marketing Support */
export const SupportPlanCallout: Story = {
  args: {
    variant: 'persona-cluster',
    ratio: 'square',
    tiles: [
      { kind: 'avatar', src: personaA, alt: 'Marketing Strategist', name: 'Sam' },
      { kind: 'chat-bubble', content: 'How can I help today?', accent: 'inverse' },
      { kind: 'message', accent: 'positive' },
      { kind: 'photo', src: personaB, alt: 'Client' },
      { kind: 'chat-bubble', content: 'We need an email campaign', accent: 'brand-primary' },
    ],
  },
  render: (args) => (
    <div style={{ width: 520 }}>
      <MarketingIllustration {...args} />
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   ACCENT FILLS
   ═══════════════════════════════════════════════════════════════ */

/** @summary All accent options across chat-bubble + message + shape kinds */
export const AccentFills: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--gap-lg)',
        width: 720,
      }}
    >
      {(['brand-primary', 'positive', 'neutral', 'inverse'] as const).map((accent) => (
        <div key={accent}>
          <h4
            style={{
              margin: '0 0 var(--gap-sm)',
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            accent={accent}
          </h4>
          <MarketingIllustration
            variant="persona-cluster"
            ratio="square"
            tiles={[
              { kind: 'avatar', src: personaA, alt: '' },
              { kind: 'chat-bubble', content: 'Hello', accent },
              { kind: 'message', accent },
              { kind: 'photo', src: personaB, alt: '' },
              { kind: 'shape', accent },
            ]}
          />
        </div>
      ))}
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   ASPECT RATIOS
   ═══════════════════════════════════════════════════════════════ */

/** @summary square / portrait / landscape — slot positions adapt */
export const RatioVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--gap-lg)',
        width: 960,
      }}
    >
      {(['square', 'portrait', 'landscape'] as const).map((ratio) => (
        <div key={ratio}>
          <h4
            style={{
              margin: '0 0 var(--gap-sm)',
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            ratio={ratio}
          </h4>
          <MarketingIllustration
            variant="persona-cluster"
            ratio={ratio}
            tiles={[
              { kind: 'avatar', src: personaA, alt: '' },
              { kind: 'chat-bubble', content: 'Hi', accent: 'inverse' },
              { kind: 'message', accent: 'positive' },
              { kind: 'photo', src: personaB, alt: '' },
              { kind: 'chat-bubble', content: 'Hello', accent: 'neutral' },
            ]}
          />
        </div>
      ))}
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   MINIMAL — fewer tiles
   ═══════════════════════════════════════════════════════════════ */

/** @summary 2-tile minimum — avatar + single bubble */
export const Minimal: Story = {
  args: {
    variant: 'persona-cluster',
    ratio: 'square',
    tiles: [
      { kind: 'avatar', src: personaA, alt: 'Strategist' },
      { kind: 'chat-bubble', content: 'How can I help today?', accent: 'inverse' },
    ],
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <MarketingIllustration {...args} />
    </div>
  ),
};
