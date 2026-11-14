import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ComponentPropsWithRef,
  type ButtonHTMLAttributes,
  type JSXElementConstructor,
  type ReactNode,
  type Ref,
} from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './Button.css';

/**
 * Button form — the shape of the control (ADR-033 § 2: `variant` = form).
 *
 * - `primary`     — Main CTA (brand fill)
 * - `outline`     — Secondary emphasis (brand border)
 * - `secondary`   — Tertiary/subtle (surface fill)
 * - `ghost`       — Minimal emphasis (no background)
 *
 * Valence rides `tone`, hue source rides `emphasis`; the three props are
 * orthogonal. See `Button.mdx` for the combinations that ship.
 *
 * Retired spellings (honoured at runtime for one minor, then removed; the type
 * rejects them at once): `negative` / `positive` → `tone`; `inverse` /
 * `on-color` → `emphasis`; `destructive`, `danger`, `danger-outline`,
 * `danger-ghost` → `tone="negative"` (#1957, #1983).
 *
 * `selected` is NOT a variant — it is a boolean state prop. Pass
 * `selected={true}` alongside any variant to render the selected modifier.
 */
export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'ghost';

/**
 * Button valence — what the action communicates (ADR-033 § 1, § 2).
 * `negative` is the destructive action (system red); `positive` confirms.
 */
export type ButtonTone = 'negative' | 'positive';

/**
 * Button hue source — which palette paints the fill (ADR-033 § 2, § Amendments).
 * - `inverse`  — dark-theme surfaces (flips with theme)
 * - `on-color` — brand-colored surfaces (does not flip with theme)
 */
export type ButtonEmphasis = 'inverse' | 'on-color';

/** Where a retired `variant` value landed — the form, plus the axis it left for. */
const RETIRED_VARIANT_AXES: Record<string, { tone?: ButtonTone; emphasis?: ButtonEmphasis }> = {
  negative: { tone: 'negative' },
  positive: { tone: 'positive' },
  destructive: { tone: 'negative' },
  danger: { tone: 'negative' },
  'danger-outline': { tone: 'negative' },
  'danger-ghost': { tone: 'negative' },
  inverse: { emphasis: 'inverse' },
  'on-color': { emphasis: 'on-color' },
};

const RETIRED_VARIANTS: Record<string, ButtonVariant> = Object.fromEntries(
  Object.keys(RETIRED_VARIANT_AXES).map((k) => [k, 'primary' as const]),
);

const RETIRED_VARIANT_REPLACEMENTS: Record<string, string> = Object.fromEntries(
  Object.entries(RETIRED_VARIANT_AXES).map(([k, { tone, emphasis }]) => [
    k,
    tone ? `variant="primary" tone="${tone}"` : `variant="primary" emphasis="${emphasis}"`,
  ]),
);

/**
 * The tone × form cross-product that ships. A tone on any other form is
 * dropped (with a one-time warning) rather than half-styled.
 */
const TONE_FORMS: Record<ButtonTone, readonly ButtonVariant[]> = {
  negative: ['primary', 'outline', 'ghost'],
  positive: ['primary'],
};

const warnedCombos = new Set<string>();
function warnCombo(message: string): void {
  if (warnedCombos.has(message)) return;
  warnedCombos.add(message);
  console.warn(`[BDS Button] ${message}`);
}

function resolveAxes(
  variant: ButtonVariant | undefined,
  tone: ButtonTone | undefined,
  emphasis: ButtonEmphasis | undefined,
): { form: ButtonVariant; tone?: ButtonTone; emphasis?: ButtonEmphasis } {
  const form =
    resolveRetiredValue('Button', 'variant', variant, RETIRED_VARIANTS, RETIRED_VARIANT_REPLACEMENTS) ??
    'primary';
  const implied = variant !== undefined ? RETIRED_VARIANT_AXES[variant] : undefined;
  let resolvedTone = tone ?? implied?.tone;
  let resolvedEmphasis = emphasis ?? implied?.emphasis;

  if (resolvedTone && resolvedEmphasis) {
    warnCombo(`\`tone="${resolvedTone}"\` and \`emphasis="${resolvedEmphasis}"\` both paint the fill — emphasis ignored.`);
    resolvedEmphasis = undefined;
  }
  if (resolvedEmphasis && form !== 'primary') {
    warnCombo(`\`emphasis="${resolvedEmphasis}"\` ships on \`variant="primary"\` only — ignored on "${form}".`);
    resolvedEmphasis = undefined;
  }
  if (resolvedTone && !TONE_FORMS[resolvedTone].includes(form)) {
    warnCombo(
      `\`tone="${resolvedTone}"\` ships on ${TONE_FORMS[resolvedTone].map((f) => `"${f}"`).join(' / ')} only — ignored on "${form}".`,
    );
    resolvedTone = undefined;
  }
  return { form, tone: resolvedTone, emphasis: resolvedEmphasis };
}

/** Button sizes — shared across text and icon-only modes. */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * `tiny` is the retired spelling of the smallest rung (ADR-033 § 3, #1923) —
 * the four other `*Size` unions (Avatar / Badge / Counter / Tag) already spell
 * it `xs`. Honoured at runtime for one minor via `resolveRetiredValue` (which
 * warns once), then removed; TS callers see the type reject `tiny` immediately.
 */
const RETIRED_SIZES: Record<string, ButtonSize> = { tiny: 'xs' };

// ─── Shared styling props ──────────────────────────────────────────

interface StyleProps {
  /** Form of the button. Default `primary`. */
  variant?: ButtonVariant;
  /** Valence — `negative` (destructive) or `positive`. Ships on some forms only; see Button.mdx. */
  tone?: ButtonTone;
  /** Hue source — `inverse` / `on-color` fill. `primary` form only, and not alongside `tone`. */
  emphasis?: ButtonEmphasis;
  /** Size of the button */
  size?: ButtonSize;
  /** Stretch to fill container width */
  fullWidth?: boolean;
  /** Loading state — spinner replaces content, click blocked, width preserved */
  loading?: boolean;
  /**
   * Selected state — modifier layered on top of `variant`. Use for active filters / segmented control.
   * When defined, a `<button>` also sets `aria-pressed` so it reads as a toggle; leave `undefined`
   * (the default) for an ordinary action button. Anchors keep the class only — `aria-pressed` is
   * not valid on a link. For a pick-one / pick-many group, use `RadioGroup` / `CheckboxGroup`.
   */
  selected?: boolean;
  className?: string;
}

// ─── Content discrimination (text vs icon-only) ────────────────────

interface TextContentProps {
  /** Button label content (required for text buttons). */
  children: ReactNode;
  /** Optional leading icon (decoration). */
  iconBefore?: ReactNode;
  /** Optional trailing icon (decoration). */
  iconAfter?: ReactNode;
  icon?: never;
  /** Optional accessible label. Defaults to the button's text content. */
  label?: string;
}

interface IconOnlyContentProps {
  /** Icon to render (e.g. `<Icon icon="ph:plus" />` from `@brikdesigns/bds`). */
  icon: ReactNode;
  /** Required accessible label — announced by screen readers. */
  label: string;
  children?: never;
  iconBefore?: never;
  iconAfter?: never;
}

type ContentProps = TextContentProps | IconOnlyContentProps;

// ─── Element discrimination (button vs anchor) ─────────────────────

type StyleAndContentKeys =
  | keyof StyleProps
  | keyof TextContentProps
  | keyof IconOnlyContentProps;

type AnchorLinkProps = ComponentPropsWithRef<'a'> & { href: string };

type AnchorElementProps = {
  href: string;
  /**
   * Render the link with a router component (e.g. `next/link`'s `Link`)
   * instead of a plain `<a>`, so navigation stays client-side. Receives the
   * same `href`, `className`, `ref`, and aria props the `<a>` would. Ignored
   * unless `href` is set.
   */
  linkComponent?: JSXElementConstructor<AnchorLinkProps>;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | StyleAndContentKeys>;

type ButtonElementProps = { href?: undefined; linkComponent?: never } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  StyleAndContentKeys
>;

type ElementProps = AnchorElementProps | ButtonElementProps;

// ─── Public props type ─────────────────────────────────────────────

export type ButtonProps = StyleProps & ContentProps & ElementProps;

type ButtonRef = HTMLButtonElement | HTMLAnchorElement;

function isIconOnly(props: ContentProps): props is IconOnlyContentProps {
  return (props as IconOnlyContentProps).icon !== undefined;
}

function isAnchor(props: ElementProps): props is AnchorElementProps {
  return typeof (props as AnchorElementProps).href === 'string';
}

/**
 * Shared class composer for Button (text and icon-only modes).
 *
 * Text mode:  `bds-button bds-button--{variant} [bds-button--tone-{tone}] bds-button--{size}` (+ modifiers)
 * Icon mode:  `bds-button bds-icon-button bds-button--{variant} [bds-button--tone-{tone}] bds-icon-button--{size}` (+ modifiers)
 * With `emphasis`, `bds-button--{emphasis}` takes the place of the variant class.
 *
 * Exported for tests and downstream micro-components that need exact class
 * parity (e.g. theming wrappers). Most callers should render `<Button>` directly.
 */
export function composeButtonClasses({
  variant,
  tone,
  emphasis,
  size = 'md',
  fullWidth = false,
  loading = false,
  selected,
  iconOnly = false,
  className,
}: {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  emphasis?: ButtonEmphasis;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  selected?: boolean;
  iconOnly?: boolean;
  className?: string;
}): string {
  const axes = resolveAxes(variant, tone, emphasis);
  return bdsClass(
    'bds-button',
    iconOnly && 'bds-icon-button',
    // `inverse` / `on-color` paint the primary form's fill, so they replace it.
    `bds-button--${axes.emphasis ?? axes.form}`,
    axes.tone && `bds-button--tone-${axes.tone}`,
    (() => {
      const s = resolveRetiredValue('Button', 'size', size, RETIRED_SIZES) ?? 'md';
      return iconOnly ? `bds-icon-button--${s}` : `bds-button--${s}`;
    })(),
    fullWidth && 'bds-button--full-width',
    loading && 'bds-button--loading',
    selected && 'bds-button--selected',
    className,
  );
}

/**
 * Button — unified action component covering text, icon-only, button-native,
 * and anchor-native renderings.
 *
 * Modes (enforced at compile time via discriminated unions):
 * - **Text button**:   `<Button variant="primary">Save</Button>`
 * - **Text link**:     `<Button variant="outline" href="/docs">Read docs</Button>`
 * - **Icon-only**:     `<Button variant="ghost" icon={<X/>} label="Close" />`
 * - **Icon link**:     `<Button variant="ghost" icon={<X/>} label="Open" href="/x" />`
 * - **Router link**:   `<Button href="/x" linkComponent={Link}>Open</Button>` (e.g. `next/link`)
 *
 * Axes: `variant` (form) · `tone` (valence) · `emphasis` (hue source) — e.g.
 * `<Button variant="ghost" tone="negative">Remove</Button>`.
 *
 * State props (combine with any variant):
 * - `selected`  — active state modifier on top of variant; on a `<button>` it also sets `aria-pressed` when defined
 * - `disabled`  — non-interactive (button mode only — anchors lack native disabled)
 * - `loading`   — spinner replaces content, click blocked, width preserved
 * - `fullWidth` — stretches to container
 *
 * Icon-only mode REQUIRES `label` for screen readers — enforced by TS.
 * `iconBefore` / `iconAfter` are for text-button decoration; forbidden on icon-only.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">Get started</Button>
 * <Button variant="ghost" icon={<X/>} label="Close" />
 * <Button variant="outline" href="/docs">Read docs</Button>
 * <Button variant="outline" selected>Active filter</Button>
 * ```
 *
 * @summary Unified action component (text / icon / link modes)
 */
export const Button = forwardRef<ButtonRef, ButtonProps>(function Button(props, ref) {
  const {
    variant,
    tone,
    emphasis,
    size = 'md',
    fullWidth = false,
    loading = false,
    selected,
    className,
    ...rest
  } = props;

  const iconOnly = isIconOnly(rest as ContentProps);
  const classes = composeButtonClasses({
    variant,
    tone,
    emphasis,
    size,
    fullWidth,
    loading,
    selected,
    iconOnly,
    className,
  });

  const contentNode = iconOnly ? (
    <span
      className={bdsClass('bds-icon-button__icon', loading && 'bds-button__content--hidden')}
      aria-hidden="true"
    >
      {(rest as IconOnlyContentProps).icon}
    </span>
  ) : (
    <span className={bdsClass('bds-button__content', loading && 'bds-button__content--hidden')}>
      {(rest as TextContentProps).iconBefore}
      {(rest as TextContentProps).children}
      {(rest as TextContentProps).iconAfter}
    </span>
  );

  const spinner = loading ? (
    <span className="bds-button__spinner" role="status" aria-label="Loading">
      <span className="bds-button__spinner-icon" />
    </span>
  ) : null;

  if (isAnchor(rest as ElementProps)) {
    const {
      href,
      label,
      linkComponent: LinkComponent = 'a',
      iconBefore: _ib,
      iconAfter: _ia,
      icon: _ic,
      children: _ch,
      ...anchorProps
    } = rest as AnchorElementProps & TextContentProps & IconOnlyContentProps;
    return (
      <LinkComponent
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        aria-label={iconOnly ? label : label || undefined}
        aria-busy={loading || undefined}
        {...anchorProps}
      >
        {contentNode}
        {spinner}
      </LinkComponent>
    );
  }

  const {
    label,
    disabled,
    iconBefore: _ib,
    iconAfter: _ia,
    icon: _ic,
    children: _ch,
    ...buttonProps
  } = rest as ButtonElementProps & TextContentProps & IconOnlyContentProps;
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      className={classes}
      disabled={isDisabled}
      aria-label={iconOnly ? label : label || undefined}
      aria-busy={loading || undefined}
      aria-pressed={selected}
      {...buttonProps}
    >
      {contentNode}
      {spinner}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
