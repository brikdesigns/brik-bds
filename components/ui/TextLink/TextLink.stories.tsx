import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextLink } from './TextLink';

/* ─── Inline SVG icon (story-only) ────────────────────────────── */

const ArrowLeft = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M7.646 2.146a.5.5 0 0 1 0 .708L3.207 7.5H13.5a.5.5 0 0 1 0 1H3.207l4.439 4.646a.5.5 0 0 1-.708.708l-5.5-5.5a.5.5 0 0 1 0-.708l5.5-5.5a.5.5 0 0 1 .708 0z" />
  </svg>
);

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
    emphasis: {
      control: 'select',
      options: ['brand', 'neutral'],
      description:
        'Hue source. `brand` (default) uses the brand link color at rest — for a page link or CTA. `neutral` uses `--text-primary` at rest — a lower-emphasis link that reads as an identifier (e.g. a table name cell). Both transition to `--text-brand-primary` on hover.',
    },
    tone: { table: { disable: true } },
    underline: {
      control: 'select',
      options: ['hover', 'always', 'none'],
      description:
        'Underline visibility. `hover` (default) reveals the underline on hover only — for a standalone link. `always` keeps the underline visible at rest — required for a link embedded inline in running prose (WCAG 1.4.1 Use of Color). `none` suppresses the underline entirely (rest + hover, including the icon/avatar box-shadow) — for a color-only affordance such as a table cell.',
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
   NO-UNDERLINE — Q3 per ADR-010: `underline="none"` is the color-only
   affordance for a table cell. Shown with a leading icon to prove the
   seamless box-shadow underline is suppressed too — an Avatar in a
   cell must never underline. Paired with `emphasis="neutral"`, the exact
   table-cell composition.
   ═══════════════════════════════════════════════════════════════ */

/** @summary No underline — color-only affordance (table cell) */
export const NoUnderline: Story = {
  render: () => (
    <TextLink href="#" emphasis="neutral" underline="none" iconBefore={<ArrowLeft />}>
      Acme Corporation
    </TextLink>
  ),
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

/* ═══════════════════════════════════════════════════════════════
   WITH-ICON — Q4 irreducible per ADR-010. `iconBefore` / `iconAfter`
   are ReactNode slots (control:false), so the icon case can't be
   expressed through Controls — it needs a render story. Demonstrates
   the seamless-underline standard: the underline runs as one line
   under icon + gap + text, not the text alone. Shown with
   `underline="always"` so the line is visible at rest.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Icon link — seamless underline under icon + text */
export const WithIcon: Story = {
  render: () => (
    <TextLink href="#" underline="always" iconBefore={<ArrowLeft />}>
      Back to Customers
    </TextLink>
  ),
};
