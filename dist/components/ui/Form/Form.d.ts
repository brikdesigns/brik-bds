import { type FormHTMLAttributes, type ReactNode } from 'react';
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
export declare function Form({ children, layout, gap, error, success, title, description, footer, className, style, ...props }: FormProps): import("react/jsx-runtime").JSX.Element;
export default Form;
