import { type HTMLAttributes, useState } from 'react';
import { bdsClass } from '../../utils';
import {
  categoryConfig,
  getServiceIconPath,
  getServiceLineIconPath,
  type ServiceLine,
  type ServiceBadgeSize,
} from './service-config';
import './ServiceTag.css';

export type ServiceTagVariant = 'text' | 'icon-text' | 'icon';

export interface ServiceTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Service line — determines color and default label */
  category: ServiceLine;
  /** Display variant. Default: 'text' */
  variant?: ServiceTagVariant;
  /** Size variant. Default: 'md' */
  size?: ServiceBadgeSize;
  /** Display label — defaults to the category name (e.g. "Back Office"). Pass a service name to label a specific service. */
  label?: string;
  /**
   * Service name for icon resolution. Required for `icon-text` to show a glyph.
   * For `icon`, optional — when omitted the tag falls back to the service-line
   * default glyph instead of rendering an empty box.
   */
  serviceName?: string;
}

// bds-lint-ignore — component-level icon px sizes. Code/Storybook is the source
// of truth for components; Figma is a visual reference only (and uses Font
// Awesome glyphs, not our Iconify set), so these are not Figma-driven.
// sm bumped 12→16: the 12px glyph read as teensy in icon-text pills.
const tagIconSizeMap: Record<ServiceBadgeSize, number> = { sm: 16, md: 16, lg: 20 };

// bds-lint-ignore — component-level badge dimensions (code is SoT; see above).
const iconScaleMap: Record<ServiceBadgeSize, number> = { sm: 0.55, md: 0.6, lg: 0.6 };
const boxSizeMap: Record<ServiceBadgeSize, number> = { sm: 20, md: 28, lg: 40 };

/**
 * ServiceTag — text label or icon badge for a Brik service category or individual service.
 *
 * Three variants:
 * - `text` — colored pill with label text only
 * - `icon-text` — colored pill with service icon + label text
 * - `icon` — colored square with service icon only (replaces ServiceBadge)
 *
 * @example
 * // Service line label
 * <ServiceTag category="marketing" />
 *
 * // Service line with custom label
 * <ServiceTag category="marketing" label="Marketing Design" />
 *
 * // Individual service with icon
 * <ServiceTag category="marketing" variant="icon-text" serviceName="Email Drip Campaign" label="Email Drip Campaign" />
 *
 * // Icon-only badge (square)
 * <ServiceTag category="brand" variant="icon" serviceName="Brand Identity Bundle" size="lg" />
 *
 * @summary Brik service category indicator — text, icon, or icon+text
 */
export function ServiceTag({
  category,
  variant = 'text',
  size = 'md',
  label,
  serviceName,
  className,
  style,
  ...props
}: ServiceTagProps) {
  const config = categoryConfig[category];
  const displayLabel = label ?? config.label;
  const [imageError, setImageError] = useState(false);

  if (variant === 'icon') {
    const boxSize = boxSizeMap[size];
    const iconSize = Math.round(boxSize * iconScaleMap[size]);
    // Icon-only tags have no label, so an empty colored box reads as broken.
    // Fall back to the service-line default glyph when no specific service is
    // named, so a category tag still shows its line icon.
    const iconSrc = serviceName
      ? getServiceIconPath(category, serviceName)
      : getServiceLineIconPath(category);
    const showIcon = !imageError;

    return (
      <span
        className={bdsClass(
          'bds-service-tag',
          'bds-service-tag--icon',
          `bds-service-tag--icon-${size}`,
          `bds-service-tag--${category}`,
          className,
        )}
        style={style}
        title={serviceName || config.label}
        {...props}
      >
        {showIcon && (
          <ServiceTagIcon src={iconSrc} size={iconSize} onError={() => setImageError(true)} />
        )}
      </span>
    );
  }

  const iconSize = tagIconSizeMap[size];
  const showIcon = variant === 'icon-text' && !!serviceName && !imageError;

  return (
    <span
      className={bdsClass(
        'bds-service-tag',
        `bds-service-tag--${size}`,
        `bds-service-tag--${category}`,
        showIcon && 'bds-service-tag--has-icon',
        className,
      )}
      style={style}
      {...props}
    >
      {showIcon && (
        <ServiceTagIcon
          src={getServiceIconPath(category, serviceName!)}
          size={iconSize}
          onError={() => setImageError(true)}
        />
      )}
      {displayLabel}
    </span>
  );
}

/**
 * ServiceTagIcon — the per-service glyph, rendered as a CSS `mask-image` so the
 * fill is recolorable (the masked element takes `currentColor` from the tag's
 * service text token). The custom service SVGs are "System 2" — loaded by URL
 * from the consuming app's `/public/icons`, not Phosphor — so they keep the
 * url() asset model; only the recolor mechanism changes (#574).
 *
 * A `<mask-image>` can't surface a load error, so a visually-hidden `<img>`
 * probe preserves the prior graceful "hide on missing asset" fallback.
 */
function ServiceTagIcon({ src, size, onError }: { src: string; size: number; onError: () => void }) {
  return (
    <>
      <span
        aria-hidden
        className="bds-service-tag__icon"
        // Runtime values: dynamic glyph URL + Figma-driven px box. Static mask
        // sizing/positioning + the currentColor fill live in ServiceTag.css.
        style={{ width: size, height: size, maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }}
      />
      <img src={src} alt="" hidden onError={onError} />
    </>
  );
}

export default ServiceTag;
