import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import { Avatar } from '../Avatar';
import { ProgressBar } from '../ProgressBar';

/**
 * BoardHeader — The header section of a BoardColumn.
 *
 * Composes BDS Avatar and ProgressBar to show a person/entity
 * with optional progress indicator. Sits at the top of a column
 * to identify who or what the column represents.
 *
 * @example
 * ```tsx
 * <BoardHeader
 *   name="Cassidy Moore"
 *   subtitle="Dental Hygienist"
 *   avatarSrc="/cassidy.jpg"
 *   progress={37}
 * />
 * ```
 */
export interface BoardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Display name (also used for avatar initials fallback) */
  name: string;
  /** Secondary text (role, department, etc.) */
  subtitle?: string;
  /** Avatar image URL */
  avatarSrc?: string;
  /** Progress value 0–100 (omit to hide progress bar) */
  progress?: number;
  /** Accessible label for the progress bar */
  progressLabel?: string;
  /** Optional content rendered below the header */
  children?: ReactNode;
}

export function BoardHeader({
  name,
  subtitle,
  avatarSrc,
  progress,
  progressLabel,
  children,
  className,
  style,
  ...props
}: BoardHeaderProps) {
  return (
    <div
      className={bdsClass('bds-board-header', className)}
      style={style}
      {...props}
    >
      <div className="bds-board-header__profile">
        <Avatar
          src={avatarSrc}
          name={name}
          size="lg"
        />
        <div className="bds-board-header__info">
          <p className="bds-board-header__name">{name}</p>
          {subtitle && <p className="bds-board-header__subtitle">{subtitle}</p>}
        </div>
      </div>

      {progress !== undefined && (
        <div className="bds-board-header__progress">
          <ProgressBar
            value={progress}
            label={progressLabel ?? `${name} progress`}
          />
        </div>
      )}

      {children && (
        <div className="bds-board-header__content">
          {children}
        </div>
      )}
    </div>
  );
}

export default BoardHeader;
