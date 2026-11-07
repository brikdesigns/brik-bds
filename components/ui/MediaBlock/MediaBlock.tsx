import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import { ContentBlock, type ContentBlockProps } from '../ContentBlock';
import './MediaBlock.css';

type ContentSlots = Pick<
  ContentBlockProps,
  'title' | 'subtitle' | 'description' | 'actions' | 'titleAs' | 'size' | 'onColor'
>;

export interface MediaBlockProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    ContentSlots {
  /** The media slot — usually an `<Image>` with a `ratio`, or a video. */
  media: ReactNode;
}

/**
 * MediaBlock — a media slot stacked above a ContentBlock.
 *
 * The unit for a team member, a case study teaser, a gallery item with a
 * caption: media on top, then title / subtitle / description / actions.
 * The text slots are ContentBlock's, so the rhythm matches every other
 * content unit.
 *
 * MediaBlock is always stacked. For media beside copy, compose
 * `Split` + `Image` + `ContentBlock` — orientation is a Layout decision,
 * not a Block variant (ADR-023 §5).
 *
 * @example
 * ```tsx
 * <MediaBlock
 *   media={<Image src="/dr-lee.jpg" alt="Dr. Lee" ratio="4-5" />}
 *   title="Dr. Ana Lee"
 *   subtitle="Lead dentist"
 *   description="Twelve years in restorative care."
 * />
 * ```
 *
 * @summary A media slot stacked above a ContentBlock.
 */
export function MediaBlock({
  media,
  title,
  subtitle,
  description,
  actions,
  titleAs,
  size,
  onColor,
  className,
  ...props
}: MediaBlockProps) {
  return (
    <div className={bdsClass('bds-media-block', className)} {...props}>
      <div className="bds-media-block__media">{media}</div>
      <ContentBlock
        title={title}
        subtitle={subtitle}
        description={description}
        actions={actions}
        titleAs={titleAs}
        size={size}
        onColor={onColor}
      />
    </div>
  );
}

export default MediaBlock;
