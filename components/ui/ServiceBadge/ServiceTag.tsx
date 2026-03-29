import { type HTMLAttributes, useState } from 'react';
import { bdsClass } from '../../utils';
import {
  categoryConfig,
  getServiceIconPath,
  type ServiceCategory,
  type ServiceBadgeSize,
} from './ServiceBadge';
import './ServiceTag.css';

export type ServiceTagVariant = 'text' | 'icon-text';

export interface ServiceTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Service category — determines color and default label */
  category: ServiceCategory;
  /** Display variant. Default: 'text' */
  variant?: ServiceTagVariant;
  /** Size variant. Default: 'md' */
  size?: ServiceBadgeSize;
  /** Display label — defaults to the category name (e.g. "Back Office"). Pass a service name to label a specific service. */
  label?: string;
  /** Service name for icon resolution — required for icon-text variant to show an icon */
  serviceName?: string;
}

// bds-lint-ignore — icon pixel sizes are Figma-driven
const tagIconSizeMap: Record<ServiceBadgeSize, number> = { sm: 12, md: 16, lg: 20 };

/**
 * ServiceTag — text label for a Brik service category or individual service.
 *
 * Two variants:
 * - `text` — colored pill with label text only
 * - `icon-text` — colored pill with service icon + label text
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
