/**
 * HeroMediaCardPrice — presentational hero media-card price block
 * (brik-bds#2284). Renders `.bds-hero__price` / `__price-label` /
 * `__price-value`, class-identical to `HeroSplitImageCardOverlay.tsx:137-146`.
 *
 * Presentational only — renders no `<button>` / `<a>` itself. There is no
 * dedicated CTA prop: a caller (e.g. the adapter, or a consumer composing
 * `<HeroMediaCard>` directly) renders its own `<Button>` as `children`, which
 * lands inside `.bds-hero__price` after the label/value — matching the
 * adapter's original nesting. The root renders only when there is a label,
 * value, or children to show.
 *
 * Composes with `<HeroMediaCard>` after `<HeroMediaCardImage>`.
 *
 * @summary Hero media-card price block — label + value, class-identical to the legacy adapter's inline markup, with no CTA of its own.
 */
import { type HTMLAttributes, type ReactNode } from 'react';

import { bdsClass } from '../../../components/utils';

export interface HeroMediaCardPriceProps extends HTMLAttributes<HTMLDivElement> {
  /** Price label (e.g. "Starting at"). Only rendered when `value` is also set, matching the adapter. */
  label?: string;
  /** Price value (e.g. "$99/mo"). */
  value?: string;
  /** Caller-composed CTA (a real `<Button>`) or other trailing content. */
  children?: ReactNode;
}

export function HeroMediaCardPrice({
  label,
  value,
  className,
  children,
  ...rest
}: HeroMediaCardPriceProps) {
  if (!label && !value && !children) return null;

  return (
    <div className={bdsClass('bds-hero__price', className)} {...rest}>
      {label && value && <p className="bds-hero__price-label">{label}</p>}
      {value && <p className="bds-hero__price-value">{value}</p>}
      {children}
    </div>
  );
}

export default HeroMediaCardPrice;
