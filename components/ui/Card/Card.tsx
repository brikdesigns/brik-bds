import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import { Avatar, type AvatarStatus } from '../Avatar';
import { Image } from '../Image';
import { Logo, type LogoProps } from '../Logo';
import { Dot, type DotTone } from '../Dot';
import type { ServiceLine } from '../ServiceTag/service-config';
import './Card.css';

export type CardVariant = 'outlined' | 'brand' | 'elevated' | 'raised' | 'borderless';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
/**
 * Card layout arrangement (ADR-038) — the flat, anatomy-driven interface. One
 * `Card`, one slot set, four arrangements:
 *
 * - `stack` — vertical: optional top `media`, then `overline` / `title` /
 *   `children` (body) / `action`. The malleable `CardGrid` cell.
 * - `row` — horizontal: `media` on the left, the same text column on the right.
 * - `metric` — compact stat: `overline` as the label above a large `title`
 *   value, optional `media` glyph, `detail` line, and `action`.
 * - `control` — horizontal settings/integration row: leading `media` (logo) +
 *   `title` / `description` on the left, `connectionStatus` + `action` on the
 *   right, vertically centred.
 *
 * A Card with no `layout` is the default flexible content card (compose
 * `<CardTitle>` / `<CardDescription>` / `<CardFooter>` in `children`).
 */
export type CardLayout = 'stack' | 'row' | 'metric' | 'control';
/** Heading level for a card's title — decouples document outline from the token-driven visual size. */
export type CardHeadingLevel = 'h2' | 'h3' | 'h4';
/**
 * Service-line surface tint for the `stack`/`row` layouts. Maps to the
 * canonical `--surface-service-{line}-light` pastel surface token — never an
 * invented name. Excludes the deprecated `service` alias of `ServiceLine`;
 * pass `back-office`.
 */
export type CardTint = Exclude<ServiceLine, 'service'>;
export type CardControlActionAlign = 'center' | 'top';
/**
 * Connection-status state for the `control` layout integration card.
 * Maps to canonical semantic token pairs:
 * - `not-configured` → `--text-muted` / `--background-status-neutral` (neutral/unconfigured)
 * - `connected`      → `--text-positive` / `--background-positive`
 * - `syncing`        → `--text-status-info` / `--background-status-info` (blue/in-progress)
 * - `synced`         → `--text-positive` / `--background-positive`
 * - `failed`         → `--text-negative` / `--background-negative`
 */
export type CardControlConnectionStatus =
  | 'not-configured'
  | 'connected'
  | 'syncing'
  | 'synced'
  | 'failed';

const RETIRED_CONNECTION_STATUS: Record<string, CardControlConnectionStatus> = {
  error: 'failed',
};
/**
 * Image-column width for the `row` layout. Named values resolve to fixed
 * percentages (`narrow` 25%, `standard` 35%, `wide` 50%); pass a CSS length /
 * percentage string to override (e.g. `"40%"`, `"320px"`).
 */
export type CardDisplayRowImageWidth = 'narrow' | 'standard' | 'wide' | (string & {});

/**
 * Media treatment for the `stack` layout — how the top `media` slot relates to
 * the card edge.
 *
 * - `flush` (default) — the media bleeds to the card edge and only the text
 *   body carries the `--padding-lg` inset. The blog/story/product-grid look.
 * - `inset` — the media AND the text body are framed together inside a single
 *   `--padding-huge` inset, with `--gap-xl` separating image from text. The
 *   service-card "card-vertical" look. Replaces the site-local
 *   `.service-card--inset` override so the treatment lives on the primitive,
 *   not per-consumer CSS.
 */
export type CardMediaTreatment = 'flush' | 'inset';

/**
 * Size for the default Card's leading `media` slot — a square on the shared
 * media scale (`sm` 32px, `md` 40px, `lg` 48px, `xl` 64px) so an avatar, a 1:1
 * image, and a bundled `Logo` all read at the same footprint. Default `md`.
 *
 * Its own union rather than `AvatarSize`: the media slot is shared with `Logo`
 * (`LogoSize`, no `xs`), and `Avatar`'s `xs` (24px) is for dense inline
 * affordances outside cards. Keeping this at `sm`–`xl` preserves the shared
 * footprint and avoids leaking `xs` into the `Logo` path.
 */
export type CardMediaSize = 'sm' | 'md' | 'lg' | 'xl';
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

interface CardBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Optional class name applied to the root element.
   */
  className?: string;
}

interface CardDefaultProps extends CardBaseProps {
  /** Discriminant guard — the flat anatomy API uses `layout`; the default card omits it. */
  layout?: never;
  /**
   * Visual variant — outlined / brand / elevated / raised / borderless
   * (default `outlined`). Use `borderless` for cards sitting on a colored
   * surface, where the border ring reads as visual noise. `raised` —
   * surface-primary fill, no border, with a `--box-shadow-md` drop shadow;
   * use for a focal/lone card or a grid cell that needs a lifted, contained
   * read (the shadow-casting counterpart to the now-flat `elevated`).
   */
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

/**
 * Flat, anatomy-driven Card (ADR-038). Selected by passing `layout`; every slot
 * is optional and the same slot set serves all four arrangements. Storybook
 * infers one flat, honest prop set and an argless `<Card layout="stack" />` is a
 * valid empty card, not the empty-outlined-box the old `preset` union produced.
 */
interface CardAnatomyProps extends CardBaseProps {
  /** Arrangement — `stack` / `row` / `metric` / `control`. Selects this flat API. */
  layout: CardLayout;
  /**
   * Leading media — a `<Frame>`-wrapped `<Image>`, `<Avatar>`, `<Logo>`, or any
   * ReactNode. Top of the card in `stack`, left column in `row`, a leading glyph
   * (e.g. `<ServiceTag>`) beside the stat in `metric`, the logo in `control`.
   * Omit for a text-only card.
   */
  media?: ReactNode;
  /**
   * Eyebrow above the title — a `<ServiceTag>`, `<Tag>`, category, or date pill
   * in `stack`/`row`; the stat label in `metric`. Justified flex-start.
   */
  overline?: ReactNode;
  /**
   * Title. A heading (`titleAs`, default `h3`) in `stack`/`row`; the large stat
   * value in `metric`; the control label in `control`. Any ReactNode — no
   * numeric formatting is applied, so format the value before passing it.
   */
  title?: ReactNode;
  /** Heading element for `title` in `stack`/`row` — `h2` / `h3` / `h4`. Default `h3`. Ignored by `metric`/`control`. */
  titleAs?: CardHeadingLevel;
  /** Body content under the title (`stack`/`row`). Arbitrary ReactNode; the card owns only the column rhythm. */
  children?: ReactNode;
  /** Trailing action — bottom-anchored in `stack`/`row`, inline-right in `metric`/`control`. */
  action?: ReactNode;
  /** Overlay badge anchored to the media corner (`stack`); the leading badge in `control`. */
  badge?: ReactNode;
  /** Service-line surface tint (`stack`/`row`) — pale wash keyed to a service line. Border/size unchanged. */
  tint?: CardTint;
  /** Surface treatment for a cell on a colored grid — `borderless` / `elevated` / `raised` (`stack`). */
  variant?: 'borderless' | 'elevated' | 'raised';
  /** Image column width for `row` — `narrow` (25%) / `standard` (35%, default) / `wide` (50%) / any CSS length. */
  imageWidth?: CardDisplayRowImageWidth;
  /** Media treatment for `stack` — `flush` (default, bleeds to edge) / `inset` (framed with the body). */
  mediaTreatment?: CardMediaTreatment;
  /** Render the whole card as an `<a>` navigation target (`stack`/`row`). */
  href?: string;
  /** Helper text under the title (`control` only — the settings-row description). */
  description?: ReactNode;
  /** Trailing-block vertical alignment (`control` only) — `center` (default) / `top`. */
  actionAlign?: CardControlActionAlign;
  /** Connection-status indicator (`control` only) — `not-configured` / `connected` / `syncing` / `synced` / `failed`. */
  connectionStatus?: CardControlConnectionStatus;
  /** "Last synced" label below the status indicator (`control` only). */
  lastSynced?: string;
  /** Secondary detail line below the value (`metric` only) — e.g. a price • frequency, a delta, a unit. */
  detail?: ReactNode;
}

export type CardProps = CardDefaultProps | CardAnatomyProps;

/**
 * Card — flexible content container (ADR-038 flat anatomy API).
 *
 * - **Default** (no `layout`) — flexible content slot. Compose with
 *   `<CardTitle>`, `<CardDescription>`, `<CardFooter>` subcomponents.
 *   Visual variants: `outlined` (default) / `brand` / `elevated` / `raised` /
 *   `borderless`.
 * - **`layout="stack"`** — vertical grid cell: top `media`, `overline`,
 *   `title`, body `children`, bottom-anchored `action`.
 * - **`layout="row"`** — horizontal cell: `media` left, text column right.
 * - **`layout="metric"`** — compact stat: `overline` label, large `title`
 *   value, optional `media` glyph + `detail` line + `action`.
 * - **`layout="control"`** — settings/integration row: leading `media` (logo)
 *   + `title` / `description`, trailing `connectionStatus` + `action`.
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
 * ```
 *
 * @example Control layout — integration card with logo + connection status
 * ```tsx
 * <Card
 *   layout="control"
 *   title="Google Analytics"
 *   description="Pull session and conversion data into your dashboard."
 *   media={<Avatar src="/logos/google-analytics.png" alt="Google Analytics" size="sm" />}
 *   connectionStatus="synced"
 *   lastSynced="Last synced 3 min ago"
 *   action={<Button variant="outline" size="sm">Configure</Button>}
 * />
 * ```
 *
 * @example Metric layout
 * ```tsx
 * <Card layout="metric" overline="Total revenue" title="$48,250.75"
 *   action={<LinkButton href="/revenue">Details</LinkButton>} />
 * ```
 *
 * @summary Flexible content container with a layout axis
 */
export function Card(props: CardProps) {
  // ADR-038 flat anatomy API — `layout` selects an arrangement; its absence is
  // the default flexible content card.
  if (props.layout != null) {
    return renderAnatomy(props);
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
  failed:           'Error',
};

/**
 * Connection-status → `Dot` status. Composes the shared `<Dot>` primitive
 * (which owns the dot's size + semantic-token color per status) instead of a
 * bespoke dot — `not-configured` maps to Dot's `neutral`, which `Badge` lacks.
 */
const CONNECTION_STATUS_DOT: Record<CardControlConnectionStatus, DotTone> = {
  'not-configured': 'neutral',
  connected:        'positive',
  syncing:          'info',
  synced:           'positive',
  failed:           'negative',
};

/**
 * Render the flat anatomy Card (ADR-038). Each `layout` owns a dedicated BEM
 * block (`bds-card--{stack,row,metric,control}`); the slots are the same set
 * across all four.
 */
function renderAnatomy({
  layout,
  media,
  overline,
  title,
  titleAs: Heading = 'h3',
  children,
  action,
  badge,
  tint,
  variant,
  imageWidth = 'standard',
  mediaTreatment = 'flush',
  href,
  description,
  actionAlign = 'center',
  connectionStatus,
  lastSynced,
  detail,
  className,
  style,
  ...rest
}: CardAnatomyProps) {
  if (layout === 'control') {
    const resolvedConnectionStatus = resolveRetiredValue(
      'Card',
      'connectionStatus',
      connectionStatus,
      RETIRED_CONNECTION_STATUS,
    );
    const hasTrailing = action || resolvedConnectionStatus;
    return (
      <div
        className={bdsClass(
          'bds-card',
          'bds-card--layout-control',
          `bds-card--layout-control-action-${actionAlign}`,
          className,
        )}
        style={style}
        {...rest}
      >
        <div className="bds-card__control-content">
          {media && <div className="bds-card__control-logo">{media}</div>}
          {badge}
          <div className="bds-card__control-text">
            <p className="bds-card__control-title">{title}</p>
            {description && <p className="bds-card__control-description">{description}</p>}
          </div>
        </div>
        {hasTrailing && (
          <div className="bds-card__control-trailing">
            {resolvedConnectionStatus && (
              <div
                className={bdsClass(
                  'bds-card__control-status',
                  `bds-card__control-status--${resolvedConnectionStatus}`,
                )}
                role="status"
                aria-label={`Connection status: ${CONNECTION_STATUS_LABELS[resolvedConnectionStatus]}`}
              >
                {/* Decorative — the wrapper's role="status" + aria-label is the
                    single announcement; Dot is the visual mark only. */}
                <Dot tone={CONNECTION_STATUS_DOT[resolvedConnectionStatus]} aria-hidden />
                <span className="bds-card__control-status-label">
                  {CONNECTION_STATUS_LABELS[resolvedConnectionStatus]}
                </span>
                {lastSynced && resolvedConnectionStatus !== 'not-configured' && (
                  <span className="bds-card__control-status-synced">{lastSynced}</span>
                )}
              </div>
            )}
            {action && <div className="bds-card__control-action">{action}</div>}
          </div>
        )}
      </div>
    );
  }

  if (layout === 'metric') {
    return (
      <div className={bdsClass('bds-card', 'bds-card--layout-metric', className)} style={style} {...rest}>
        <div className="bds-card__metric-inner">
          {media && <div className="bds-card__metric-media">{media}</div>}
          <div className="bds-card__metric-content">
            {overline != null && <p className="bds-card__metric-label">{overline}</p>}
            {title != null && <p className="bds-card__metric-value">{title}</p>}
            {detail != null && <p className="bds-card__metric-detail">{detail}</p>}
          </div>
          {action && <div className="bds-card__metric-action">{action}</div>}
        </div>
      </div>
    );
  }

  if (layout === 'row') {
    const isNamed = NAMED_IMAGE_WIDTHS.has(imageWidth);
    const classes = bdsClass(
      'bds-card',
      'bds-card--layout-row',
      isNamed && `bds-card--layout-row-${imageWidth}`,
      tint && `bds-card--tint-${tint}`,
      href && 'bds-card--link',
      className,
    );
    const inlineStyle = isNamed
      ? style
      : { ...(style ?? {}), ['--bds-card-image-width' as string]: imageWidth };
    const body = (
      <>
        {media && <div className="bds-card__row-media">{media}</div>}
        <div className="bds-card__row-body">
          {overline != null && <span className="bds-card__row-overline">{overline}</span>}
          {title != null && <Heading className="bds-card__row-title">{title}</Heading>}
          {children}
          {action && <div className="bds-card__row-action">{action}</div>}
        </div>
      </>
    );
    if (href) {
      return (
        <a href={href} className={classes} style={inlineStyle as React.CSSProperties} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
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

  // layout === 'stack'
  const classes = bdsClass(
    'bds-card',
    // Default surface is `outlined` (fill + border); the `-stack` block owns
    // only the structural bits, so borderless/elevated/raised compose without
    // the specificity overrides the old preset needed (ADR-038).
    `bds-card--${variant ?? 'outlined'}`,
    'bds-card--layout-stack',
    mediaTreatment === 'inset' && 'bds-card--layout-stack-inset',
    tint && `bds-card--tint-${tint}`,
    href && 'bds-card--link',
    className,
  );
  const body = (
    <>
      {media && (
        <div className="bds-card__stack-media">
          {media}
          {badge && <span className="bds-card__stack-badge">{badge}</span>}
        </div>
      )}
      <div className="bds-card__stack-body">
        {overline != null && <span className="bds-card__stack-overline">{overline}</span>}
        {title != null && <Heading className="bds-card__stack-title">{title}</Heading>}
        {children}
        {action && <div className="bds-card__stack-action">{action}</div>}
      </div>
    </>
  );
  if (href) {
    return (
      <a href={href} className={classes} style={style} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
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
