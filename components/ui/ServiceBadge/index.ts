// ServiceTag is the primary component — use this for all new code
export { ServiceTag } from './ServiceTag';
export type { ServiceTagProps, ServiceTagVariant } from './ServiceTag';

// ServiceBadge is kept for backwards compatibility — use ServiceTag variant="icon" instead
export { ServiceBadge, categoryConfig, serviceIconOverrides, normalizeServiceName, getServiceIconPath } from './ServiceBadge';
export type {
  ServiceBadgeProps,
  ServiceCategory,
  ServiceBadgeSize,
  ServiceBadgeMode,
} from './ServiceBadge';
