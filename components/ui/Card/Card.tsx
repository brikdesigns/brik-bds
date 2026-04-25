import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Card.css';

export type CardVariant = 'outlined' | 'brand' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardPreset = 'control' | 'summary';
export type CardControlActionAlign = 'center' | 'top';
export type CardSummaryType = 'numeric' | 'price';

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
  /** Visual variant — outlined / brand / elevated (default `outlined`). */
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

export type CardProps = CardDefaultProps | CardControlPresetProps | CardSummaryPresetProps;

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
 *   Visual variants: `outlined` (default) / `brand` / `elevated`.
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
 */
export function Card(props: CardProps) {
  if (props.preset === 'control') {
    return renderControlPreset(props);
  }
  if (props.preset === 'summary') {
    return renderSummaryPreset(props);
  }
  return renderDefault(props);
}

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
