import { type HTMLAttributes, useState } from 'react';
import { bdsClass } from '../../utils';
import {
  categoryConfig,
  getServiceIconPath,
  type ServiceCategory,
  type ServiceBadgeSize,
} from './ServiceBadge';
import './ServiceTag.css';

export type ServiceTagVariant = 'text' | 'icon-text' | 'icon';

export interface ServiceTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Service category — determines color and default label */
  category: ServiceCategory;
  /** Display variant. Default: 'text' */
  variant?: ServiceTagVariant;
  /** Size variant. Default: 'md' */
  size?: ServiceBadgeSize;
  /** Display label — defaults to the category name (e.g. "Back Office"). Pass a service name to label a specific service. */
  label?: string;
  /** Service name for icon resolution — required for icon-text and icon variants to show an icon */
  serviceName?: string;
}

// bds-lint-ignore — icon pixel sizes are Figma-driven
const tagIconSizeMap: Record<ServiceBadgeSize, number> = { sm: 12, md: 16, lg: 20 };

// bds-lint-ignore — Figma-driven badge dimensions
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
    const showIcon = !!serviceName && !imageError;

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
          <img
            src={getServiceIconPath(category, serviceName!)}
            alt=""
            width={iconSize}
            height={iconSize}
            className="bds-service-tag__icon"
            onError={() => setImageError(true)}
          />
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
        <img
          src={getServiceIconPath(category, serviceName!)}
          alt=""
          width={iconSize}
          height={iconSize}
          className="bds-service-tag__icon"
          onError={() => setImageError(true)}
        />
      )}
      {displayLabel}
    </span>
  );
}

export default ServiceTag;
