import { type HTMLAttributes, type ReactNode } from 'react';
import { Avatar } from '../Avatar';
import { bdsClass } from '../../utils';
import './MarketingIllustration.css';

/**
 * Illustration variant — defines the slot taxonomy and slot positions.
 *
 * `persona-cluster` is the marketing pattern of "two-people-talking" with
 * scattered chat bubbles, photos, and accent shapes. Used in the
 * `support_plan_callout_split` blueprint and similar marketing-callout
 * compositions where you want a casual-conversational feeling.
 *
 * Future variants follow the same shape (data-driven tiles + variant-
 * defined slot positions): `product-cluster`, `data-cluster`, etc. — each
 * a sibling deliverable when a blueprint needs it.
 */
export type IllustrationVariant = 'persona-cluster';

/**
 * Visual accent for tile fills. Resolves to a canonical surface token
 * via the cascade — never a raw hex. Multi-platform: `brand-primary`
 * binds to whichever audience subtree the consumer set via
 * `data-audience`.
 */
export type IllustrationAccent =
  | 'brand-primary'
  | 'positive'
  | 'neutral'
  | 'inverse';

export type IllustrationRatio = 'square' | 'portrait' | 'landscape';

export type IllustrationTile =
  | { kind: 'avatar'; src: string; alt: string; name?: string }
  | { kind: 'photo'; src: string; alt: string }
  | { kind: 'chat-bubble'; content: string; accent?: IllustrationAccent }
  | { kind: 'message'; content?: string; accent?: IllustrationAccent }
  | { kind: 'shape'; accent?: IllustrationAccent };

export interface MarketingIllustrationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Layout variant. Default `persona-cluster`. */
  variant?: IllustrationVariant;
  /**
   * Tiles composed in the scene. Up to 5 tiles get distinct slot
   * positions per the variant; additional tiles fall back to the last
   * slot. Order determines slot placement (slot 0 first, slot 1 next).
   */
  tiles: IllustrationTile[];
  /** Aspect ratio of the illustration container. Default `square`. */
  ratio?: IllustrationRatio;
}

/**
 * MarketingIllustration — composable illustration scene primitive.
 *
 * Composes Avatars, photo circles, chat bubbles, message tiles, and
 * accent shapes into a marketing-callout illustration. Replaces the
 * pattern of every consumer site reinventing absolute-positioned scene
 * compositions in repo-local CSS (the gap surfaced in the
 * `support_plan_callout_split` blueprint spec — BDS #480).
 *
 * @example
 * ```tsx
 * <MarketingIllustration
 *   variant="persona-cluster"
 *   tiles={[
 *     { kind: 'avatar', src: '/people/persona-1.jpg', alt: 'Strategist Sam' },
 *     { kind: 'chat-bubble', content: 'How can I help today?', accent: 'brand-primary' },
 *     { kind: 'message', accent: 'positive' },
 *     { kind: 'photo', src: '/people/persona-2.jpg', alt: 'Operations Olivia' },
 *     { kind: 'chat-bubble', content: 'We need an email campaign', accent: 'neutral' },
 *   ]}
 * />
 * ```
 *
 * Multi-platform note: the data-driven `tiles` array is portable
 * (framework-agnostic JSON shape). SwiftUI/Compose ports would re-render
 * each tile kind natively but consume the same content contract.
 *
 * @summary Composable marketing-illustration scene primitive.
 */
export function MarketingIllustration({
  variant = 'persona-cluster',
  tiles,
  ratio = 'square',
  className,
  ...props
}: MarketingIllustrationProps) {
  return (
    <div
      className={bdsClass(
        'bds-marketing-illustration',
        `bds-marketing-illustration--${variant}`,
        `bds-marketing-illustration--ratio-${ratio}`,
        className,
      )}
      role="img"
      aria-label={
        tiles
          .map((t) => ('alt' in t ? t.alt : 'content' in t ? t.content : ''))
          .filter(Boolean)
          .join(', ') || undefined
      }
      {...props}
    >
      {tiles.map((tile, i) => (
        <Tile key={i} tile={tile} slotIndex={Math.min(i, 4)} />
      ))}
    </div>
  );
}

/* ─── Tile sub-renderer ──────────────────────────────────────── */

function Tile({ tile, slotIndex }: { tile: IllustrationTile; slotIndex: number }) {
  const slotClass = `bds-marketing-illustration__slot-${slotIndex}`;
  const accentClass = 'accent' in tile && tile.accent
    ? `bds-marketing-illustration__tile--accent-${tile.accent}`
    : undefined;

  let inner: ReactNode;
  switch (tile.kind) {
    case 'avatar':
      inner = <Avatar src={tile.src} alt={tile.alt} name={tile.name} size="lg" />;
      break;
    case 'photo':
      inner = (
        <img
          src={tile.src}
          alt={tile.alt}
          className="bds-marketing-illustration__photo"
        />
      );
      break;
    case 'chat-bubble':
      inner = (
        <div className="bds-marketing-illustration__chat-bubble">
          {tile.content}
        </div>
      );
      break;
    case 'message':
      inner = (
        <div className="bds-marketing-illustration__message">
          {tile.content && <span>{tile.content}</span>}
        </div>
      );
      break;
    case 'shape':
      inner = <div className="bds-marketing-illustration__shape" aria-hidden />;
      break;
  }

  return (
    <div
      className={bdsClass(
        'bds-marketing-illustration__tile',
        `bds-marketing-illustration__tile--${tile.kind}`,
        slotClass,
        accentClass,
      )}
    >
      {inner}
    </div>
  );
}

export default MarketingIllustration;
