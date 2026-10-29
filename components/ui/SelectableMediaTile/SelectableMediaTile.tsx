'use client';

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { bdsClass } from '../../utils';
import { Image } from '../Image';
import { type FrameRatio } from '../Frame';
import { useSelectionGroup } from '../shared/useSelectionGroup';
import './SelectableMediaTile.css';

/**
 * The element the root renders as: `<button>` standalone, `<label>` inside a
 * `RadioGroup` / `CheckboxGroup` (ADR-045).
 */
export type SelectableMediaTileElement = HTMLButtonElement | HTMLLabelElement;

export interface SelectableMediaTileProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /**
   * This tile's value inside a `RadioGroup` / `CheckboxGroup`. Required there —
   * the group matches it against its own `value` to decide `selected`. Without
   * a surrounding group (or without a `value`) the tile stays a standalone
   * `aria-pressed` toggle button.
   */
  value?: string;
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
   *
   * For a pick-one / pick-many gallery, put the tiles inside a `RadioGroup` /
   * `CheckboxGroup` instead and give each a `value` — selection then comes from
   * the group and `selected` is ignored (ADR-045).
   */
  selected?: boolean;
  /** Disable the tile. Applies muted styling and blocks click. */
  disabled?: boolean;
  /**
   * Aspect-ratio slug for the image box. Default `4-3`. Pass `1-1` for
   * avatar / square grids. A `FrameRatio` — backed by the `--aspect-*`
   * token family — forwarded to the underlying `<Image>` as `ratio`.
   */
  aspectRatio?: FrameRatio;
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
 * Inside a `RadioGroup` (pick one) or `CheckboxGroup` (pick many), give the
 * tile a `value`: it renders as a `<label>` wrapping a visually hidden native
 * radio / checkbox, so the group — not a grid of `aria-pressed` toggles — is
 * what assistive tech reads. Selection, `name`, `disabled` and change handling
 * come from the group; `onClick` and `selected` are ignored there (ADR-045).
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
export const SelectableMediaTile = forwardRef<SelectableMediaTileElement, SelectableMediaTileProps>(
  (
    {
      src,
      alt,
      caption,
      selected,
      disabled = false,
      aspectRatio = '4-3',
      className,
      onClick,
      value,
      ...props
    },
    ref,
  ) => {
    const group = useSelectionGroup();
    // Inside a group the selected state is the group's, not the `selected` prop.
    const inGroup = group !== null && value !== undefined;
    const isSelected = inGroup ? group.isSelected(value) : selected;
    const isDisabled = inGroup ? disabled || group.disabled : disabled;

    const slots = (
      <>
        <span className="bds-selectable-media-tile__media">
          <Image src={src} alt={alt} ratio={aspectRatio} fit="cover" />
          {isSelected && (
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
      </>
    );

    const classes = bdsClass(
      'bds-selectable-media-tile',
      isSelected && 'bds-selectable-media-tile--selected',
      isDisabled && 'bds-selectable-media-tile--disabled',
      className,
    );

    // Inside a RadioGroup / CheckboxGroup — a <label> wrapping a visually hidden
    // native input (the ServiceTagSelect rendering, ADR-045 § 2). The group owns
    // name, checked, disabled and change; the browser owns the keyboard model.
    if (inGroup) {
      return (
        <label
          ref={ref as Ref<HTMLLabelElement>}
          className={classes}
          {...(props as unknown as HTMLAttributes<HTMLLabelElement>)}
        >
          <input
            type={group.kind}
            name={group.name}
            value={value}
            checked={isSelected}
            disabled={isDisabled}
            onChange={() => group.onChange(value)}
            className="bds-selectable-media-tile__input"
          />
          {slots}
        </label>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        disabled={isDisabled}
        value={value}
        aria-pressed={selected}
        onClick={onClick}
        {...props}
      >
        {slots}
      </button>
    );
  },
);

SelectableMediaTile.displayName = 'SelectableMediaTile';

export default SelectableMediaTile;
