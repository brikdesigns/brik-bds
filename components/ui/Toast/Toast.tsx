import { type ReactNode, type CSSProperties, type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';

/**
 * Toast component props
 */
export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text below the title */
  description?: ReactNode;
  /** Called when the close button is clicked */
  onDismiss?: () => void;
}

/**
 * Toast container styles
 *
 * Token reference:
 * - --grayscale--black (dark background — no surface--inverse token)
 * - --_color---text--inverse (white text)
 * - --space--700 = 28px (padding)
 * - --_border-radius---lg = 8px (rounded corners)
 * - Shadow: 0 4px 32px 32px rgba(0,0,0,0.24) per Figma shadow-xl
 */
const toastStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--_space---gap--lg)',
  backgroundColor: 'var(--grayscale--black, black)',
  color: 'var(--_color---text--inverse)',
  padding: 'var(--_space---xl)',
  borderRadius: 'var(--_border-radius---lg)',
  boxShadow: '0px 4px 32px 32px rgba(0, 0, 0, 0.24)',
  width: '100%',
  maxWidth: '600px',
  boxSizing: 'border-box',
};

/**
 * Content wrapper — title + description stacked
 *
 * Token reference:
 * - --_space---gap--sm = 6px (gap between title and description)
 */
const contentStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--sm)',
  minWidth: 0,
  flex: '1 1 0',
};

/**
 * Title text styles
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --font-weight--semi-bold (SemiBold)
 * - --_typography---label--md-base = font-size-100 = 16px
 * - --font-line-height--100 = 100% (tight)
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  fontSize: 'var(--_typography---label--md-base)',
  lineHeight: 'var(--font-line-height--100)',
};

/**
 * Description text styles
 *
 * Token reference:
 * - --_typography---font-family--body (body font)
 * - --font-weight--regular (Regular)
 * - --_typography---body--md-base = font-size-100 = 16px
 * - --font-line-height--150 = 150% (comfortable reading)
 */
const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--body)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 'var(--font-line-height--150)',
};

/**
 * Close button — brand-primary background, 48px square
 *
 * Token reference:
 * - --_color---background--brand-primary (blue bg)
 * - --_border-radius---md = 4px (button corners)
 * - --_typography---body--sm = font-size-50 = 14px (icon size)
 */
const closeButtonStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  backgroundColor: 'var(--_color---background--brand-primary)',
  color: 'var(--_color---text--inverse)',
  border: 'none',
  borderRadius: 'var(--_border-radius---md)',
  cursor: 'pointer',
  flexShrink: 0,
  fontSize: 'var(--_typography---body--sm)',
};

/**
 * Toast - BDS notification toast component
 *
 * A dark overlay notification with title, description, and close button.
 * Uses inverse colors for high contrast. Typically positioned fixed at
 * the bottom of the viewport by the consuming application.
 *
 * @example
 * ```tsx
 * <Toast
 *   title="Changes saved"
 *   description="Your settings have been updated"
 *   onDismiss={() => setShowToast(false)}
 * />
 * ```
 */
export function Toast({
  title,
  description,
  onDismiss,
  className,
  style,
  ...props
}: ToastProps) {
  return (
    <div role="alert" className={bdsClass('bds-toast', className)} style={{ ...toastStyles, ...style }} {...props}>
      <div style={contentStyles}>
        <span style={titleStyles}>{title}</span>
        {description && <span style={descriptionStyles}>{description}</span>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          style={closeButtonStyles}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      )}
    </div>
  );
}

export default Toast;
