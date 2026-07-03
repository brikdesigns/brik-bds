import { type HTMLAttributes, type ReactNode } from 'react';
import { type BdsLinkComponent } from '../NavItem';
import { bdsClass } from '../../utils';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type BreadcrumbSeparator = 'slash' | 'chevron';

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Crumb trail in order. The last item is rendered as plain text with `aria-current="page"`; earlier items render as `<a>` when `href` is set. */
  items: BreadcrumbItem[];
  /** Visual separator between crumbs. Default `slash` (`/`); `chevron` renders `›`. */
  separator?: BreadcrumbSeparator;
  /**
   * Render each linked crumb with a router-aware component (Next.js `Link`,
   * Remix `Link`) for client-side routing instead of the default bare `<a>`.
   * The current (last) crumb is always plain text. See ADR-012.
   */
  linkComponent?: BdsLinkComponent;
}

const SEPARATOR_CHARS: Record<BreadcrumbSeparator, string> = {
  slash: '/',
  chevron: '›',
};

/**
 * Renders a linked crumb via the injected `linkComponent` (client-side routing)
 * or a bare `<a>` when none is provided. See ADR-012.
 */
function BreadcrumbLink({
  linkComponent: LinkComponent,
  href,
  children,
}: {
  linkComponent?: BdsLinkComponent;
  href: string;
  children: ReactNode;
}) {
  if (LinkComponent) {
    return (
      <LinkComponent href={href} className="bds-breadcrumb__link">
        {children}
      </LinkComponent>
    );
  }
  return (
    <a href={href} className="bds-breadcrumb__link">
      {children}
    </a>
  );
}

/**
 * Breadcrumb — navigation breadcrumb trail with separator variants.
 *
 * @summary Navigation breadcrumb trail with separator variants
 */
export function Breadcrumb({
  items,
  separator = 'slash',
  linkComponent,
  className,
  style,
  ...props
}: BreadcrumbProps) {
  const separatorChar = SEPARATOR_CHARS[separator];

  return (
    <nav
      className={bdsClass('bds-breadcrumb', className)}
      style={style}
      aria-label="Breadcrumb"
      {...props}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} style={{ display: 'contents' }}>
            {i > 0 && (
              <span className="bds-breadcrumb__separator" aria-hidden="true">
                {separatorChar}
              </span>
            )}
            {isLast || !item.href ? (
              <span
                className="bds-breadcrumb__current"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <BreadcrumbLink linkComponent={linkComponent} href={item.href}>
                {item.label}
              </BreadcrumbLink>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
