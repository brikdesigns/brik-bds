import { type HTMLAttributes } from 'react';
import './ServiceBadge.css';
export type ServiceCategory = 'brand' | 'marketing' | 'information' | 'product' | 'service';
export type ServiceBadgeSize = 'sm' | 'md' | 'lg';
/** @deprecated `mode` is no longer used. ServiceBadge is icon-only. Use ServiceTag for text labels. */
export type ServiceBadgeMode = 'badge' | 'label';
export interface ServiceBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Service category */
    category: ServiceCategory;
    /**
     * Display mode
     * @deprecated This prop is ignored. ServiceBadge is icon-only going forward. Use `ServiceTag variant="icon"` for the same visual. Use `ServiceTag variant="text"` or `variant="icon-text"` for text labels.
     */
    mode?: ServiceBadgeMode;
    /** Size variant */
    size?: ServiceBadgeSize;
    /** Optional service name — used to resolve the specific service icon SVG */
    serviceName?: string;
}
export declare const categoryConfig: Record<ServiceCategory, {
    token: string;
    label: string;
}>;
export declare const serviceIconOverrides: Record<string, string>;
export declare function normalizeServiceName(name: string): string;
export declare function getServiceIconPath(category: ServiceCategory, serviceName: string): string;
/**
 * @deprecated Use `ServiceTag variant="icon"` instead. ServiceBadge is kept for backwards compatibility only.
 *
 * ServiceBadge — icon-only colored square badge for a Brik service category.
 * The `mode="label"` prop is no longer supported; use `ServiceTag` for text labels.
 *
 * @example
 * // Migration: replace ServiceBadge with ServiceTag
 * // Old: <ServiceBadge category="brand" serviceName="Brand Identity Bundle" size="lg" />
 * // New: <ServiceTag category="brand" variant="icon" serviceName="Brand Identity Bundle" size="lg" />
 */
export declare function ServiceBadge({ category, mode: _mode, size, serviceName, className, style, ...props }: ServiceBadgeProps): import("react/jsx-runtime").JSX.Element;
export default ServiceBadge;
