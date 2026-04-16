'use client';

import { type ReactNode } from 'react';
import { Sheet } from '../ui/Sheet';
import { useSheetStack, useSheetConfig, type SheetFrame } from './SheetStackProvider';
import { bdsClass } from '../utils';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RenderFrameContext {
  /** Close the entire sheet stack */
  closeAll: () => void;
  /** Push a new sheet onto the stack (drill into related record) */
  pushSheet: (type: string, props: Record<string, unknown>, opts?: { variant?: 'default' | 'floating'; title?: string }) => void;
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

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * SheetStackRenderer — reads the sheet stack context and renders the
 * topmost frame inside a BDS `<Sheet>`.
 *
 * Place this once in your app layout, alongside `SheetStackProvider`.
 *
 * The `renderFrame` callback maps frame types to your app's sheet components.
 * BDS doesn't know about your entity types — the app defines the mapping.
 *
 * Headless sheet components call `useConfigureSheet()` to push their
 * body, title, subtitle, tabs, footer, or read/edit mode up to this
 * renderer. When the stack is deep (>1 frame), a back button auto-renders
 * in the header to pop back to the previous frame.
 *
 * @example
 * ```tsx
 * <SheetStackRenderer
 *   renderFrame={(frame, ctx) => {
 *     const Component = sheetComponents[frame.type];
 *     return <Component {...frame.props} onNavigate={ctx.pushSheet} />;
 *   }}
 * />
 * ```
 */
export function SheetStackRenderer({ renderFrame, width = '600px', globalFrameProps = {} }: SheetStackRendererProps) {
  const { stack, isOpen, isExiting, direction, back, closeAll, pushSheet } = useSheetStack();
  const config = useSheetConfig();

  if (!isOpen) return null;

  const topFrame = stack[stack.length - 1];
  const isDeep = stack.length > 1;

  const ctx: RenderFrameContext = {
    closeAll,
    pushSheet,
    back,
    depth: stack.length,
    globalFrameProps,
  };

  // Resolve title: prefer headless config title, fall back to frame title
  const resolvedTitle = config.title ?? topFrame.title ?? topFrame.type;

  // Animation class for frame content
  const frameClass = bdsClass(
    'bds-sheet-stack__frame',
    isExiting ? 'bds-sheet-stack__frame--exiting' : '',
    !isExiting && direction === 'back' ? 'bds-sheet-stack__frame--back' : '',
  );

  // Headless components return null but must stay mounted for effects (data fetching,
  // configureSheet calls). Render them in a hidden container outside the Sheet body
  // so they survive the tabs/body swap inside the Sheet.
  const frameContent = renderFrame(topFrame, ctx);

  return (
    <>
      <div style={{ display: 'none' }}>{frameContent}</div>
      <Sheet
        isOpen
        onClose={closeAll}
        title={resolvedTitle}
        subtitle={config.subtitle}
        onBack={isDeep ? back : undefined}
        width={width}
        variant={topFrame.variant}
        closeOnEscape
        tabs={config.tabs}
        activeTab={config.activeTab}
        onTabChange={config.onTabChange}
        footer={config.footer}
        mode={config.mode}
        onEdit={config.onEdit}
        onSave={config.onSave}
        onCancel={config.onCancel}
        editLabel={config.editLabel}
        saveLabel={config.saveLabel}
        cancelLabel={config.cancelLabel}
        closeLabel={config.closeLabel}
        saveDisabled={config.saveDisabled}
        saveLoading={config.saveLoading}
      >
        <div className={frameClass} key={topFrame.key}>
          {config.body}
        </div>
      </Sheet>
    </>
  );
}

export default SheetStackRenderer;
