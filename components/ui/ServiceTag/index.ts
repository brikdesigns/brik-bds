// ServiceTag is the canonical component
export { ServiceTag } from './ServiceTag';
export type { ServiceTagProps, ServiceTagVariant } from './ServiceTag';

// Shared service-tag domain config — re-exported for consumer convenience
export {
  categoryConfig,
  serviceIconOverrides,
  normalizeServiceName,
  resolveServiceIcon,
  getServiceIconPath,
} from './service-config';
export type { ServiceLine, ServiceTagSize } from './service-config';
// @deprecated alias of ServiceTagSize — removable next major. See service-config.ts.
export type { ServiceBadgeSize } from './service-config';
