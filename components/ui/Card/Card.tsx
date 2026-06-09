import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Card.css';

export type CardVariant = 'outlined' | 'brand' | 'elevated' | 'borderless';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardPreset = 'control' | 'summary' | 'display' | 'display-row';
export type CardControlActionAlign = 'center' | 'top';
export type CardSummaryType = 'numeric' | 'price';
/**
 * Image-column width for `preset="display-row"`. Named values resolve to
 * fixed percentages (`narrow` 25%, `standard` 35%, `wide` 50%); pass a CSS
 * length / percentage string to override (e.g. `"40%"`, `"320px"`).
 */
export type CardDisplayRowImageWidth = 'narrow' | 'standard' | 'wide' | (string & {});

export interface CardSummaryTextLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface CardBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Optional class name applied to the root element.
   */
  className?: string;
}

interface CardDefaultProps extends CardBaseProps {
  /** No preset — default flexible Card with `children` content slot. */
  preset?: undefined;
  /** Visual variant — outlined / brand / elevated / borderless (default `outlined`). Use `borderless` for cards sitting on a colored surface, where the border ring reads as visual noise. */
  variant?: CardVariant;
  /** Padding scale (default `md`). */
  padding?: CardPadding;
  /** Render with hover affordance — adds cursor + interaction styles. */
  interactive?: boolean;
  /** Render as `<a>` instead of `<div>`. */
  href?: string;
  /** Card content — composes `<CardTitle>`, `<CardDescription>`, `<CardFooter>`, etc. */
  children: ReactNode;
}

interface CardControlPresetProps extends CardBaseProps {
  /**
   * Control preset — locked-down settings/control card layout. Replaces the
   * legacy `CardControl` component (per ADR-004 §"Resolve the existing
   * instances"). Renders: badge + (title + description) on the left,
   * action on the right.
   */
  preset: 'control';
  /** Bold control label */
  title: string;
  /** Helper text under the title */
  description?: string;
  /** Optional leading badge (e.g. status icon, ServiceTag) */
  badge?: ReactNode;
  /** Optional trailing action element (Button, Switch, Link) */
  action?: ReactNode;
  /**
   * Vertical alignment of the action slot. `top` anchors the action to the
   * upper-right corner; `center` (default) aligns to the vertical midline.
   */
  actionAlign?: CardControlActionAlign;
}

interface CardSummaryPresetProps extends CardBaseProps {
  /**
   * Summary preset — compact metric/stat card with label, large value, and
   * optional text link. Replaces the legacy `CardSummary` component (per
   * ADR-004 §"Resolve the existing instances").
   */
  preset: 'summary';
  /** Stat label rendered above the value */
  label: string;
  /**
   * Stat value. Numbers are formatted via `Intl.NumberFormat` based on
   * `type`; strings render verbatim.
   */
  value: string | number;
  /**
   * Number formatting:
   * - `numeric` (default): locale-formatted integer (e.g. 1,234)
   * - `price`: USD currency (e.g. $1,234.50)
   * Ignored when `value` is a string.
   */
  type?: CardSummaryType;
  /** Optional secondary action rendered to the right of the value */
  textLink?: CardSummaryTextLink;
}

interface CardDisplayPresetProps extends CardBaseProps {
  /**
   * Display preset — generic content card for any item rendered in a
   * card grid (service, blog post, customer story, property listing,
   * team bio, support plan). All affordances are optional + prop-toggled
   * so a single primitive serves every content type. Used by the
   * `bds-card-grid` blueprint.
   */
  preset: 'display';
  /**
   * `borderless` — transparent fill, no border, no shadow. Use when the
   * card grid sits on a colored surface (service-tier tint) where the
   * default white fill + border ring reads as visual noise.
   */
  variant?: 'borderless';
  /** Card heading. Renders as `<h3>` with `--font-family-heading` + `--heading-md`. */
  title: string;
  /**
   * Body copy under the title. Renders as `<p>` with `--font-family-body` +
   * `--body-md` (matched pair — never reach across families for size).
   */
  description?: string;
  /**
   * Top media slot. Pass a `<Frame>`-wrapped image (or any ReactNode) for
   * the aspect-ratio-controlled top region. When omitted, the card
   * renders without media.
   */
  image?: ReactNode;
  /**
   * Inline category indicator rendered above the title. Pass a
   * `<ServiceTag>` for services, a `<Tag>` for blog categories, a date
   * pill for stories, etc. Justified `flex-start` (does not stretch).
   */
  tag?: ReactNode;
  /**
   * Overlay badge anchored top-right of the image. Pass a `<Badge>` for
   * status-style indicators ("Has Options", "Featured", "Sold").
   * Renders only when `image` is also provided.
   */
  badge?: ReactNode;
  /**
   * Trailing action — typically a `<LinkButton>` or `<Button>`. Anchored
   * to the bottom of the card body via `margin-top: auto` so multiple
   * cards in a grid align their actions regardless of description length.
   */
  action?: ReactNode;
  /**
   * Render the card itself as an `<a>` when set — turns the whole card
   * into a single clickable target. Use when `action` is not set and the
   * card itself is the navigation affordance.
   */
  href?: string;
}

interface CardDisplayRowPresetProps extends CardBaseProps {
  /**
   * Display-row preset — horizontal sibling of `preset="display"`. Image on
   * the left, content (tag, title, description, action) on the right. Use
   * for single-card sections where vertical layout wastes horizontal space:
   * Related Customer Story, Recommended Add-On, featured plan. Collapses
   * to a vertical stack at ≤ 640px.
   */
  preset: 'display-row';
  /** Card heading. Renders as `<h3>` with `--font-family-heading` + `--heading-md`. */
  title: string;
  /** Body copy under the title. Renders as `<p>` with `--font-family-body` + `--body-md`. */
  description?: string;
  /**
   * Left media slot. Pass a `<Frame>`-wrapped image (or any ReactNode). The
   * media column owns its own aspect ratio via `<Frame>`; the column width
   * is controlled by `imageWidth`.
   */
  image?: ReactNode;
  /**
   * Inline category indicator rendered above the title. Pass a
   * `<ServiceTag>` for services, a `<Tag>` for blog categories, a date
   * pill for stories, etc. Justified `flex-start` (does not stretch).
   */
  tag?: ReactNode;
  /**
   * Optional content block rendered between `description` and `action`.
   * Use for structured supporting content that doesn't fit the single-
   * paragraph `description` slot — bullet lists ("Great fit for: …"),
   * feature pills, supporting meta, or a small inline gallery. Receives
   * no internal styling beyond a flex-column wrapper; the consumer owns
   * the rendered markup.
   */
  extras?: ReactNode;
  /**
   * Trailing action — typically a `<LinkButton>` or `<Button>`. Anchored
   * to the bottom of the body column via `margin-top: auto` so the title
   * + description stay top-aligned while the action sits at the card
   * footer.
   */
  action?: ReactNode;
  /**
   * Image column width. Named values: `narrow` (25%), `standard` (35%,
   * default), `wide` (50%). Any other string passes through as the CSS
   * column-width value (e.g. `"40%"`, `"320px"`).
   */
  imageWidth?: CardDisplayRowImageWidth;
  /**
   * Render the card itself as an `<a>` when set — turns the whole card
   * into a single clickable target. Use when `action` is not set and the
   * card itself is the navigation affordance.
   */
  href?: string;
}

export type CardProps =
  | CardDefaultProps
  | CardControlPresetProps
  | CardSummaryPresetProps
  | CardDisplayPresetProps
  | CardDisplayRowPresetProps;

function formatSummaryValue(value: string | number, type: CardSummaryType): string {
  if (typeof value === 'string') return value;
  if (type === 'price') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  return value.toLocaleString();
}

/**
 * Card — flexible content container.
 *
 * Two shapes share the same primitive:
 *
 * - **Default** (no `preset`) — flexible content slot. Compose with
 *   `<CardTitle>`, `<CardDescription>`, `<CardFooter>` subcomponents.
 *   Visual variants: `outlined` (default) / `brand` / `elevated` / `borderless`.
 *   Use `borderless` (transparent, no border, no shadow) for cards placed on
 *   a colored surface where the border ring would read as visual noise.
 * - **`preset="control"`** — settings/control card with locked-down
 *   badge + title + description + action layout. Replaces the legacy
 *   `CardControl` component.
 * - **`preset="summary"`** — compact metric/stat card with label,
 *   large value, and optional text link. Replaces the legacy
 *   `CardSummary` component.
 *
 * @example Default
 * ```tsx
 * <Card variant="elevated" padding="lg">
 *   <CardTitle>Quarterly report</CardTitle>
 *   <CardDescription>Summary of Q1 performance.</CardDescription>
 *   <CardFooter><Button>View</Button></CardFooter>
 * </Card>
 * ```
 *
 * @example Control preset
 * ```tsx
 * <Card
 *   preset="control"
 *   title="Email notifications"
 *   description="Send weekly digest to your inbox."
 *   action={<Switch checked={enabled} onChange={setEnabled} />}
 * />
 * ```
 *
 * @example Summary preset
 * ```tsx
 * <Card
 *   preset="summary"
 *   label="Total revenue"
 *   value={48250.75}
 *   type="price"
 *   textLink={{ label: 'Details', href: '/revenue' }}
 * />
 * ```
 *
 * @summary Flexible content container with presets
 */
export function Card(props: CardProps) {
  if (props.preset === 'control') {
    return renderControlPreset(props);
  }
  if (props.preset === 'summary') {
    return renderSummaryPreset(props);
  }
  if (props.preset === 'display') {
    return renderDisplayPreset(props);
  }
  if (props.preset === 'display-row') {
    return renderDisplayRowPreset(props);
  }
  return renderDefault(props);
}

const NAMED_IMAGE_WIDTHS: ReadonlySet<string> = new Set(['narrow', 'standard', 'wide']);

function renderDefault({
  variant = 'outlined',
  children,
  interactive = false,
  href,
  padding = 'md',
  className,
  style,
  preset: _preset,
  ...rest
}: CardDefaultProps) {
  const classes = bdsClass(
    'bds-card',
    `bds-card--${variant}`,
    `bds-card--padding-${padding}`,
    interactive && 'bds-card--interactive',
    href && 'bds-card--link',
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes} style={style} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <div className={classes} style={style} {...rest}>
      {children}
    </div>
  );
}

function renderControlPreset({
  title,
  description,
  badge,
  action,
  actionAlign = 'center',
  className,
  style,
  preset: _preset,
  ...rest
}: CardControlPresetProps) {
  return (
    <div
      className={bdsClass(
        'bds-card',
        'bds-card--preset-control',
        `bds-card--preset-control-action-${actionAlign}`,
        className,
      )}
      style={style}
      {...rest}
    >
      <div className="bds-card__preset-control-content">
        {badge}
        <div className="bds-card__preset-control-text">
          <p className="bds-card__preset-control-title">{title}</p>
          {description && <p className="bds-card__preset-control-description">{description}</p>}
        </div>
      </div>
      {action && <div className="bds-card__preset-control-action">{action}</div>}
    </div>
  );
}

function renderSummaryPreset({
  label,
  value,
  type = 'numeric',
  textLink,
  className,
  style,
  preset: _preset,
  ...rest
}: CardSummaryPresetProps) {
  const formatted = formatSummaryValue(value, type);

  return (
    <div
      className={bdsClass('bds-card', 'bds-card--preset-summary', className)}
      style={style}
      {...rest}
    >
      <div className="bds-card__preset-summary-inner">
        <div className="bds-card__preset-summary-content">
          <p className="bds-card__preset-summary-label">{label}</p>
          <p className="bds-card__preset-summary-value">{formatted}</p>
        </div>
        {textLink && (
          <div className="bds-card__preset-summary-link-area">
            {textLink.href ? (
              <a
                href={textLink.href}
                className="bds-card__preset-summary-link"
                onClick={textLink.onClick}
              >
                {textLink.label}
              </a>
            ) : (
              <button
                type="button"
                className="bds-card__preset-summary-link"
                onClick={textLink.onClick}
              >
                {textLink.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderDisplayPreset({
  title,
  description,
  image,
  tag,
  badge,
  action,
  href,
  variant,
  className,
  style,
  preset: _preset,
  ...rest
}: CardDisplayPresetProps) {
  const classes = bdsClass(
    'bds-card',
    'bds-card--preset-display',
    variant && `bds-card--${variant}`,
    href && 'bds-card--link',
    className,
  );

  const body = (
    <>
      {image && (
        <div className="bds-card__preset-display-media">
          {image}
          {badge && (
            <span className="bds-card__preset-display-badge">{badge}</span>
          )}
        </div>
      )}
      <div className="bds-card__preset-display-body">
        {tag && (
          <span className="bds-card__preset-display-tag">{tag}</span>
        )}
        <h3 className="bds-card__preset-display-title">{title}</h3>
        {description && (
          <p className="bds-card__preset-display-description">{description}</p>
        )}
        {action && (
          <div className="bds-card__preset-display-action">{action}</div>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        style={style}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {body}
      </a>
    );
  }

  return (
    <div className={classes} style={style} {...rest}>
      {body}
    </div>
  );
}

function renderDisplayRowPreset({
  title,
  description,
  image,
  tag,
  extras,
  action,
  imageWidth = 'standard',
  href,
  className,
  style,
  preset: _preset,
  ...rest
}: CardDisplayRowPresetProps) {
  const isNamed = NAMED_IMAGE_WIDTHS.has(imageWidth);
  const classes = bdsClass(
    'bds-card',
    'bds-card--preset-display-row',
    isNamed && `bds-card--preset-display-row-${imageWidth}`,
    href && 'bds-card--link',
    className,
  );

  // Custom (non-named) imageWidth string drives the CSS variable directly;
  // named widths are class-based so they compose cleanly with theming. The
  // `as React.CSSProperties` cast accommodates the CSS-variable property
  // name (TS doesn't model arbitrary `--*` keys on CSSProperties).
  const inlineStyle = isNamed
    ? style
    : { ...(style ?? {}), ['--bds-card-image-width' as string]: imageWidth };

  const body = (
    <>
      {image && (
        <div className="bds-card__preset-display-row-media">{image}</div>
      )}
      <div className="bds-card__preset-display-row-body">
        {tag && (
          <span className="bds-card__preset-display-row-tag">{tag}</span>
        )}
        <h3 className="bds-card__preset-display-row-title">{title}</h3>
        {description && (
          <p className="bds-card__preset-display-row-description">{description}</p>
        )}
        {extras && (
          <div className="bds-card__preset-display-row-extras">{extras}</div>
        )}
        {action && (
          <div className="bds-card__preset-display-row-action">{action}</div>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        style={inlineStyle as React.CSSProperties}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {body}
      </a>
    );
  }

  return (
    <div className={classes} style={inlineStyle as React.CSSProperties} {...rest}>
      {body}
    </div>
  );
}

/* ─── Subcomponents (default Card composition) ────────────────── */

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, as: Tag = 'h3', className, style, ...props }: CardTitleProps) {
  return (
    <Tag className={bdsClass('bds-card-title', className)} style={style} {...props}>
      {children}
    </Tag>
  );
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({ children, className, style, ...props }: CardDescriptionProps) {
  return (
    <p className={bdsClass('bds-card-description', className)} style={style} {...props}>
      {children}
    </p>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className, style, ...props }: CardFooterProps) {
  return (
    <div className={bdsClass('bds-card-footer', className)} style={style} {...props}>
      {children}
    </div>
  );
}

export default Card;
