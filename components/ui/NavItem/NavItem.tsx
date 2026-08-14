import {
  type ReactNode,
  type MouseEvent,
  type AnchorHTMLAttributes,
  type ComponentType,
} from 'react';
import { bdsClass } from '../../utils';
import { Dot, type DotStatus } from '../Dot';
import './NavItem.css';

/**
 * Injectable link renderer for navigation components. Pass a router-aware
 * component (Next.js `Link`, Remix `Link`) for client-side routing; defaults
 * to a bare `<a>` when omitted. See ADR-012.
 */
export type BdsLinkComponent = ComponentType<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;

export interface NavItemProps {
  /** Visible label. Also used as `aria-label` when `iconOnly` is true. */
  label: string;
  /** Optional leading icon. Pass a rendered Iconify `<Icon>` or any ReactNode. */
  icon?: ReactNode;
  /** Anchor href. Omit for button-style behavior with `onClick`. */
  href?: string;
  /** Click handler — usable with or without `href`. Ignored when `disabled`. */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  /** Selected (current page) state. Sets `aria-current="page"`. */
  active?: boolean;
  /** Disabled state. Blocks click + applies muted styling. */
  disabled?: boolean;
  /** Icon-only mode. Label becomes `aria-label`; visible content is the icon only. */
  iconOnly?: boolean;
  /** Optional className passthrough for layout slot integration. */
  className?: string;
  /**
   * Render the link with a router-aware component (Next.js `Link`, Remix
   * `Link`) for client-side routing instead of the default bare `<a>`.
   * Ignored when `disabled` or when `href` is omitted. See ADR-012.
   */
  linkComponent?: BdsLinkComponent;
  /**
   * Show a small indicator dot after the label — a decorative attention cue.
   * `true` renders the brand-default dot; pass a {@link DotStatus} for a
   * specific status.
   */
  dot?: boolean | DotStatus;
}

/**
 * NavItem — atomic navigation link with hover / active / disabled states.
 *
 * The building block for `SidebarNavigation` and `SubNavigation`. Use it
 * standalone when composing custom navigation surfaces.
 *
 * @summary Atomic navigation link with hover, active, disabled states
 */
export function NavItem({
  label,
  icon,
  href,
  onClick,
  active = false,
  disabled = false,
  iconOnly = false,
  className,
  linkComponent,
  dot,
}: NavItemProps) {
  const classes = bdsClass(
    'bds-nav-item',
    active && 'bds-nav-item--active',
    disabled && 'bds-nav-item--disabled',
    iconOnly && 'bds-nav-item--icon-only',
    dot && 'bds-nav-item--has-dot',
    className,
  );

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const content = (
    <>
      {icon && <span className="bds-nav-item__icon">{icon}</span>}
      {!iconOnly && <span className="bds-nav-item__label">{label}</span>}
      {dot && <Dot status={dot === true ? 'default' : dot} size="sm" aria-hidden="true" />}
    </>
  );

  // A router `Link` requires `href` and must not navigate when disabled, so
  // those cases always fall back to a bare `<a>`. See ADR-012.
  if (href && !disabled && linkComponent) {
    const LinkComponent = linkComponent;
    return (
      <LinkComponent
        href={href}
        onClick={handleClick}
        className={classes}
        aria-current={active ? 'page' : undefined}
        aria-label={iconOnly ? label : undefined}
      >
        {content}
      </LinkComponent>
    );
  }

  return (
    <a
      href={disabled ? undefined : href}
      onClick={handleClick}
      className={classes}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      aria-label={iconOnly ? label : undefined}
      tabIndex={disabled ? -1 : undefined}
    >
      {content}
    </a>
  );
}

export default NavItem;
