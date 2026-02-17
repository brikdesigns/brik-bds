import { type HTMLAttributes, type CSSProperties, useState } from 'react';

/**
 * Avatar size variants
 */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Avatar status indicator
 */
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

/**
 * Avatar component props
 */
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Name for generating initials (fallback when no image) */
  name?: string;
  /** Size variant */
  size?: AvatarSize;
  /** Status indicator */
  status?: AvatarStatus;
}

/**
 * Size configurations using BDS tokens
 *
 * Token reference:
 * - --_space---md = 8px
 * - --_space---lg = 16px
 * - --_space---xl = 24px
 * - --_space---xxl = 32px
 */
const sizeConfig: Record<AvatarSize, { size: string; fontSize: string }> = {
  sm: { size: '32px', fontSize: 'var(--_typography---body--xs)' },
  md: { size: '40px', fontSize: 'var(--_typography---body--sm)' },
  lg: { size: '48px', fontSize: 'var(--_typography---body--md-base)' },
  xl: { size: '64px', fontSize: 'var(--_typography---heading--small)' },
};

/**
 * Status indicator colors using BDS tokens
 *
 * Token reference:
 * - --system--green = #27ae60 (online)
 * - --system--gray (offline)
 * - --system--red = #eb5757 (busy)
 * - --system--yellow = #f2c94c (away)
 */
const statusColors: Record<AvatarStatus, string> = {
  online: 'var(--system--green)',
  offline: 'var(--grayscale--light)',
  busy: 'var(--system--red)',
  away: 'var(--system--yellow)',
};

/**
 * Base avatar container styles using BDS tokens
 *
 * Token reference:
 * - --_color---background--brand-primary (background for initials)
 * - --_color---text--inverse (text color for initials)
 * - --_typography---font-family--label (font for initials)
 * - --border-radius--circle = 9999px (circular shape)
 */
const getAvatarStyles = (size: AvatarSize): CSSProperties => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: sizeConfig[size].size,
  height: sizeConfig[size].size,
  borderRadius: 'var(--border-radius--circle)',
  backgroundColor: 'var(--_color---background--brand-primary)',
  color: 'var(--_color---text--inverse)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: sizeConfig[size].fontSize,
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  overflow: 'hidden',
  flexShrink: 0,
  userSelect: 'none',
});

/**
 * Image styles
 */
const imageStyles: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

/**
 * Status indicator styles
 */
const getStatusStyles = (size: AvatarSize, status: AvatarStatus): CSSProperties => {
  const statusSize = size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px';

  return {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: statusSize,
    height: statusSize,
    borderRadius: '50%',
    backgroundColor: statusColors[status],
    border: '2px solid var(--_color---background--input)',
  };
};

/**
 * Generate initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar - BDS themed avatar component
 *
 * Uses CSS variables for theming. Supports images with fallback to
 * initials, size variants, and optional status indicators. All spacing,
 * colors, and typography reference BDS tokens.
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar name="John Doe" size="lg" />
 * <Avatar name="Jane Smith" status="online" />
 * <Avatar src="/user.jpg" alt="User" status="busy" size="sm" />
 * ```
 */
export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className = '',
  style,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const showImage = src && !imageError;
  const initials = name ? getInitials(name) : '';

  const combinedStyles: CSSProperties = {
    ...getAvatarStyles(size),
    ...style,
  };

  return (
    <div
      className={className || undefined}
      style={combinedStyles}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          style={imageStyles}
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials || '?'}</span>
      )}
      {status && (
        <div style={getStatusStyles(size, status)} title={status} />
      )}
    </div>
  );
}

export default Avatar;
