'use client';

import { type ReactNode, type CSSProperties } from 'react';
import { Icon } from '@iconify/react';
import { Sheet } from '../ui/Sheet';
import { useSheetStack, type SheetFrame } from './SheetStackProvider';
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

// ─── Styles ─────────────────────────────────────────────────────────────────

const backBtnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  opacity: 0.6,
  transition: 'opacity 0.2s',
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--gap-sm)',
};

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
export function SheetStackRenderer({ renderFrame, width = '600px', globalFrameProps = {} }: SheetStackRendererProps) {
  const { stack, isOpen, isExiting, direction, back, closeAll, pushSheet } = useSheetStack();

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

  // Build the title — includes back arrow when stack is deep
  const titleContent = isDeep ? (
    <span style={headerRowStyle}>
      <button
        type="button"
        style={backBtnStyle}
        onClick={back}
        aria-label="Back"
        className="bds-sheet__back-btn"
      >
        <Icon icon="ph:arrow-left-bold" />
      </button>
      {topFrame.title ?? topFrame.type}
    </span>
  ) : (
    topFrame.title ?? topFrame.type
  );

  // Animation class for frame content
  const frameClass = bdsClass(
    'bds-sheet-stack__frame',
    isExiting ? 'bds-sheet-stack__frame--exiting' : '',
    !isExiting && direction === 'back' ? 'bds-sheet-stack__frame--back' : '',
  );

  return (
    <Sheet
      isOpen
      onClose={closeAll}
      title={titleContent}
      width={width}
      variant={topFrame.variant}
      closeOnEscape
    >
      <div className={frameClass} key={topFrame.key}>
        {renderFrame(topFrame, ctx)}
      </div>
    </Sheet>
  );
}

export default SheetStackRenderer;
