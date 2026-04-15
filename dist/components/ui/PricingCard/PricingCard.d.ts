import { type HTMLAttributes, type ReactNode } from 'react';
import './PricingCard.css';
/**
 * PricingCard component props
 */
export interface PricingCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Plan/tier name (e.g., "Starter", "Professional") */
    title: string;
    /** Price display (e.g., "$49", "Free", "$199") */
    price: string;
    /** Billing period (e.g., "/month", "/year", "one-time") */
    period?: string;
    /** Short description of the plan */
    description?: string;
    /** List of included features */
    features?: string[];
    /** Action element (typically a Button) */
    action?: ReactNode;
    /** Badge above the title (e.g., "Most popular") */
    badge?: ReactNode;
    /** Whether this is the highlighted/recommended plan */
    highlighted?: boolean;
}
/**
 * PricingCard - BDS pricing tier display card
 *
 * Displays a pricing plan with title, price, description, feature list,
 * and action button. Supports a highlighted state for the recommended plan.
 *
 * @example
 * ```tsx
 * <PricingCard
 *   title="Professional"
 *   price="$49"
 *   period="/month"
 *   description="For growing businesses"
 *   features={['Unlimited projects', 'Priority support', 'Custom domain']}
 *   action={<Button variant="primary">Get started</Button>}
 *   highlighted
 * />
 * ```
 */
export declare function PricingCard({ title, price, period, description, features, action, badge, highlighted, className, style, ...props }: PricingCardProps): import("react/jsx-runtime").JSX.Element;
export default PricingCard;
