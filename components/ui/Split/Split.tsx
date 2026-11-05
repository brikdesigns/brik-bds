import { type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { bdsClass } from '../../utils';
import './Split.css';

/**
 * Column ratio, first region to second. Closed enum — the same values the
 * blueprint `ratio` axis names (ADR-039 §Structure). Mirror the media side by
 * child order, not by flipping the ratio: `40-60` makes the second region wider.
 */
export type SplitRatio = '50-50' | '60-40' | '40-60';
export type SplitGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'huge';
export type SplitAlign = 'start' | 'center' | 'end' | 'stretch';
/** Viewport rung below which the two regions stack into one column. */
export type SplitStackBelow = 'tablet' | 'desktop';

export interface SplitProps extends HTMLAttributes<HTMLElement> {
  /** Column ratio, first region to second. Default `50-50`. */
  ratio?: SplitRatio;
  /** Spacing between the two regions. Maps to BDS `--gap-*` tokens. Default `xl`. */
  gap?: SplitGap;
  /** Cross-axis alignment of the two regions. Default `center`. */
  align?: SplitAlign;
  /** Stack into one column below this breakpoint. Default `tablet`. */
  stackBelow?: SplitStackBelow;
  /** HTML element to render as. Default `div`. */
  as?: ElementType;
  /** Exactly two children — the two regions, in reading order. */
  children?: ReactNode;
}

/**
 * Split — two regions side by side at a fixed ratio, stacking to one column
 * below a breakpoint.
 *
 * For media + copy, copy + form, copy + contact aside. Use `Grid` for N
 * equal cells; Split is always two regions and is the only Layout primitive
 * that takes an uneven ratio. Child order is reading order and stacking
 * order — put the region that should come first on a phone first.
 *
 * @example
 * ```tsx
 * <Split ratio="60-40" gap="xl">
 *   <ContentBlock title="Our story" description="…" titleAs="h2" />
 *   <Image src="/team.jpg" alt="The team at work" ratio="4-3" />
 * </Split>
 * ```
 *
 * @summary Two regions side by side at a fixed ratio; stacks below a breakpoint.
 */
export function Split({
  ratio = '50-50',
  gap = 'xl',
  align = 'center',
  stackBelow = 'tablet',
  as: Element = 'div',
  className,
  ...props
}: SplitProps) {
  return (
    <Element
      className={bdsClass(
        'bds-split',
        `bds-split--ratio-${ratio}`,
        gap !== 'none' && `bds-split--gap-${gap}`,
        `bds-split--align-${align}`,
        `bds-split--stack-below-${stackBelow}`,
        className,
      )}
      {...props}
    />
  );
}

export default Split;
