/**
 * HeroMediaCard — presentational, non-interactive `bds-hero__media-card`
 * root (brik-bds#2284). Extracted from the `@deprecated` adapter
 * `HeroSplitImageCardOverlay.tsx:125-191`, which hard-codes a plain
 * `<aside>` with its own `<Button>` CTA inside — nesting that `<button>`
 * inside an outer interactive `<a>` / `<Card interactive>` is invalid, so a
 * consumer that needs the whole card as a single tap target couldn't
 * compose it from the adapter.
 *
 * Renders NO interactivity and no `<Button>` of its own — a consumer
 * wanting the whole card clickable wraps it in `<Card href="…">`
 * (`components/ui/Card/Card.tsx:143-145`) or their own `as="a" href`; a
 * consumer wanting the legacy card-plus-button shape renders a real
 * `<Button>` as a child.
 *
 * Polymorphic root via `as` (mirrors `Frame`, `components/ui/Frame/Frame.tsx:91`),
 * default `"aside"` — matching the adapter's hard-coded `<aside>` root
 * (`HeroSplitImageCardOverlay.tsx:126`).
 *
 * `missing` renders the same `data-content-needed` fallback stub the
 * adapter renders when its `priceCard` data is absent
 * (`HeroSplitImageCardOverlay.tsx:180-191`) — a `bds-blueprint-section__missing
 * bds-hero__missing` `<Frame>` with a `bds-blueprint-section__missing-label`
 * child — instead of `children`.
 *
 * @summary Non-interactive hero media-card root — composes an image + optional price, or a `missing` fallback stub.
 */
import { type ElementType, type HTMLAttributes, type ReactNode } from 'react';

import { Frame, type FrameRatio } from '../../../components/ui/Frame/Frame';
import { bdsClass } from '../../../components/utils';

export interface HeroMediaCardMissing {
  /** Fallback message rendered in place of the card content. */
  label: string;
}

export interface HeroMediaCardProps extends HTMLAttributes<HTMLElement> {
  /**
   * Root element. Default `"aside"`, matching the legacy adapter's
   * hard-coded root — set `as="a"` with `href` (or wrap in `<Card href>`)
   * for a single-tap-target card.
   */
  as?: ElementType;
  /**
   * When set, renders the `data-content-needed` fallback stub instead of
   * `children` — the same shape the adapter renders when its `priceCard`
   * data is absent.
   */
  missing?: HeroMediaCardMissing;
  /**
   * Aspect ratio for the `missing` fallback's `<Frame>`. Ignored when
   * `missing` is unset — `<HeroMediaCardImage>` owns its own `ratio` for
   * the populated case. Default `"square"`, matching the adapter's
   * `imageRatio` default.
   */
  ratio?: FrameRatio;
  /** Card content — compose `<HeroMediaCardImage>` + optional `<HeroMediaCardPrice>`. */
  children?: ReactNode;
}

export function HeroMediaCard({
  as: Element = 'aside',
  missing,
  ratio = 'square',
  className,
  children,
  ...rest
}: HeroMediaCardProps) {
  if (missing) {
    return (
      <Frame
        ratio={ratio}
        as={Element}
        className={bdsClass('bds-blueprint-section__missing', 'bds-hero__missing', className)}
        data-content-needed="hero_image_url"
        role="presentation"
        {...rest}
      >
        <p className="bds-blueprint-section__missing-label">{missing.label}</p>
      </Frame>
    );
  }

  return (
    <Element className={bdsClass('bds-hero__media-card', className)} {...rest}>
      {children}
    </Element>
  );
}

export default HeroMediaCard;
