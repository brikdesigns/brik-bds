import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import { categoryConfig, resolveServiceIcon, type ServiceLine, type ServiceTagSize } from './service-config';
import { SERVICE_ICON_SVGS } from './service-icons.generated';
import './ServiceTag.css';

export type ServiceTagVariant = 'text' | 'icon-text' | 'icon';

export interface ServiceTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Service line — determines color and default label */
  category: ServiceLine;
  /** Display variant. Default: 'text' */
  variant?: ServiceTagVariant;
  /** Size variant. Default: 'md' */
  size?: ServiceTagSize;
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
// Glyphs are filled 20×20 SVGs with ~30% built-in inset, so the visible mark is
// only ~70% of the box — sizes are set generously vs tag height (28/32/40) to
// read clearly at small scale. sm==md previously, so md never looked larger.
const tagIconSizeMap: Record<ServiceTagSize, number> = { sm: 18, md: 22, lg: 24 };

// bds-lint-ignore — component-level badge dimensions (code is SoT; see above).
const iconScaleMap: Record<ServiceTagSize, number> = { sm: 0.65, md: 0.7, lg: 0.7 };
const boxSizeMap: Record<ServiceTagSize, number> = { sm: 20, md: 28, lg: 40 };

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

  if (variant === 'icon') {
    const boxSize = boxSizeMap[size];
    const iconSize = Math.round(boxSize * iconScaleMap[size]);
    // Icon-only tags have no label, so an empty box reads as broken. Resolution
    // always yields a bundled glyph (service glyph, else the service-line
    // default), so a category tag with no service still shows its line icon —
    // and it can never 404.
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
        <ServiceTagIcon glyph={resolveServiceIcon(category, serviceName)} size={iconSize} />
      </span>
    );
  }

  const iconSize = tagIconSizeMap[size];
  const showIcon = variant === 'icon-text' && !!serviceName;

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
      {showIcon && <ServiceTagIcon glyph={resolveServiceIcon(category, serviceName)} size={iconSize} />}
      {displayLabel}
    </span>
  );
}

/**
 * ServiceTagIcon — the per-service glyph, rendered as an inline SVG bundled by
 * BDS (#1242). The glyph markup ships in `service-icons.generated.ts`, so it
 * paints on first render with no fetch and no possible 404 — resolution always
 * yields a bundled key. `fill="currentColor"` recolors the mark to the tag's
 * service text token (replacing the old mask-image recolor; #574).
 *
 * The source marks are 20×20 with a ~30% symmetric transparent inset; the
 * `3 3 14 14` viewBox crops that padding so the visible glyph fills the box
 * (the SVG-native equivalent of the prior `mask-size: 140%`).
 */
function ServiceTagIcon({ glyph, size }: { glyph: string; size: number }) {
  const svg = SERVICE_ICON_SVGS[glyph];
  if (!svg) return null;
  return (
    <svg
      aria-hidden
      focusable={false}
      className="bds-service-tag__icon"
      width={size}
      height={size}
      viewBox="3 3 14 14"
      fill="currentColor"
      // Trusted, build-time-bundled markup from ServiceTag/icons/*/*.svg — never
      // user input. Inlined (not a URL) so the glyph paints with no network.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default ServiceTag;
