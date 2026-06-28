import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { XBold } from '../../icons';
import { bdsClass } from '../../utils';
import './CloseButton.css';

/**
 * CloseButton props — icon-only dismiss affordance.
 *
 * Inherits all native `<button>` attributes (`onClick`, `disabled`, `type`,
 * `data-*`, …) except `children` — the glyph is fixed.
 */
export interface CloseButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible label announced by screen readers. Defaults to `"Close"`. */
  label?: string;
}

/**
 * CloseButton — the canonical dismiss affordance for overlays (Modal, Sheet,
 * Toast, Banner) and any panel that can be closed.
 *
 * Renders a bold Phosphor "X" at `--icon-lg` (20px) inside a compact,
 * glyph-dominant ghost box — so the mark reads as the dominant element of its
 * container rather than a small icon floating in empty space. Centralizing the
 * close glyph here means weight/size/state tweaks land once and every overlay
 * absorbs them.
 *
 * Icon-only, so `label` is always applied as `aria-label` (defaults to
 * `"Close"`; override for context, e.g. `"Dismiss notification"`).
 *
 * @example
 * <CloseButton onClick={onClose} />
 * <CloseButton label="Dismiss notification" onClick={onDismiss} />
 *
 * @summary Canonical icon-only dismiss affordance for overlays
 */
export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton({ label = 'Close', type = 'button', className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={bdsClass('bds-close-button', className)}
        aria-label={label}
        {...rest}
      >
        <Icon icon={XBold} aria-hidden="true" />
      </button>
    );
  },
);

CloseButton.displayName = 'CloseButton';

export default CloseButton;
