import { type HTMLAttributes, type ReactNode } from 'react';
import './PageHeader.css';
export interface MetadataItem {
    label: string;
    value: ReactNode;
}
export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    subtitle?: string;
    /** Badge displayed to the left of the title (e.g. ServiceBadge) */
    badge?: ReactNode;
    breadcrumbs?: ReactNode;
    actions?: ReactNode;
    tabs?: ReactNode;
    metadata?: MetadataItem[];
    /** Summary content (e.g. stat cards) rendered between metadata and tabs. */
    stats?: ReactNode;
    /** Show divider and top padding above metadata. Default: true */
    showDivider?: boolean;
    /** Remove horizontal padding (for layouts that provide their own). Default: false */
    flush?: boolean;
    /** Title scale. Default: 'lg' */
    size?: 'sm' | 'md' | 'lg';
}
/**
 * PageHeader — composable page-level header with breadcrumbs, badge, actions, metadata, stats, and tabs.
 */
export declare function PageHeader({ title, subtitle, badge, breadcrumbs, actions, tabs, metadata, stats, showDivider, flush, size, className, style, ...props }: PageHeaderProps): import("react/jsx-runtime").JSX.Element;
export default PageHeader;
