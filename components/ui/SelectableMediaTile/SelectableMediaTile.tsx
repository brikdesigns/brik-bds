import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './SelectableMediaTile.css';

export interface SelectableMediaTileProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Image source URL. */
  src: string;
  /** Image alt text. Required — the tile is a real control, not decoration. */
  alt: string;
  /**
   * Caption rendered below the image — typically the file / item name.
   * `ReactNode` so callers can compose a name + secondary line if needed.
   */
  caption?: ReactNode;
  /**
   * Persistent selected state — brand ring + a check overlay on the
   * image, and sets `aria-pressed`. Mirrors `InteractiveListItem`'s
   * `selected`. Leave `undefined` for a non-toggle tile.
   */
  selected?: boolean;
  /** Disable the tile. Applies muted styling and blocks click. */
  disabled?: boolean;
  /**
   * CSS `aspect-ratio` for the image box. Default `4 / 3`. Pass `1 / 1`
   * for avatar / square grids.
   */
  aspectRatio?: string;
}

/**
 * SelectableMediaTile — a vertical image-first toggle: full-bleed image
 * on top, caption below, with a persistent selected state. The whole
 * tile is the click target.
 *
 * Use for image / avatar grids where each cell toggles on and off — a
 * hero-photo picker, a gallery multi-select, an avatar chooser. For a
 * horizontal text row use `InteractiveListItem` (add its `selected`
 * prop); this is its vertical, media-first sibling.
 *
 * Renders as `<button type="button">` for native focus, `Space` /
 * `Enter` activation, and `disabled`. Sets `aria-pressed` from
 * `selected` so assistive tech reads the toggle state.
 *
 * @example
 * ```tsx
 * <SelectableMediaTile
 *   src={photo.url}
 *   alt={photo.name}
 *   caption={photo.name}
 *   selected={pinned === photo.url}
 *   onClick={() => setPin(pinned === photo.url ? null : photo.url)}
 * />
 * ```
 *
 * @summary Vertical image tile with a persistent selected state
 */
export const SelectableMediaTile = forwardRef<HTMLButtonElement, SelectableMediaTileProps>(
  (
    {
      src,
      alt,
      caption,
      selected,
      disabled = false,
      aspectRatio = '4 / 3',
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        className={bdsClass(
          'bds-selectable-media-tile',
          selected && 'bds-selectable-media-tile--selected',
          disabled && 'bds-selectable-media-tile--disabled',
          className,
        )}
        disabled={disabled}
        aria-pressed={selected}
        onClick={onClick}
        {...props}
      >
        <span className="bds-selectable-media-tile__media" style={{ aspectRatio }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- BDS is framework-agnostic; consumers pass their own URL */}
          <img src={src} alt={alt} className="bds-selectable-media-tile__image" />
          {selected && (
            <span className="bds-selectable-media-tile__check" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </span>
        {caption !== undefined && caption !== null && (
          <span className="bds-selectable-media-tile__caption">{caption}</span>
        )}
      </button>
    );
  },
);

SelectableMediaTile.displayName = 'SelectableMediaTile';

export default SelectableMediaTile;
