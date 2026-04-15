import { type HTMLAttributes } from 'react';
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
/**
 * Avatar - User profile image with initials fallback and optional status indicator.
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar name="John Doe" size="lg" status="online" />
 * ```
 */
export declare function Avatar({ src, alt, name, size, status, className, style, ...props }: AvatarProps): import("react/jsx-runtime").JSX.Element;
export default Avatar;
