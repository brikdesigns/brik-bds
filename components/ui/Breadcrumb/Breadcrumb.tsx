import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type BreadcrumbSeparator = 'slash' | 'chevron';

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: BreadcrumbSeparator;
}

const SEPARATOR_CHARS: Record<BreadcrumbSeparator, string> = {
  slash: '/',
  chevron: '›',
};

/**
 * Breadcrumb — navigation breadcrumb trail with separator variants.
 */
export function Breadcrumb({
  items,
  separator = 'slash',
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
              <a href={item.href} className="bds-breadcrumb__link">
                {item.label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
