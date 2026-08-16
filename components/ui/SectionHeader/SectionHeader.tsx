import { type HTMLAttributes, type ReactNode } from 'react';
import { ContentBlock, type ContentBlockTitleAs, type ContentBlockSize } from '../ContentBlock';
import { type Measure } from '../../../tokens';
import { bdsClass } from '../../utils';
import './SectionHeader.css';

/** Text-column alignment within the band. */
export type SectionHeaderAlign = 'center' | 'start';

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Primary text slot. Omit for a description/actions-only header. */
  title?: ReactNode;
  /** Secondary line paired with `title`. */
  subtitle?: ReactNode;
  /** Explanatory prose under `title`/`subtitle`. */
  description?: ReactNode;
  /** Action slot — typically a `<Button>` or `<ButtonGroup>`. */
  actions?: ReactNode;
  /** Text-column alignment within the band. Default `'center'`. */
  align?: SectionHeaderAlign;
  /** Inline measure cap (`--measure-*`). Default `'md'`. */
  measure?: Measure;
  /**
   * Heading level for the section `<h2>`. Default `'h2'` — section headers
   * are outline nodes, one level under the page `<h1>`.
   */
  titleAs?: ContentBlockTitleAs;
  /** Title scale. Default `'lg'` — the canonical section-heading size. */
  size?: ContentBlockSize;
  /**
   * On-color mode — for a section intro on a filled brand/dark band (a CTA
   * band). Forwarded to `ContentBlock`, which owns the colour swap; see its
   * `onColor` prop for the AA-large contrast caveat on band body copy.
   */
  onColor?: boolean;
}

/**
 * SectionHeader — centers a `ContentBlock` intro and caps it to a readable
 * measure (ADR-032). Composes `ContentBlock` for the title/subtitle/
 * description/actions rhythm (ADR-023) and adds only the horizontal
 * measure + alignment that groups a section intro inside a band.
 *
 * @summary Centered, measure-capped section intro — composes ContentBlock
 */
export function SectionHeader({
  title,
  subtitle,
  description,
  actions,
  align = 'center',
  measure = 'md',
  titleAs = 'h2',
  size = 'lg',
  onColor = false,
  className,
  style,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={bdsClass(
        'bds-section-header',
        `bds-section-header--${align}`,
        `bds-section-header--measure-${measure}`,
        className,
      )}
      style={style}
      {...props}
    >
      <ContentBlock
        titleAs={titleAs}
        size={size}
        onColor={onColor}
        title={title}
        subtitle={subtitle}
        description={description}
        actions={actions}
      />
    </div>
  );
}

export default SectionHeader;
