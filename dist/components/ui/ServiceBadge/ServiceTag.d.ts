import { type HTMLAttributes } from 'react';
import { type ServiceCategory, type ServiceBadgeSize } from './ServiceBadge';
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
export declare function ServiceTag({ category, variant, size, label, serviceName, className, style, ...props }: ServiceTagProps): import("react/jsx-runtime").JSX.Element;
export default ServiceTag;
