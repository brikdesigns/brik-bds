import { type FormHTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Form layout direction
 */
export type FormLayout = 'vertical' | 'horizontal';

/**
 * Form component props
 */
export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Form fields and content */
  children: ReactNode;
  /** Layout direction for form fields */
  layout?: FormLayout;
  /** Gap between form fields */
  gap?: 'sm' | 'md' | 'lg';
  /** Form-level error message */
  error?: string;
  /** Form-level success message */
  success?: string;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Footer content (submit button, cancel, etc.) */
  footer?: ReactNode;
}

/**
 * Gap sizes mapping to BDS tokens
 */
const gapMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'var(--gap-md)',
  md: 'var(--gap-lg)',
  lg: 'var(--gap-xl)',
};

/**
 * Form container styles
 *
 * Token reference:
 * - --gap-lg = 16px (default gap between fields)
 */
const formStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box',
};

/**
 * Title styles
 *
 * Token reference:
 * - --font-family-heading
 * - --heading-sm = font-size/300 = 20px
 * - --font-weight-bold = 700
 * - --text-primary
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-sm)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-snug)',
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Description styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-sm = 14px
 * - --text-secondary
 */
const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-secondary)',
  margin: 0,
};

/**
 * Error message styles
 *
 * Token reference:
 * - --color-system-red (error color)
 * - --font-family-body
 * - --body-sm = 14px
 */
const errorStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--color-system-red)',
  margin: 0,
  padding: 'var(--padding-sm)',
  backgroundColor: 'var(--color-system-red)',
  background: 'color-mix(in srgb, var(--color-system-red) 8%, transparent)',
  borderRadius: 'var(--border-radius-md)',
};

/**
 * Success message styles
 *
 * Token reference:
 * - --color-system-green (success color)
 */
const successStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--color-system-green)',
  margin: 0,
  padding: 'var(--padding-sm)',
  background: 'color-mix(in srgb, var(--color-system-green) 8%, transparent)',
  borderRadius: 'var(--border-radius-md)',
};

/**
 * Footer styles
 *
 * Token reference:
 * - --gap-md = 8px (gap between footer actions)
 * - --padding-md = 16px (top padding)
 */
const footerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--gap-md)',
  paddingTop: 'var(--padding-md)',
};

/**
 * Form - BDS form container with layout and messaging
 *
 * A wrapper for form fields that provides consistent layout, spacing,
 * and form-level error/success messaging.
 *
 * @example
 * ```tsx
 * <Form
 *   title="Contact Us"
 *   description="We'll get back to you within 24 hours."
 *   onSubmit={handleSubmit}
 *   footer={<Button type="submit">Send Message</Button>}
 * >
 *   <TextInput label="Name" placeholder="Your name" />
 *   <TextInput label="Email" type="email" placeholder="you@example.com" />
 *   <TextArea label="Message" placeholder="How can we help?" />
 * </Form>
 * ```
 */
export function Form({
  children,
  layout = 'vertical',
  gap = 'md',
  error,
  success,
  title,
  description,
  footer,
  className = '',
  style,
  ...props
}: FormProps) {
  const isHorizontal = layout === 'horizontal';

  const fieldsStyles: CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    flexWrap: isHorizontal ? 'wrap' : undefined,
    gap: gapMap[gap],
    width: '100%',
  };

  return (
    <form
      className={bdsClass('bds-form', className)}
      style={{ ...formStyles, gap: gapMap[gap], ...style }}
      {...props}
    >
      {/* Header */}
      {(title || description) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
          {title && <h3 style={titleStyles}>{title}</h3>}
          {description && <p style={descriptionStyles}>{description}</p>}
        </div>
      )}

      {/* Form-level messages */}
      {error && <p style={errorStyles} role="alert">{error}</p>}
      {success && <p style={successStyles} role="status">{success}</p>}

      {/* Fields */}
      <div style={fieldsStyles}>{children}</div>

      {/* Footer */}
      {footer && <div style={footerStyles}>{footer}</div>}
    </form>
  );
}

export default Form;
