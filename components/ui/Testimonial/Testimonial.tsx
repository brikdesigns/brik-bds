import { type HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import './Testimonial.css';

export type TestimonialVariant = 'brand' | 'outlined';

export interface TestimonialProps extends HTMLAttributes<HTMLElement> {
  /** Testimonial body — the customer's quote. Rendered inside a `<blockquote>`. */
  quote: string;
  /** Person attribution rendered under the quote (typically full name). */
  authorName: string;
  /** Job title / company / context displayed beneath the author name. */
  authorRole?: string;
  /** Optional 1–5 star rating rendered as filled stars at the bottom. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Visual variant. `brand` (default) uses the brand-tinted surface; `outlined` swaps to a neutral surface with a border. */
  variant?: TestimonialVariant;
}

/**
 * Customer testimonial block — quote, attribution, and optional star rating.
 * Renders semantic `<figure>/<blockquote>/<figcaption>/<cite>` HTML.
 * `surface-web` component: marketing pages and Webflow client sites only.
 *
 * @summary Customer testimonial — quote, attribution, and star rating
 */
export function Testimonial({
  quote,
  authorName,
  authorRole,
  rating,
  variant = 'brand',
  className,
  style,
  ...props
}: TestimonialProps) {
  return (
    <figure
      className={bdsClass('bds-testimonial', `bds-testimonial--${variant}`, className)}
      style={style}
      {...props}
    >
      <div className="bds-testimonial__quote-mark" aria-hidden="true">
        {'“'}
      </div>

      <blockquote className="bds-testimonial__body">
        {quote}
      </blockquote>

      <figcaption className="bds-testimonial__attribution">
        <cite className="bds-testimonial__name">{authorName}</cite>
        {authorRole && <span className="bds-testimonial__role">{authorRole}</span>}
      </figcaption>

      {rating != null && rating > 0 && (
        <div className="bds-testimonial__stars" role="img" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Icon key={i} icon="ph:star-fill" style={{ opacity: i < rating ? 1 : 0.3 }} />
          ))}
        </div>
      )}
    </figure>
  );
}

export default Testimonial;
