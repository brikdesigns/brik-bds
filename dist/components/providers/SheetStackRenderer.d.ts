import { type ReactNode } from 'react';
import { type SheetFrame } from './SheetStackProvider';
export interface RenderFrameContext {
    /** Close the entire sheet stack */
    closeAll: () => void;
    /** Push a new sheet onto the stack (drill into related record) */
    pushSheet: (type: string, props: Record<string, unknown>, opts?: {
        variant?: 'default' | 'floating';
        title?: string;
    }) => void;
    /** Pop the current sheet (go back) */
    back: () => void;
    /** Current stack depth */
    depth: number;
    /** App-level props passed through to every frame (e.g. { isAdmin }) */
    globalFrameProps: Record<string, unknown>;
}
export interface SheetStackRendererProps {
    /**
     * Render function called for the topmost stack frame.
     * Return the sheet body content (the View/Edit component).
     */
    renderFrame: (frame: SheetFrame, ctx: RenderFrameContext) => ReactNode;
    /** Sheet width (default: '600px') */
    width?: string;
    /** App-level props passed through to every frame's RenderFrameContext */
    globalFrameProps?: Record<string, unknown>;
}
/**
 * SheetStackRenderer — reads the sheet stack context and renders the
 * topmost frame inside a BDS `<Sheet>`.
 *
 * Place this once in your app layout, alongside `SheetStackProvider`.
 *
 * The `renderFrame` callback maps frame types to your app's sheet components.
 * BDS doesn't know about your entity types — the app defines the mapping.
 *
 * @example
 * ```tsx
 * <SheetStackRenderer
 *   renderFrame={(frame, ctx) => {
 *     const Component = sheetComponents[frame.type];
 *     return <Component {...frame.props} onClose={ctx.closeAll} onNavigate={ctx.pushSheet} />;
 *   }}
 * />
 * ```
 */
export declare function SheetStackRenderer({ renderFrame, width, globalFrameProps }: SheetStackRendererProps): import("react/jsx-runtime").JSX.Element | null;
export default SheetStackRenderer;
