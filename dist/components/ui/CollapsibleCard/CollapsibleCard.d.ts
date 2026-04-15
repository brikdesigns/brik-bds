import { type ReactNode, type HTMLAttributes } from 'react';
import './CollapsibleCard.css';
/**
 * CollapsibleCard component props
 */
export interface CollapsibleCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Section label displayed above the title (e.g. "Section 01") */
    sectionLabel?: string;
    /** Card title */
    title: string;
    /** Content revealed when expanded */
    children: ReactNode;
    /** Controlled: whether the card is expanded */
    isOpen?: boolean;
    /** Callback when open state changes */
    onOpenChange?: (isOpen: boolean) => void;
    /** Initial open state (uncontrolled) */
    defaultOpen?: boolean;
    /** Additional action buttons rendered next to the toggle */
    headerActions?: ReactNode;
}
/**
 * CollapsibleCard - BDS composite component
 *
 * A card with a collapsible content area, section label, title,
 * and icon button toggle (+/−). Designed for proposal sections,
 * settings panels, or any content that benefits from progressive disclosure.
 *
 * Composes: Card surface + icon button + collapse state
 *
 * @example
 * ```tsx
 * <CollapsibleCard
 *   sectionLabel="Section 01"
 *   title="Overview and Goals"
 *   defaultOpen={false}
 * >
 *   <p>Content goes here</p>
 * </CollapsibleCard>
 * ```
 */
export declare function CollapsibleCard({ sectionLabel, title, children, isOpen, onOpenChange, defaultOpen, headerActions, className, style, ...props }: CollapsibleCardProps): import("react/jsx-runtime").JSX.Element;
export default CollapsibleCard;
