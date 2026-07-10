import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import { Avatar, type AvatarSize, type AvatarStatus } from '../Avatar';
import { Image } from '../Image';
import { Logo, type LogoProps } from '../Logo';
import { Dot, type DotStatus } from '../Dot';
import type { ServiceLine } from '../ServiceTag/service-config';
import './Card.css';

export type CardVariant = 'outlined' | 'brand' | 'elevated' | 'borderless';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardPreset = 'control' | 'summary' | 'display' | 'display-row';
/** Heading level for a card's title — decouples document outline from the token-driven visual size. */
export type CardHeadingLevel = 'h2' | 'h3' | 'h4';
/**
 * Service-line surface tint for the display presets. Maps to the canonical
 * `--surface-service-{line}-light` pastel surface token — never an invented
 * name. Excludes the deprecated `service` alias of `ServiceLine`; pass
 * `back-office`.
 */
export type CardTint = Exclude<ServiceLine, 'service'>;
export type CardControlActionAlign = 'center' | 'top';
export type CardSummaryType = 'numeric' | 'price';
/**
 * Connection-status state for the `preset="control"` integration card.
 * Maps to canonical semantic token pairs:
 * - `not-configured` → `--text-muted` / `--background-status-neutral` (neutral/unconfigured)
 * - `connected`      → `--text-positive` / `--background-positive`
 * - `syncing`        → `--text-status-info` / `--background-status-info` (blue/in-progress)
 * - `synced`         → `--text-positive` / `--background-positive`
 * - `error`          → `--text-negative` / `--background-negative`
 */
export type CardControlConnectionStatus =
  | 'not-configured'
  | 'connected'
  | 'syncing'
  | 'synced'
  | 'error';
/**
 * Image-column width for `preset="display-row"`. Named values resolve to
 * fixed percentages (`narrow` 25%, `standard` 35%, `wide` 50%); pass a CSS
 * length / percentage string to override (e.g. `"40%"`, `"320px"`).
 */
export type CardDisplayRowImageWidth = 'narrow' | 'standard' | 'wide' | (string & {});

/**
 * Size for the default Card's leading `media` slot — a square keyed to the
 * `Avatar` size scale (`sm` 32px, `md` 40px, `lg` 48px, `xl` 64px) so an
 * avatar and a 1:1 image read at the same footprint. Default `md`.
 */
export type CardMediaSize = AvatarSize;
export type CardMediaImageFit = 'contain' | 'cover';

/** Avatar shape for the default Card's leading `media` slot. Mirrors `Avatar`. */
export interface CardAvatarMedia {
  /** Avatar image URL. Falls back to initials from `name` when absent. */
  src?: string;
  /** Accessible alt text for the avatar image. */
  alt?: string;
  /** Name used for the initials fallback when no image loads. */
  name?: string;
  /** Square size on the `Avatar` scale (default `md`). */
  size?: CardMediaSize;
  /** Presence indicator on the avatar. */
  status?: AvatarStatus;
}

/** 1:1 image shape for the default Card's leading `media` slot. Mirrors `Image`. */
export interface CardImageMedia {
  /** Image URL. */
  src: string;
  /** Accessible alt text — required. */
  alt: string;
  /** Square size on the `Avatar` scale (default `md`). */
  size?: CardMediaSize;
  /** Fit inside the square — `contain` for logos (no crop), `cover` for photos. Default `contain`. */
  fit?: CardMediaImageFit;
}

/**
 * Bundled brand-logo shape for the default Card's leading `media` slot — a
 * `Logo` referenced by set + name (a credit-card / integration / client mark),
 * rendered full-color and contained in the square. Use for integration cards
 * and payment rows; for a per-tenant uploaded client logo, use `image` with a
 * `src` instead. `set` constrains the allowed `name`. Mirrors `Logo`.
 */
export type CardLogoMedia = Pick<LogoProps, 'set' | 'name'> & {
  /** Square size on the `Avatar` scale (default `md`). */
  size?: CardMediaSize;
  /** Accessible name override — defaults to the brand name. */
  label?: string;
  /** Render decoratively (`aria-hidden`) when adjacent text already names the brand. */
  decorative?: boolean;
};

/**
 * Leading media for the default Card — an `Avatar`, a square 1:1 `Image`, or a
 * bundled `Logo` on the left, with `children` stacked to the right. Provide
 * exactly one of `avatar` / `image` / `logo`.
 */
export type CardMedia =
  | { avatar: CardAvatarMedia; image?: never; logo?: never }
  | { image: CardImageMedia; avatar?: never; logo?: never }
  | { logo: CardLogoMedia; avatar?: never; image?: never };

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
  /**
   * Optional leading media — an `Avatar` or a square 1:1 `Image` on the left,
   * with `children` stacked to the right (the "media object" layout). Compose
   * `<CardTitle>` / `<CardDescription>` / `<CardFooter>` in `children` as
   * usual; they render in the content column. Omit for a plain vertical card.
   */
  media?: CardMedia;
  /** Card content — composes `<CardTitle>`, `<CardDescription>`, `<CardFooter>`, etc. */
  children: ReactNode;
}

interface CardControlPresetProps extends CardBaseProps {
  /**
   * Control preset — locked-down settings/control card layout. Replaces the
   * legacy `CardControl` component (per ADR-004 §"Resolve the existing
   * instances"). Renders: logo + badge + (title + description) on the left,
   * (connection-status + action) on the right.
   */
  preset: 'control';
  /** Bold control label */
  title: string;
  /** Helper text under the title */
  description?: string;
  /** Optional leading badge (e.g. status icon, ServiceTag) */
  badge?: ReactNode;
  /**
   * Optional leading logo / avatar slot — for integration logomarks or brand
   * icons. Renders before the `badge` in the content row. Pass any ReactNode
   * (e.g. `<Avatar>`, `<img>`, or an `<Icon>`). The slot does not apply its
   * own size; the consumer controls the image dimensions.
   */
  logo?: ReactNode;
  /** Optional trailing action element (Button, Switch, Link) */
  action?: ReactNode;
  /**
   * Vertical alignment of the action slot. `top` anchors the action to the
   * upper-right corner; `center` (default) aligns to the vertical midline.
   */
  actionAlign?: CardControlActionAlign;
  /**
   * Connection-status state for integration / third-party service cards.
   * Renders a labelled status indicator in the trailing block, coexisting
   * with the `action` slot.
   *
   * - `not-configured` — not yet set up (muted/gray)
   * - `connected`      — OAuth/API key accepted, not yet synced
   * - `syncing`        — sync in progress (blue/info)
   * - `synced`         — last sync completed successfully (green)
   * - `error`          — last sync failed (red)
   */
  connectionStatus?: CardControlConnectionStatus;
  /**
   * Human-readable "last synced" timestamp or label rendered below the
   * connection-status indicator. Only displayed when `connectionStatus` is
   * provided and has a value other than `not-configured`. Example:
   * `"Last synced 3 min ago"`.
   */
  lastSynced?: string;
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
   * Display preset — the **cell of a `CardGrid`**, not a standalone card. Per
   * [ADR-018](../../../docs/adrs/ADR-018-card-preset-boundary.md) a display card
   * only exists inside a `CardGrid` Section (which owns the columns); this
   * preset is the malleable, content-agnostic cell it repeats. All affordances
   * are optional + prop-toggled so one cell serves any content type — service,
   * blog post, customer story, property listing, team bio, support plan.
   * Compose `<CardGrid>` + `<Card preset="display">`.
   */
  preset: 'display';
  /**
   * `borderless` — transparent fill, no border, no shadow. Use when the
   * card grid sits on a colored surface (service-tier tint) where the
   * default white fill + border ring reads as visual noise.
   *
   * `elevated` — surface-primary fill, no border, no shadow. Use when
   * a card grid on a colored surface still needs a contained "card" read but
   * the border ring is unwanted (the restored-fill counterpart to
   * `borderless`).
   */
  variant?: 'borderless' | 'elevated';
  /**
   * Optional service-line surface tint — a pale wash keyed to a service line
   * (`--surface-service-{line}-light`). Use for a service-identified cell in a
   * `CardGrid`. The visual size / border are unchanged; this only sets the
   * surface. Orthogonal to `variant` (don't combine with `borderless`, which is
   * transparent by design).
   */
  tint?: CardTint;
  /** Card heading. Renders with `--font-family-heading` + `--heading-md`; the element is `titleAs` (default `h3`). */
  title: string;
  /**
   * Heading element for `title` — `h2` / `h3` / `h4`. Default `h3`. Set to keep
   * the document outline correct for the card's context (e.g. `h3` under an
   * `<h2>` grid-section heading). Visual size is token-driven and does not
   * change with the level.
   */
  titleAs?: CardHeadingLevel;
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
   * Display-row preset — the horizontal `CardGrid` cell / section row (per
   * [ADR-018](../../../docs/adrs/ADR-018-card-preset-boundary.md)), not a
   * standalone card. Image on the left, content (tag, title, description,
   * action) on the right. Use for single-row sections where a vertical layout
   * wastes horizontal space: Related Customer Story, Recommended Add-On,
   * featured plan. Collapses to a vertical stack at ≤ 640px.
   */
  preset: 'display-row';
  /** Card heading. Renders with `--font-family-heading` + `--heading-md`; the element is `titleAs` (default `h3`). */
  title: string;
  /**
   * Heading element for `title` — `h2` / `h3` / `h4`. Default `h3`. Set to keep
   * the document outline correct for the card's context. Visual size is
   * token-driven and does not change with the level.
   */
  titleAs?: CardHeadingLevel;
  /**
   * Optional service-line surface tint — a pale wash keyed to a service line
   * (`--surface-service-{line}-light`). The visual size / border are unchanged;
   * this only sets the surface. Orthogonal to layout props.
   */
  tint?: CardTint;
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
 * @example Default with leading media (avatar / 1:1 image on the left)
 * ```tsx
 * <Card media={{ avatar: { src: u.avatar, name: u.name, status: 'online' } }}>
 *   <CardTitle as="h4">{u.name}</CardTitle>
 *   <CardDescription>{u.email}</CardDescription>
 * </Card>
 *
 * <Card media={{ image: { src: org.logo, alt: `${org.name} logo`, fit: 'contain' } }}>
 *   <CardTitle as="h4">{org.name}</CardTitle>
 *   <CardDescription>{org.plan}</CardDescription>
 * </Card>
 *
 * <Card media={{ logo: { set: 'integration', name: 'notion' } }}>
 *   <CardTitle as="h4">Notion</CardTitle>
 *   <CardDescription>Connected</CardDescription>
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
 * @example Control preset — integration card with logo + connection status
 * ```tsx
 * <Card
 *   preset="control"
 *   title="Google Analytics"
 *   description="Pull session and conversion data into your dashboard."
 *   logo={<Avatar src="/logos/google-analytics.png" alt="Google Analytics" size="sm" />}
 *   connectionStatus="synced"
 *   lastSynced="Last synced 3 min ago"
 *   action={<Button variant="outline" size="sm">Configure</Button>}
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

/**
 * Render the default Card's leading media slot — an `Avatar` or a square 1:1
 * `Image`, keyed to the shared media-size scale. The card owns only the
 * fixed-square wrapper (for images) and shrink-to-content sizing; the visual
 * itself comes from the composed primitive.
 */
function renderCardMedia(media: CardMedia) {
  if (media.avatar) {
    const { src, alt, name, size = 'md', status } = media.avatar;
    return (
      <div className="bds-card__media">
        <Avatar src={src} alt={alt} name={name} size={size} status={status} />
      </div>
    );
  }
  if (media.logo) {
    // `media.logo` is a correlated `set`/`name` union; a spread decorrelates
    // it, so cast the whole config to LogoProps (sound — CardLogoMedia already
    // constrains the caller to valid pairs).
    const size = media.logo.size ?? 'md';
    return (
      <div className={bdsClass('bds-card__media', `bds-card__media--${size}`)}>
        <Logo {...(media.logo as LogoProps)} size={size} />
      </div>
    );
  }
  const { src, alt, size = 'md', fit = 'contain' } = media.image;
  return (
    <div className={bdsClass('bds-card__media', `bds-card__media--${size}`)}>
      <Image src={src} alt={alt} ratio="1-1" fit={fit} />
    </div>
  );
}

function renderDefault({
  variant = 'outlined',
  children,
  media,
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
    media && 'bds-card--media',
    interactive && 'bds-card--interactive',
    href && 'bds-card--link',
    className,
  );

  // With media, split into a leading media wrapper + a content column so
  // children keep their vertical rhythm beside the avatar / image. Without
  // media, render children directly — unchanged from the original layout.
  const content = media ? (
    <>
      {renderCardMedia(media)}
      <div className="bds-card__content">{children}</div>
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <a href={href} className={classes} style={style} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }

  return (
    <div className={classes} style={style} {...rest}>
      {content}
    </div>
  );
}

const CONNECTION_STATUS_LABELS: Record<CardControlConnectionStatus, string> = {
  'not-configured': 'Not configured',
  connected:        'Connected',
  syncing:          'Syncing',
  synced:           'Synced',
  error:            'Error',
};

/**
 * Connection-status → `Dot` status. Composes the shared `<Dot>` primitive
 * (which owns the dot's size + semantic-token color per status) instead of a
 * bespoke dot — `not-configured` maps to Dot's `neutral`, which `Badge` lacks.
 */
const CONNECTION_STATUS_DOT: Record<CardControlConnectionStatus, DotStatus> = {
  'not-configured': 'neutral',
  connected:        'positive',
  syncing:          'info',
  synced:           'positive',
  error:            'error',
};

function renderControlPreset({
  title,
  description,
  badge,
  logo,
  action,
  actionAlign = 'center',
  connectionStatus,
  lastSynced,
  className,
  style,
  preset: _preset,
  ...rest
}: CardControlPresetProps) {
  const hasTrailing = action || connectionStatus;
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
        {logo && <div className="bds-card__preset-control-logo">{logo}</div>}
        {badge}
        <div className="bds-card__preset-control-text">
          <p className="bds-card__preset-control-title">{title}</p>
          {description && <p className="bds-card__preset-control-description">{description}</p>}
        </div>
      </div>
      {hasTrailing && (
        <div className="bds-card__preset-control-trailing">
          {connectionStatus && (
            <div
              className={bdsClass(
                'bds-card__preset-control-status',
                `bds-card__preset-control-status--${connectionStatus}`,
              )}
              role="status"
              aria-label={`Connection status: ${CONNECTION_STATUS_LABELS[connectionStatus]}`}
            >
              {/* Decorative — the wrapper's role="status" + aria-label is the
                  single announcement; Dot is the visual mark only. */}
              <Dot status={CONNECTION_STATUS_DOT[connectionStatus]} aria-hidden />
              <span className="bds-card__preset-control-status-label">
                {CONNECTION_STATUS_LABELS[connectionStatus]}
              </span>
              {lastSynced && connectionStatus !== 'not-configured' && (
                <span className="bds-card__preset-control-status-synced">{lastSynced}</span>
              )}
            </div>
          )}
          {action && <div className="bds-card__preset-control-action">{action}</div>}
        </div>
      )}
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
  titleAs: Heading = 'h3',
  description,
  image,
  tag,
  badge,
  action,
  href,
  variant,
  tint,
  className,
  style,
  preset: _preset,
  ...rest
}: CardDisplayPresetProps) {
  const classes = bdsClass(
    'bds-card',
    'bds-card--preset-display',
    variant && `bds-card--${variant}`,
    tint && `bds-card--tint-${tint}`,
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
        <Heading className="bds-card__preset-display-title">{title}</Heading>
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
  titleAs: Heading = 'h3',
  description,
  image,
  tag,
  extras,
  action,
  imageWidth = 'standard',
  href,
  tint,
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
    tint && `bds-card--tint-${tint}`,
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
        <Heading className="bds-card__preset-display-row-title">{title}</Heading>
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
  as?: CardHeadingLevel;
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
