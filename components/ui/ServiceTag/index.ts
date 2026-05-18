// ServiceTag is the canonical component
export { ServiceTag } from './ServiceTag';
export type { ServiceTagProps, ServiceTagVariant } from './ServiceTag';

// Shared service-tag domain config — re-exported for consumer convenience
export { categoryConfig, serviceIconOverrides, normalizeServiceName, getServiceIconPath } from './service-config';
export type { ServiceCategory, ServiceBadgeSize } from './service-config';
