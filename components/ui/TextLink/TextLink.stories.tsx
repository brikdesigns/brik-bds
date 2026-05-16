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
    children: 'Learn more',
  },
};

/* ═══════════════════════════════════════════════════════════════
   IN-PARAGRAPH — Q4 irreducible per ADR-010. Demonstrates how the
   link visually integrates with flowing paragraph text (baseline
   alignment, color contrast against body text, underline behavior).
   Surrounding text is structural, not a component prop, so this
   case can't be expressed via args alone.
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
      <TextLink href="#">Learn more about our services</TextLink> or{' '}
      <TextLink href="#">contact us</TextLink> to get started.
    </p>
  ),
};
