import { type HTMLAttributes, useState } from 'react';
import { bdsClass } from '../../utils';
import './Avatar.css';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

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
 */
export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className,
  style,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const showImage = src && !imageError;
  const initials = name ? getInitials(name) : '';

  return (
    <div
      className={bdsClass('bds-avatar', `bds-avatar--${size}`, className)}
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
