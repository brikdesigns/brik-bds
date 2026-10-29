import { type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { Pen } from '../../icons';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';
import { bdsClass } from '../../utils';
import { observeCondense } from './condenseOnScroll';
import './PageHeader.css';

export interface MetadataItem {
  label: string;
  value: ReactNode;
}

/**
 * Bimodal page state, symmetric with {@link import('../Sheet').SheetMode `SheetMode`}.
 *
 * - `read` — the page renders read-only content; auto-renders `[Edit]`
 *   in `actions` when `editHref` or `onEdit` is provided.
 * - `edit` — the page renders a form; auto-renders `[Cancel] [Save]`
 *   ButtonGroup in `actions` when `onSave` is provided.
 *
 * An explicit `actions` prop always wins over mode-driven actions
 * (mirrors `Sheet`'s `footer` override).
 *
 * When `mode` is unset, `PageHeader` behaves as before — no breaking change.
 */
export type PageHeaderMode = 'read' | 'edit';

/**
 * Header shape, fixed per page — no variant collapses or expands on scroll.
 * (The opt-in `condenseOnScroll` prop is the one exception, and it is a prop,
 * not a variant: it applies to any variant.)
 *
 * - `full` — every slot renders (breadcrumbs, media, title, subtitle, actions,
 *   metadata, tabs).
 * - `compact` — media, the title (`--bds-heading-xl`, same as `full`), actions and tabs.
 *   Breadcrumbs, subtitle and metadata are not rendered; `size` is ignored.
 * - `tabs-only` — only the `tabs` slot is visible. The title still renders as a
 *   visually hidden `<h1>`, so the page keeps its heading.
 */
export type PageHeaderVariant = 'full' | 'compact' | 'tabs-only';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Page title — rendered as the H1. */
  title: string;
  /** Optional subtitle paragraph rendered under the title. */
  subtitle?: string;
  /**
   * Leading identity mark rendered to the left of the title — an `Avatar` for a
   * company or software entity, a `ServiceTag variant="icon"` for a service.
   */
  media?: ReactNode;
  /**
   * @deprecated Renamed to {@link PageHeaderProps.media}. `Badge` is the status
   * component; this slot has only ever held an identity mark, and the mismatch
   * got a correctly-rendered company avatar reported as a defect (#1705). Kept
   * as a non-breaking alias for one release — pass `media` in new code.
   */
  badge?: ReactNode;
  /** Breadcrumb element (typically a `Breadcrumb` component) rendered above the title row. */
  breadcrumbs?: ReactNode;
  /**
   * Right-aligned action element(s) (primary `Button`, dropdown menu, etc.).
   * When set, overrides any mode-driven auto-actions.
   */
  actions?: ReactNode;
  /** Optional `TabBar` (or equivalent) rendered at the bottom of the header — page-level navigation. */
  tabs?: ReactNode;
  /** Key/value pairs rendered below the title row (e.g. Owner, Status, Updated). */
  metadata?: MetadataItem[];
  /**
   * Title scale. Default: 'lg'.
   *
   * The step names are offset from the tokens they render — `lg` is the
   * page-title default and renders `--bds-heading-xl`, the Section-headline step
   * the build standards assign a page's `<h1>`. Only `md` and `sm` name-match
   * their token. `lg` is not `--bds-heading-lg`. See brik-bds#1997.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Header shape, fixed per page. Default `'full'`. See {@link PageHeaderVariant}.
   */
  variant?: PageHeaderVariant;
  /**
   * Pin the header to the top of its scroll container on scroll
   * (`position: sticky`). Renders an opaque `--bds-surface-primary` background so
   * body content scrolls cleanly beneath it. Default `false` — non-sticky
   * consumers are unaffected. The header sticks within the nearest scrolling
   * ancestor; ensure that container, not the window, owns the scroll.
   *
   * The offset is `--bds-pageheader-top` (default `0px`). A shell with a top
   * bar sets it to the `--bds-shell-top-bar-height` token on an ancestor, so the
   * header pins below the bar instead of under it.
   */
  sticky?: boolean;
  /**
   * Condense the header once it has pinned. Default `false` — existing consumers
   * see no change. Only meaningful with `sticky`: a header that scrolls away has
   * nothing to condense, so without `sticky` this does nothing.
   *
   * When the pinned header has scrolled past its natural position it hides the
   * breadcrumbs, subtitle and metadata, tightens its section gaps, and steps the
   * title down two steps on the heading scale (`lg` → `--bds-heading-md`;
   * `md` / `sm` → `--bds-heading-tiny`, the bottom of the scale). Media, title,
   * actions and tabs stay. It returns to full size when scrolled back up.
   *
   * The state is exposed as `data-condensed="true" | "false"` (absent when the
   * prop is off). Under `prefers-reduced-motion: reduce` the title snaps instead
   * of animating.
   *
   * Boolean, so it crosses the RSC boundary. The scroll logic is an
   * `IntersectionObserver` on a zero-height sentinel the header renders just
   * before itself — see `condenseOnScroll.ts` for why it cannot oscillate.
   * In a flex or grid parent that sets `gap`, the sentinel is one more item.
   */
  condenseOnScroll?: boolean;
  /**
   * Bimodal page state. Drives auto-rendered `actions` when no explicit
   * `actions` slot is provided. See {@link PageHeaderMode}.
   */
  mode?: PageHeaderMode;
  /**
   * Navigation handler in read mode. Wires the auto-rendered `[Edit]` button.
   *
   * A function prop, so it cannot cross the RSC boundary — a React Server
   * Component cannot pass this to `PageHeader` without becoming a client
   * component. Server pages use {@link PageHeaderProps.editHref} instead.
   */
  onEdit?: () => void;
  /**
   * Serializable equivalent of `onEdit` for **server** pages. Renders the same
   * auto-rendered `[Edit]` button in read mode, as a navigating `<a>` pointing
   * at this href, so a React Server Component gets the standardized read
   * affordance without `'use client'` and without a function prop (#2026).
   *
   * Use `editHref` on server pages and `onEdit` on client pages. If both are
   * passed, `editHref` wins — the navigation is the more specific intent, and a
   * real `<a>` stays middle-clickable and keyboard-navigable.
   */
  editHref?: string;
  /** Submit handler in edit mode. Wires the auto-rendered `[Save]` button. */
  onSave?: () => void;
  /** Discard handler in edit mode. Wires the auto-rendered `[Cancel]` button. */
  onCancel?: () => void;
  /** Show loading state on the auto-rendered `[Save]` button. */
  saveLoading?: boolean;
  /** Disable the auto-rendered `[Save]` button (e.g. while form is invalid). */
  saveDisabled?: boolean;
  /** Label for the auto-rendered `[Edit]` button. Default `"Edit"`. */
  editLabel?: string;
  /** Label for the auto-rendered `[Save]` button. Default `"Save"`. */
  saveLabel?: string;
  /** Label for the auto-rendered `[Cancel]` button. Default `"Cancel"`. */
  cancelLabel?: string;
}

/**
 * PageHeader — composable page-level header with breadcrumbs, media, actions, metadata, and tabs.
 *
 * ## Tunable spacing
 *
 * Four component-scoped CSS variables on `.bds-page-header` let consumers
 * adjust the internal rhythm without forking the component. Override at any
 * cascade level (theme file, `globals.css`, `style` prop). Defaults preserve
 * the lean 0.57.0 shape:
 *
 * - `--page-header-section-gap` (default `--bds-gap-xl`, 24px) — between
 *   root sections (inner / metadata / tabs).
 * - `--page-header-content-gap` (default `--bds-gap-lg`, 16px) — between
 *   the title-row and the subtitle.
 * - `--page-header-actions-gap` (default `--bds-gap-sm`, 6px) — between
 *   the content column (title + subtitle) and the actions column.
 * - `--page-header-padding-bottom` (default `0`) — bottom padding below the
 *   header. The header draws no default divider (a header with no `tabs` ends
 *   flush against the body; a `tabs` slot renders TabBar's own 2px baseline),
 *   so this is `0` unless a consumer restores a manual divider and wants
 *   breathing room above it.
 *
 * @summary Page-level header — title, breadcrumbs, actions, tabs
 */
export function PageHeader({
  title,
  subtitle,
  media,
  badge,
  breadcrumbs,
  actions,
  tabs,
  metadata,
  size = 'lg',
  variant = 'full',
  sticky = false,
  condenseOnScroll = false,
  mode,
  onEdit,
  editHref,
  onSave,
  onCancel,
  saveLoading,
  saveDisabled,
  editLabel = 'Edit',
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  className,
  style,
  ...props
}: PageHeaderProps) {
  // Condensing is a property of a *pinned* header; without `sticky` it is inert.
  const condensable = condenseOnScroll && sticky;
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    if (!condensable || !headerRef.current || !sentinelRef.current) return;
    return observeCondense(sentinelRef.current, headerRef.current, setCondensed);
  }, [condensable]);

  // `media` is the canonical slot; `badge` is the deprecated alias (#1705).
  const resolvedMedia: ReactNode = media ?? badge;

  // Explicit `actions` wins; otherwise compose mode-driven actions.
  // `mode='read'` + (editHref || onEdit) → `[Edit]` (primary, pen icon).
  // `mode='edit'` + (onSave || onCancel) → `[Cancel] [Save]` ButtonGroup.
  const resolvedActions: ReactNode = (() => {
    if (actions !== undefined) return actions;
    if (mode === 'read' && (editHref || onEdit)) {
      // Two `Button` calls rather than a spread: `href` discriminates Button's
      // anchor/button prop union, so the element choice has to be static.
      // `editHref` wins when both are passed — see the `editHref` JSDoc.
      return editHref ? (
        <Button variant="primary" href={editHref} iconBefore={<Icon icon={Pen} />}>
          {editLabel}
        </Button>
      ) : (
        <Button variant="primary" onClick={onEdit} iconBefore={<Icon icon={Pen} />}>
          {editLabel}
        </Button>
      );
    }
    if (mode === 'edit' && (onSave || onCancel)) {
      return (
        <ButtonGroup align="end">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          {onSave && (
            <Button
              variant="primary"
              onClick={onSave}
              disabled={saveDisabled}
              loading={saveLoading}
            >
              {saveLabel}
            </Button>
          )}
        </ButtonGroup>
      );
    }
    return null;
  })();

  const isFull = variant === 'full';

  if (variant === 'tabs-only') {
    return (
      <div
        className={bdsClass('bds-page-header', 'bds-page-header--tabs-only', sticky && 'bds-page-header--sticky', className)}
        style={style}
        data-mode={mode}
        data-variant={variant}
        {...props}
      >
        <h1 className="bds-page-header__title bds-page-header__title--hidden">{title}</h1>
        {tabs && <div className="bds-page-header__tabs">{tabs}</div>}
      </div>
    );
  }

  const header = (
    <div
      ref={headerRef}
      className={bdsClass(
        'bds-page-header',
        isFull && size !== 'lg' && `bds-page-header--${size}`,
        !isFull && `bds-page-header--${variant}`,
        sticky && 'bds-page-header--sticky',
        className,
      )}
      style={style}
      data-mode={mode}
      data-variant={variant}
      data-condensed={condensable ? String(condensed) : undefined}
      {...props}
    >
      {/* The wrapper exists only when condensing, so the DOM a non-opted-in
          consumer renders is unchanged — the slot is a bare ReactNode and CSS
          has nothing else to hide it by. */}
      {isFull && breadcrumbs && (condensable ? <div className="bds-page-header__breadcrumbs">{breadcrumbs}</div> : breadcrumbs)}

      <div className="bds-page-header__inner">
        <div className="bds-page-header__content">
          <div className="bds-page-header__title-row">
            {/* `media` wins over the deprecated `badge` alias, so a consumer
                mid-migration that passes both renders one mark, not two. */}
            {resolvedMedia && <div className="bds-page-header__media">{resolvedMedia}</div>}
            <h1 className="bds-page-header__title">{title}</h1>
          </div>
          {isFull && subtitle && <p className="bds-page-header__subtitle">{subtitle}</p>}
        </div>
        {resolvedActions && <div className="bds-page-header__actions">{resolvedActions}</div>}
      </div>

      {isFull && metadata && metadata.length > 0 && (
        <div className="bds-page-header__metadata">
          <div className="bds-page-header__metadata-inner">
            {metadata.map((item) => (
              <div key={item.label} className="bds-page-header__metadata-item">
                <span className="bds-page-header__metadata-label">{item.label}</span>
                <span className="bds-page-header__metadata-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tabs && <div className="bds-page-header__tabs">{tabs}</div>}
    </div>
  );

  if (!condensable) return header;

  // The sentinel sits where the header's natural top is and moves only with the
  // scroll offset, so shrinking the header cannot move it. See condenseOnScroll.ts.
  return (
    <>
      <span ref={sentinelRef} className="bds-page-header__condense-sentinel" aria-hidden="true" />
      {header}
    </>
  );
}

export default PageHeader;
