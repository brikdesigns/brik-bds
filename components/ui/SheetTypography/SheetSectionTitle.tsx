import type { HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './SheetTypography.css';

export interface SheetSectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Render level for the underlying heading element. Defaults to `h3` so the
   * Sheet's own `<h2>` title keeps outline hierarchy intact; consumers can
   * override if a different document outline fits their page.
   */
  level?: 'h2' | 'h3' | 'h4';
}

/**
 * @deprecated Use `<SheetSection heading="..." />` instead.
 * `SheetSection.heading` now uses the same `--heading-sm` semibold tier;
 * the legacy uppercase `--label-sm` treatment has been retired. Pass
 * `headingLevel` to `SheetSection` when you need an element other than `h3`.
 *
 * @summary Section heading inside a Sheet body
 */
export function SheetSectionTitle({
  level = 'h3',
  className,
  children,
  ...props
}: SheetSectionTitleProps) {
  const Tag = level;
  return (
    <Tag className={bdsClass('bds-sheet-section-title', className)} {...props}>
      {children}
    </Tag>
  );
}

export default SheetSectionTitle;
