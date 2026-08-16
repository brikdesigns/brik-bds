import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './ContentBlock.css';

export type ContentBlockTitleAs = 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'p';

/** Title scale — sm/md/lg map to `--heading-sm/md/lg`. `subtitle`/`description` stay body-md at every size. */
export type ContentBlockSize = 'sm' | 'md' | 'lg';

export interface ContentBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Primary text slot. Omit for a description/actions-only block. */
  title?: ReactNode;
  /** Secondary line paired with `title`. Never `eyebrow`/`kicker`. */
  subtitle?: ReactNode;
  /** Explanatory prose under `title`/`subtitle` — longer and more neutral than `subtitle`. */
  description?: ReactNode;
  /** Action slot — typically a `<Button>` or `<ButtonGroup>`. */
  actions?: ReactNode;
  /**
   * HTML element for `title`. Pick by outline position, not by the BEM name:
   * an outline node (`ContentBlock` as a page-region title) renders `h2`/`h3`;
   * a decorative unit repeated in a grid (card content) renders `div`/`p`.
   * Default `h3` — the common case is nested inside a `Card`.
   * See build-standards/html-semantics.mdx#heading-element-selection.
   */
  titleAs?: ContentBlockTitleAs;
  /** Title scale (`--heading-{size}`). `subtitle`/`description` are unaffected. Default `sm`. */
  size?: ContentBlockSize;
  /**
   * On-color mode — for a block sitting on a filled brand/dark surface.
   * Swaps `title`/`subtitle`/`description` to `--text-on-color-dark` so the
   * consumer never pushes a per-instance `color` override into a slot it does
   * not own. On `--surface-brand-primary` the pair is 3.78:1 — AA-large, not
   * AA (`tokens/contrast-pairings.json`); keep band body copy short.
   */
  onColor?: boolean;
}

/**
 * ContentBlock — fixed-slot Block-layer unit (`title` / `subtitle` /
 * `description` / `actions`), each slot omittable.
 *
 * Owns the vertical rhythm BETWEEN its own slots (ADR-023 §3): tight
 * title→subtitle, medium title/subtitle→description, and the same medium
 * step from the last text slot into `actions`. It never owns layout
 * (column count, orientation) — that comes from a Layout primitive
 * (`Stack`, `Grid`) or a Container (`Card`) around it.
 *
 * @summary Fixed-slot content unit — title, subtitle, description, actions
 */
export function ContentBlock({
  title,
  subtitle,
  description,
  actions,
  titleAs = 'h3',
  size = 'sm',
  onColor = false,
  className,
  style,
  ...props
}: ContentBlockProps) {
  const TitleTag = titleAs;
  return (
    <div
      className={bdsClass(
        'bds-content-block',
        `bds-content-block--${size}`,
        onColor ? 'bds-content-block--on-color' : '',
        className,
      )}
      style={style}
      {...props}
    >
      {title && <TitleTag className="bds-content-block__title">{title}</TitleTag>}
      {subtitle && <p className="bds-content-block__subtitle">{subtitle}</p>}
      {description && <p className="bds-content-block__description">{description}</p>}
      {actions && <div className="bds-content-block__actions">{actions}</div>}
    </div>
  );
}

export default ContentBlock;
