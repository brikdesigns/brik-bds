import { type FormHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Form.css';

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
  return (
    <form
      className={bdsClass('bds-form', `bds-form--gap-${gap}`, className)}
      style={style}
      {...props}
    >
      {/* Header */}
      {(title || description) && (
        <div className="bds-form__header">
          {title && <h3 className="bds-form__title">{title}</h3>}
          {description && <p className="bds-form__description">{description}</p>}
        </div>
      )}

      {/* Form-level messages */}
      {error && <p className="bds-form__error" role="alert">{error}</p>}
      {success && <p className="bds-form__success" role="status">{success}</p>}

      {/* Fields */}
      <div className={bdsClass(
        'bds-form__fields',
        `bds-form__fields--${layout}`,
        `bds-form__fields--gap-${gap}`,
      )}>
        {children}
      </div>

      {/* Footer */}
      {footer && <div className="bds-form__footer">{footer}</div>}
    </form>
  );
}

export default Form;
