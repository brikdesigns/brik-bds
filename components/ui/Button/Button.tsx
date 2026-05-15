import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { bdsClass } from '../../utils';
import './Button.css';

/**
 * Button variants — visual hierarchy for actions.
 *
 * Brand variants (UI hierarchy):
 * - `primary`     — Main CTA (brand fill)
 * - `outline`     — Secondary emphasis (brand border)
 * - `secondary`   — Tertiary/subtle (surface fill)
 * - `ghost`       — Minimal emphasis (no background)
 * - `inverse`     — For dark theme surfaces (flips with theme)
 * - `on-color`    — For brand-colored surfaces (does not flip with theme)
 *
 * System variants (semantic actions):
 * - `destructive` — Destructive action (system red)
 * - `positive`    — Confirming action (system green)
 *
 * Legacy aliases (still supported, prefer system variants):
 * - `danger` / `danger-outline` / `danger-ghost` — kept for back-compat.
 *
 * `selected` is NOT a variant — it is a boolean state prop. Pass
 * `selected={true}` alongside any variant to render the selected modifier.
 */
export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'inverse'
  | 'on-color'
  | 'destructive'
  | 'positive'
  | 'danger'
  | 'danger-outline'
  | 'danger-ghost';

/** Button sizes — shared across text and icon-only modes. */
export type ButtonSize = 'tiny' | 'sm' | 'md' | 'lg' | 'xl';

// ─── Shared styling props ──────────────────────────────────────────

interface StyleProps {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Stretch to fill container width */
  fullWidth?: boolean;
  /** Loading state — spinner replaces content, click blocked, width preserved */
  loading?: boolean;
  /** Selected state — modifier layered on top of `variant`. Use for active filters / segmented control. */
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
  /** Icon to render (e.g. `<Icon icon="ph:plus" />` from `@iconify/react`). */
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

type AnchorElementProps = { href: string } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | StyleAndContentKeys
>;

type ButtonElementProps = { href?: undefined } & Omit<
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
 * Text mode:  `bds-button bds-button--{variant} bds-button--{size}` (+ modifiers)
 * Icon mode:  `bds-button bds-icon-button bds-button--{variant} bds-icon-button--{size}` (+ modifiers)
 *
 * Exported for tests and downstream micro-components that need exact class
 * parity (e.g. theming wrappers). Most callers should render `<Button>` directly.
 */
export function composeButtonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  selected = false,
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
    `bds-button--${variant}`,
    iconOnly ? `bds-icon-button--${size}` : `bds-button--${size}`,
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
 *
 * State props (combine with any variant):
 * - `selected`  — active state modifier on top of variant
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
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    selected = false,
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
    const { href, label, iconBefore: _ib, iconAfter: _ia, icon: _ic, children: _ch, ...anchorProps } =
      rest as AnchorElementProps & TextContentProps & IconOnlyContentProps;
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        aria-label={iconOnly ? label : label || undefined}
        aria-busy={loading || undefined}
        {...anchorProps}
      >
        {contentNode}
        {spinner}
      </a>
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
      {...buttonProps}
    >
      {contentNode}
      {spinner}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
