import { type HTMLAttributes } from 'react';
import { Icon } from '../Icon';
import { Frame, type FrameRatio } from '../Frame';
import { ArrowSquareOut, CloudArrowUp, File as FileIcon, Trash } from '../../icons';
import { bdsClass } from '../../utils';
import './FileCard.css';

/**
 * Preview render modes for `FileCard`. Image and SVG render `src`; icon
 * renders a generic file-type placeholder for non-renderable types (PDF, ZIP).
 */
export type FileCardPreview = 'image' | 'icon' | 'svg';

/**
 * Aspect-ratio slug applied to the preview thumbnail.
 *
 * Legacy alias of `FrameRatio` — the FileCard preview now renders through
 * `<Frame>`, which owns the ratio vocabulary. Prefer importing `FrameRatio`.
 */
export type FileCardAspectRatio = FrameRatio;

/**
 * `FileCard` component props.
 */
export interface FileCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Render mode for the preview thumbnail. */
  preview: FileCardPreview;
  /** Source URL for the preview. Required for `preview="image"` and `preview="svg"`; ignored for `preview="icon"`. */
  src?: string;
  /** Aspect-ratio slug applied to the preview thumbnail (default `1-1`). A `FrameRatio` — backed by the `--aspect-*` token family. */
  aspectRatio?: FrameRatio;
  /** Filename label (required). */
  name: string;
  /** Optional metadata line — typically dimensions / size / mime info. */
  meta?: string;
  /** When set, the preview thumbnail becomes a link that opens the file in a new tab. */
  href?: string;
  /** Replace action handler. When omitted, the Replace button is not rendered. */
  onReplace?: () => void;
  /** Delete action handler. When omitted, the Delete button is not rendered. */
  onDelete?: () => void;
  /** Disable action buttons while preserving the visual. */
  disabled?: boolean;
  /** Accessible alt text for image / svg previews. Falls back to `name`. */
  previewAlt?: string;
}

/**
 * FileCard — populated state of a file upload.
 *
 * Renders one uploaded asset as a card surface: preview thumbnail, filename,
 * optional metadata line, optional open-in-new-tab link, and an action row
 * with optional Replace / Delete buttons. Designed to compose alongside
 * `FileUploader` (which owns the empty/dropzone state).
 *
 * Pair with `FileUploader` in the consumer:
 * - Empty slot → `<FileUploader …>`
 * - Single populated → `<FileCard …>`
 * - Multi → list of `FileCard`s + small `FileUploader` for "add more"
 *
 * The `aspectRatio` slug consumes the `--aspect-*` token family (BDS #486) so
 * CMS uploaders can encode the target image shape once — the same slug feeds
 * `<Frame ratio="…">` on the consumer side.
 *
 * @example
 * ```tsx
 * <FileCard
 *   preview="image"
 *   src="https://cdn.example/hero.jpg"
 *   aspectRatio="16-9"
 *   name="hero.jpg"
 *   meta="1600 × 900 • 248 KB"
 *   href="https://cdn.example/hero.jpg"
 *   onReplace={() => openFilePicker()}
 *   onDelete={() => clearImage()}
 * />
 * ```
 *
 * @summary Card surface for one uploaded asset — preview, filename, meta, actions.
 */
export function FileCard({
  preview,
  src,
  aspectRatio = '1-1',
  name,
  meta,
  href,
  onReplace,
  onDelete,
  disabled = false,
  previewAlt,
  className,
  ...props
}: FileCardProps) {
  const altText = previewAlt ?? name;
  const previewBox = (
    <Frame
      as="span"
      ratio={aspectRatio}
      anchor="height"
      fit="cover"
      className={bdsClass('bds-file-card__preview', `bds-file-card__preview--${preview}`)}
      aria-hidden={preview === 'icon' ? true : undefined}
    >
      {preview === 'image' && src && (
        <img className="bds-file-card__preview-img" src={src} alt={altText} loading="lazy" decoding="async" />
      )}
      {preview === 'svg' && src && (
        <img className="bds-file-card__preview-svg" src={src} alt={altText} loading="lazy" decoding="async" />
      )}
      {preview === 'icon' && (
        <span className="bds-file-card__preview-icon">
          <Icon icon={FileIcon} />
        </span>
      )}
    </Frame>
  );

  return (
    <div
      className={bdsClass('bds-file-card', disabled ? 'bds-file-card--disabled' : undefined, className)}
      {...props}
    >
      <div className="bds-file-card__card">
        {href ? (
          <a
            className="bds-file-card__preview-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${name} in new tab`}
          >
            {previewBox}
          </a>
        ) : (
          previewBox
        )}
        <div className="bds-file-card__body">
          <div className="bds-file-card__meta">
            <p className="bds-file-card__name">{name}</p>
            {meta && <p className="bds-file-card__metadata">{meta}</p>}
          </div>
          {href && (
            <a
              className="bds-file-card__open"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${name} in new tab`}
            >
              <Icon icon={ArrowSquareOut} />
            </a>
          )}
        </div>
      </div>
      {(onReplace || onDelete) && (
        <div className="bds-file-card__actions">
          {onReplace && (
            <button
              type="button"
              className="bds-file-card__action"
              onClick={onReplace}
              disabled={disabled}
            >
              <Icon icon={CloudArrowUp} />
              <span>Replace</span>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="bds-file-card__action"
              onClick={onDelete}
              disabled={disabled}
            >
              <Icon icon={Trash} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default FileCard;
