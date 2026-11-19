import { useLayoutEffect, type RefObject } from 'react';
import {
  autoUpdate,
  computePosition,
  detectOverflow,
  flip,
  hide,
  offset,
  shift,
  size,
  type Middleware,
  type Placement,
} from '@floating-ui/react-dom';

/**
 * Inset kept between a panel and the viewport edge. A JS-side geometry
 * constant (it feeds Floating UI's `padding`, not a CSS declaration), matching
 * the `--bds-gap-md` step in default spacing mode.
 */
const VIEWPORT_PADDING = 8;

/** The rows a panel is never squeezed below, header and search field included. */
const FLOOR_ROWS = 3;

const ROW_SELECTOR = '[role="menuitem"], [role="option"]';

/** Inline properties the hook writes. Their prior values come back on cleanup. */
const WRITTEN = [
  'position',
  'margin',
  'top',
  'left',
  'right',
  'bottom',
  'width',
  'maxHeight',
  'visibility',
] as const;

type Side = 'top' | 'bottom';
type Align = 'start' | 'end' | 'stretch';

/** What the consumer's CSS asked for, read off the panel's CSS-laid-out first frame. */
interface Intent {
  side: Side;
  align: Align;
  /** Main-axis distance between panel and anchor (a margin, or `calc(100% + gap)`). */
  gap: number;
  /** The panel's own max-height as a border-box height, or null when uncapped. */
  cap: number | null;
}

interface BoxExtras {
  /** Vertical padding + border, added when `box-sizing` is content-box. */
  y: number;
  /** Horizontal padding + border, added when `box-sizing` is content-box. */
  x: number;
}

function boxExtras(panel: HTMLElement): BoxExtras {
  const style = getComputedStyle(panel);
  if (style.boxSizing === 'border-box') return { x: 0, y: 0 };
  const px = (value: string) => parseFloat(value) || 0;
  return {
    y: px(style.paddingTop) + px(style.paddingBottom) + px(style.borderTopWidth) + px(style.borderBottomWidth),
    x: px(style.paddingLeft) + px(style.paddingRight) + px(style.borderLeftWidth) + px(style.borderRightWidth),
  };
}

/**
 * Read the consumer's intent from layout, not from props, so every existing
 * override keeps working: an inline `left: auto; right: 0`, a `bottom: 100%`
 * client switcher, a `margin-top`, a custom `max-height`.
 *
 * Uses `offset*` rather than `getBoundingClientRect`: Menu's entrance
 * animation scales the panel, which would skew a rect but not layout.
 */
function inferIntent(panel: HTMLElement, reference: HTMLElement, extras: BoxExtras): Intent {
  // offsetTop/offsetLeft are measured from the offsetParent's padding edge.
  const top = panel.offsetTop + reference.clientTop;
  const left = panel.offsetLeft + reference.clientLeft;
  const { offsetWidth: width, offsetHeight: height } = panel;
  const { offsetWidth: refWidth, offsetHeight: refHeight } = reference;

  const side: Side = top + height / 2 < refHeight / 2 ? 'top' : 'bottom';
  const gap = side === 'top' ? -(top + height) : top - refHeight;

  const startFlush = Math.abs(left) <= 1;
  const endFlush = Math.abs(left + width - refWidth) <= 1;
  const align: Align = startFlush && endFlush ? 'stretch' : endFlush ? 'end' : 'start';

  const maxHeight = getComputedStyle(panel).maxHeight;
  const cap = maxHeight.endsWith('px') ? parseFloat(maxHeight) + extras.y : null;

  return { side, align, gap, cap };
}

/**
 * Border-box height that shows `FLOOR_ROWS` rows (or all of them, if fewer).
 * Measured from the rendered panel, so a header, a search field and the active
 * spacing mode are all included without a constant.
 */
function measureFloor(panel: HTMLElement): number {
  const rows = panel.querySelectorAll<HTMLElement>(ROW_SELECTOR);
  if (rows.length === 0) return 0;
  const row = rows[Math.min(FLOOR_ROWS, rows.length) - 1];
  const style = getComputedStyle(panel);
  const rect = panel.getBoundingClientRect();
  // The entrance animation scales the panel; undo it so the floor is layout px.
  const scale = panel.offsetHeight > 0 ? rect.height / panel.offsetHeight : 1;
  return (
    (row.getBoundingClientRect().bottom - rect.top) / scale +
    panel.scrollTop +
    (parseFloat(style.paddingBottom) || 0) +
    (parseFloat(style.borderBottomWidth) || 0)
  );
}

/**
 * Keeps the panel in the viewport on the vertical axis. `shift({ crossAxis })`
 * would do this, but core's `size` then reads `middlewareData.shift.enabled.y`
 * and reports the whole viewport as the available height. This clamp is what
 * lets a panel sitting at its floor overlap its trigger instead of leaving.
 */
const clampY: Middleware = {
  name: 'bdsClampY',
  async fn(state) {
    const overflow = await detectOverflow(state, { padding: VIEWPORT_PADDING });
    let dy = 0;
    if (overflow.top > 0) dy = overflow.top;
    else if (overflow.bottom > 0) dy = -Math.min(overflow.bottom, Math.max(0, -overflow.top));
    return dy === 0 ? {} : { y: state.y + dy };
  },
};

/**
 * Collision-aware positioning for a dropdown panel that CSS lays out
 * `position: absolute` inside its trigger's positioned wrapper (Menu,
 * FilterButton, the CommentComposer mention list).
 *
 * Absolute panels are clipped by a scroll or `overflow: hidden` ancestor (a
 * Sheet body) and never flip. On open this hook reads what the consumer's CSS
 * asked for (side, alignment, gap, cap), then moves the panel to
 * `position: fixed` and lets Floating UI place it against the same wrapper:
 * flip when the preferred side has no room, shift horizontally, cap the height
 * to the room left (never below three rows), and hide while the trigger is
 * scrolled out of view. The panel stays where it is in the DOM, so outside
 * click `contains` checks and a Sheet's focus trap are untouched.
 *
 * The anchor is `panel.offsetParent`: the positioned wrapper the CSS already
 * anchors to. Styles are written straight to `element.style` (not React state)
 * so they win over a consumer `style` prop and land in the same layout effect
 * as the commit, before a passive effect can `focus()` the panel.
 *
 * @param panelRef - Ref of the panel element. It must be mounted when `open` is true.
 * @param open - Whether the panel is shown.
 */
export function useFloatingPanel(panelRef: RefObject<HTMLElement | null>, open: boolean): void {
  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const reference = panel?.offsetParent;
    if (
      !panel ||
      !(reference instanceof HTMLElement) ||
      reference === document.body ||
      reference === document.documentElement
    ) {
      return;
    }

    // 1. Infer from the CSS-laid-out first frame, before touching anything.
    const extras = boxExtras(panel);
    const { side, align, gap, cap } = inferIntent(panel, reference, extras);

    const saved = WRITTEN.map((prop) => [prop, panel.style[prop]] as const);
    const { visibility, maxHeight } = panel.style;

    // 2. Leave the scroll container's flow in this same frame, at the spot CSS
    // had put the panel, so a following focus() cannot scroll the Sheet body.
    const refRect = reference.getBoundingClientRect();
    const { style } = panel;
    style.position = 'fixed';
    style.margin = '0';
    style.right = 'auto';
    style.bottom = 'auto';
    style.left = `${align === 'end' ? refRect.right - panel.offsetWidth : refRect.left}px`;
    style.top = `${side === 'bottom' ? refRect.bottom + gap : refRect.top - gap - panel.offsetHeight}px`;
    if (align === 'stretch') style.width = `${refRect.width - extras.x}px`;

    // 3. Refine with Floating UI.
    const placement: Placement = `${side}-${align === 'end' ? 'end' : 'start'}`;
    let run = 0;
    const update = async () => {
      const current = ++run;
      // Measure from the same starting height every time. `flip` and `size`
      // read the panel's current size, so starting from the height the last run
      // left behind lets a tight panel flip back and forth, resizing on every
      // pass. The scroll offset is clamped while the cap is lifted: put it back.
      const { scrollTop } = panel;
      panel.style.maxHeight = maxHeight;
      const { x, y, middlewareData } = await computePosition(reference, panel, {
        strategy: 'fixed',
        placement,
        middleware: [
          offset(gap),
          flip(),
          size({
            padding: VIEWPORT_PADDING,
            apply({ availableHeight, rects }) {
              const room = Math.max(measureFloor(panel), availableHeight);
              const height = cap === null ? room : Math.min(cap, room);
              panel.style.maxHeight = `${Math.max(0, height - extras.y)}px`;
              if (align === 'stretch') panel.style.width = `${rects.reference.width - extras.x}px`;
            },
          }),
          shift({ padding: VIEWPORT_PADDING }),
          clampY,
          hide(),
        ],
      });
      if (current !== run) return;
      panel.scrollTop = scrollTop;
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      panel.style.visibility = middlewareData.hide?.referenceHidden ? 'hidden' : visibility;
    };

    // Size changes are watched here, not by autoUpdate: its observer calls
    // `update` inside the ResizeObserver callback, and `size` resizing the very
    // element being observed there is what the browser reports as "ResizeObserver
    // loop completed with undelivered notifications". A frame's delay moves the
    // write out of the delivery.
    let frameId = 0;
    const resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          cancelAnimationFrame(frameId);
          frameId = requestAnimationFrame(() => void update());
        })
      : null;
    resizeObserver?.observe(reference);
    resizeObserver?.observe(panel);
    const stop = autoUpdate(reference, panel, () => void update(), { elementResize: false });

    return () => {
      stop();
      resizeObserver?.disconnect();
      cancelAnimationFrame(frameId);
      run++;
      for (const [prop, value] of saved) style[prop] = value;
    };
  }, [open, panelRef]);
}
