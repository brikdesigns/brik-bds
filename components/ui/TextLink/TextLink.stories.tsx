import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextLink } from './TextLink';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TextLink> = {
  title: 'Components/text-link',
  component: TextLink,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Size variant. `default` is body-md; `small` is body-sm for tight contexts (footnotes, captions).',
    },
    underline: {
      control: 'select',
      options: ['hover', 'always'],
      description:
        'Underline visibility. `hover` (default) reveals the underline on hover only — for a standalone link. `always` keeps the underline visible at rest — required for a link embedded inline in running prose (WCAG 1.4.1 Use of Color).',
    },
    href: {
      control: 'text',
      description: 'Link destination. Any standard URL or anchor.',
    },
    children: {
      control: 'text',
      description: 'Link text. Accepts ReactNode for inline composition (e.g., inline icons).',
    },
    target: {
      control: 'select',
      options: ['_self', '_blank', '_parent', '_top'],
      description:
        'Anchor target. Pair `target="_blank"` with `rel="noopener noreferrer"` for security on external links.',
    },
    rel: {
      control: 'text',
      description:
        'Anchor relationship. For external links, use `"noopener noreferrer"` to prevent tab-nabbing.',
    },
    iconBefore: {
      control: false,
      description: 'Optional leading icon node (e.g. `<Icon icon="ph:arrow-left" />`).',
    },
    iconAfter: {
      control: false,
      description:
        'Optional trailing icon node. Common pattern for external links: `<Icon icon="ph:arrow-square-out" />`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextLink>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. Size is the only Q3-candidate prop (2 values:
   default / small), exposed via Controls. External-link behavior
   (target=_blank + rel) is set via standard anchor attribute Controls,
   not a separate story — the component has no "external" variant.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Themed inline anchor link */
export const Default: Story = {
  args: {
    href: '#',
    size: 'default',
    underline: 'hover',
    children: 'Learn more',
  },
};

/* ═══════════════════════════════════════════════════════════════
   ALWAYS-UNDERLINED — Q3 per ADR-010: `underline="always"` is a
   semantic starting point an agent reaches for when placing a link
   inline in running prose (color alone isn't a sufficient cue —
   WCAG 1.4.1 Use of Color), so it earns its own dedicated story
   rather than collapsing to Controls-only.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Persistent underline at rest — for links inline in prose */
export const AlwaysUnderlined: Story = {
  args: {
    href: '#',
    size: 'default',
    underline: 'always',
    children: 'Learn more',
  },
};

/* ═══════════════════════════════════════════════════════════════
   IN-PARAGRAPH — Q4 irreducible per ADR-010. Demonstrates how the
   link visually integrates with flowing paragraph text (baseline
   alignment, color contrast against body text, underline behavior).
   Surrounding text is structural, not a component prop, so this
   case can't be expressed via args alone. Uses `underline="always"`
   — an inline link in running prose is exactly the case that needs
   a persistent underline (WCAG 1.4.1 Use of Color).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Link integrated with flowing paragraph text */
export const InParagraph: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <p
      style={{
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-md)',
        color: 'var(--text-primary)',
        maxWidth: 480,
        lineHeight: 'var(--font-line-height-normal)',
      }}
    >
      Our team specializes in web design and development.{' '}
      <TextLink href="#" underline="always">Learn more about our services</TextLink> or{' '}
      <TextLink href="#" underline="always">contact us</TextLink> to get started.
    </p>
  ),
};
