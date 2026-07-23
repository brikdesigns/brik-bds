import { type HTMLAttributes, useState } from 'react';
import { bdsClass } from '../../utils';
import './Avatar.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
export type AvatarColor = 'green' | 'purple' | 'blue' | 'orange' | 'yellow' | 'red';

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
  /**
   * Accent color for the initials fallback (no effect when an image loads).
   * Backs the initials fill with `--background-accent-{color}` and an
   * AA-safe on-color foreground. Consumers typically hash a stable key
   * (e.g. contact id) to one of these six. Omit for the default brand fill.
   */
  color?: AvatarColor;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar - User profile image with initials fallback and optional status indicator.
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar name="John Doe" size="lg" status="online" />
 * ```
 *
 * @summary Profile image with initials fallback + status dot
 */
export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  color,
  className,
  style,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const showImage = src && !imageError;
  const initials = name ? getInitials(name) : '';

  return (
    <div
      className={bdsClass(
        'bds-avatar',
        `bds-avatar--${size}`,
        // Color only styles the initials fill; when an image loads it covers
        // the background, so applying the class unconditionally is harmless.
        color && !showImage ? `bds-avatar--accent-${color}` : undefined,
        className,
      )}
      style={style}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          className="bds-avatar__image"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials || '?'}</span>
      )}
      {status && (
        <div
          className={bdsClass('bds-avatar__status', `bds-avatar__status--${status}`)}
          title={status}
        />
      )}
    </div>
  );
}

export default Avatar;
