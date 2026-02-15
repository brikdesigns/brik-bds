import { type ReactNode, type HTMLAttributes, type CSSProperties, useState } from 'react';

/**
 * Tooltip placement positions
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip component props
 */
export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Tooltip content to display */
  content: ReactNode;
  /** Placement position relative to children */
  placement?: TooltipPlacement;
  /** Children (trigger element) */
  children: ReactNode;
}

/**
 * Position-based tooltip styles
 * Arrow points toward the trigger element
 */
const placementStyles: Record<TooltipPlacement, { tooltip: CSSProperties; arrow: CSSProperties }> = {
  top: {
    tooltip: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 'var(--_space---md)',
    },
    arrow: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderTopColor: 'var(--grayscale--darkest, #333)',
    },
  },
  bottom: {
    tooltip: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: 'var(--_space---md)',
    },
    arrow: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderBottomColor: 'var(--grayscale--darkest, #333)',
    },
  },
  left: {
    tooltip: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: 'var(--_space---md)',
    },
    arrow: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      borderLeftColor: 'var(--grayscale--darkest, #333)',
    },
  },
  right: {
    tooltip: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: 'var(--_space---md)',
    },
    arrow: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      borderRightColor: 'var(--grayscale--darkest, #333)',
    },
  },
};

/**
 * Base tooltip styles using BDS tokens
 *
 * Token reference:
 * - --grayscale--darkest = #333 (dark background)
 * - --grayscale--white (white text)
 * - --_typography---font-family--label (tooltip font)
 * - --_typography---label--sm (small label size)
 * - --_border-radius---sm (tooltip corners)
 */
const tooltipBaseStyles: CSSProperties = {
  position: 'absolute',
  padding: 'var(--_space---sm) var(--_space---lg)',
  backgroundColor: 'var(--grayscale--darkest, #333)',
  color: 'var(--grayscale--white, #fff)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--sm)',
  lineHeight: 'var(--font-line-height--150)',
  borderRadius: 'var(--_border-radius---sm)',
  whiteSpace: 'nowrap',
  zIndex: 1000,
  pointerEvents: 'none',
  opacity: 0,
  transition: 'opacity 0.2s ease-out',
};

/**
 * Arrow styles (small triangle pointing to trigger)
 */
const arrowBaseStyles: CSSProperties = {
  position: 'absolute',
  width: 0,
  height: 0,
  borderStyle: 'solid',
  borderWidth: '4px',
  borderColor: 'transparent',
};

/**
 * Tooltip - BDS themed tooltip component
 *
 * Shows contextual information on hover/focus.
 * Positioned relative to trigger element with arrow indicator.
 *
 * @example
 * ```tsx
 * <Tooltip content="Click to edit">
 *   <button>Edit</button>
 * </Tooltip>
 *
 * <Tooltip content="Helpful info" placement="right">
 *   <span>?</span>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  placement = 'top',
  children,
  className = '',
  style,
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const { tooltip: tooltipPosition, arrow: arrowPosition } = placementStyles[placement];

  const tooltipStyles: CSSProperties = {
    ...tooltipBaseStyles,
    ...tooltipPosition,
    opacity: isVisible ? 1 : 0,
  };

  const arrowStyles: CSSProperties = {
    ...arrowBaseStyles,
    ...arrowPosition,
  };

  const containerStyles: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...style,
  };

  return (
    <div
      className={className || undefined}
      style={containerStyles}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      {...props}
    >
      {children}
      <div role="tooltip" style={tooltipStyles}>
        {content}
        <div style={arrowStyles} />
      </div>
    </div>
  );
}

export default Tooltip;
