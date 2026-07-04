import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import type { ServiceLine } from '../ServiceTag';
import './BlockQuote.css';

export interface BlockQuoteProps extends HTMLAttributes<HTMLElement> {
  /** The quote body — flows inline within longer narrative content. */
  quote: ReactNode;
  /** Optional attribution footer, e.g. `Joelle, Owner of Impressionz Salon & Spa`. */
  attribution?: ReactNode;
  /**
   * Optional service line — drives the left-border accent + soft tint via the
   * `--border-service-*` / `--surface-service-*-light` tokens. Omit for the
   * neutral treatment. (Named `serviceLine`, not `audience`, per the canonical
   * domain term — see brik-bds#788.)
   */
  serviceLine?: ServiceLine;
}

/**
 * BlockQuote — inline styled block-quote for narrative body content.
 *
 * Distinct from `Testimonial` (a discrete card with avatar / rating slots):
 * BlockQuote is an inline element that flows within a longer piece — customer
 * stories, blog posts. Optionally accents to a service line's color.
 *
 * @example
 * ```tsx
 * <BlockQuote
 *   quote="The website has made it so much easier to share what we do."
 *   attribution="Joelle, Owner of Impressionz Salon & Spa"
 *   serviceLine="marketing"
 * />
 * ```
 *
 * @summary Inline styled block-quote for narrative body content
 */
export function BlockQuote({
  quote,
  attribution,
  serviceLine,
  className,
  style,
  ...props
}: BlockQuoteProps) {
  return (
    <figure
      className={bdsClass(
        'bds-block-quote',
        serviceLine && `bds-block-quote--${serviceLine}`,
        className,
      )}
      style={style}
      {...props}
    >
      <blockquote className="bds-block-quote__body">{quote}</blockquote>
      {attribution && (
        <figcaption className="bds-block-quote__attribution">
          <cite className="bds-block-quote__cite">{attribution}</cite>
        </figcaption>
      )}
    </figure>
  );
}

export default BlockQuote;
