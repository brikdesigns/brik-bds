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
 * Button style — one curated list (ADR-033 § Amendments, #3275).
 *
 * - `primary`          — Main CTA (brand fill)
 * - `secondary`        — Subtle (surface fill)
 * - `outline`          — Brand border, no fill
 * - `ghost`            — No fill, no border
 * - `inverse`          — Dark fill for dark-theme surfaces (flips with theme)
 * - `on-color`         — White fill for brand-coloured surfaces (does not flip)
 * - `negative`         — Destructive action (system red fill)
 * - `negative-outline` — Destructive action, outline style
 * - `negative-ghost`   — Destructive action, ghost style
 * - `positive`         — Confirming action (system green fill)
 *
 * A Button is a short list of designed styles, not a cross-product of axes, so
 * every style that ships is a value here and nothing else exists.
 *
 * Retired spellings (honoured at runtime for one minor, then removed; the type
 * rejects them at once): `destructive` / `danger` → `negative`;
 * `danger-outline` → `negative-outline`; `danger-ghost` → `negative-ghost`.
 *
 * `selected` is NOT a variant — it is a boolean state prop. Pass
 * `selected={true}` alongside any variant to render the selected modifier.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'inverse'
  | 'on-color'
  | 'negative'
  | 'negative-outline'
  | 'negative-ghost'
  | 'positive';

const RETIRED_VARIANTS: Record<string, ButtonVariant> = {
  destructive: 'negative',
  danger: 'negative',
  'danger-outline': 'negative-outline',
  'danger-ghost': 'negative-ghost',
};

/** Button sizes — shared across text and icon-only modes. */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ─── Shared styling props ──────────────────────────────────────────

interface StyleProps {
  /** Style of the button. Default `primary`. */
  variant?: ButtonVariant;
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
 * Text mode:  `bds-button bds-button--variant-{variant} bds-button--size-{size}` (+ modifiers)
 * Icon mode:  `bds-button bds-icon-button bds-button--variant-{variant} bds-icon-button--size-{size}` (+ modifiers)
 *
 * Exported for tests and downstream micro-components that need exact class
 * parity (e.g. theming wrappers). Most callers should render `<Button>` directly.
 */
export function composeButtonClasses({
  variant,
  size = 'md',
  fullWidth = false,
  loading = false,
  selected,
  iconOnly = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  selected?: boolean;
  iconOnly?: boolean;
  className?: string;
}): string {
  return bdsClass(
    'bds-button',
    iconOnly && 'bds-icon-button',
    `bds-button--variant-${resolveRetiredValue('Button', 'variant', variant, RETIRED_VARIANTS) ?? 'primary'}`,
    iconOnly ? `bds-icon-button--size-${size}` : `bds-button--size-${size}`,
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
 * Style: one `variant` from a curated list — e.g.
 * `<Button variant="negative-ghost">Remove</Button>`.
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
