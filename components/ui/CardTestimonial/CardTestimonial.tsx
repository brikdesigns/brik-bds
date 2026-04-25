import { type HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import './CardTestimonial.css';

export type CardTestimonialVariant = 'brand' | 'outlined';

export interface CardTestimonialProps extends HTMLAttributes<HTMLElement> {
  /** Testimonial body — the customer's quote. Rendered inside a `<blockquote>`. */
  quote: string;
  /** Person attribution rendered under the quote (typically full name). */
  authorName: string;
  /** Job title / company / context displayed beneath the author name. */
  authorRole?: string;
  /** Optional 1–5 star rating rendered as filled stars at the bottom. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Visual variant. `brand` (default) uses the brand-tinted card surface; `outlined` swaps to a neutral surface with a border. */
  variant?: CardTestimonialVariant;
}

/**
 * CardTestimonial — customer testimonial card with quote, attribution, and stars.
 */
export function CardTestimonial({
  quote,
  authorName,
  authorRole,
  rating,
  variant = 'brand',
  className,
  style,
  ...props
}: CardTestimonialProps) {
  return (
    <figure
      className={bdsClass('bds-card-testimonial', `bds-card-testimonial--${variant}`, className)}
      style={style}
      {...props}
    >
      <div className="bds-card-testimonial__quote-mark" aria-hidden="true">
        {'\u201C'}
      </div>

      <blockquote className="bds-card-testimonial__body">
        {quote}
      </blockquote>

      <figcaption className="bds-card-testimonial__attribution">
        <cite className="bds-card-testimonial__name">{authorName}</cite>
        {authorRole && <span className="bds-card-testimonial__role">{authorRole}</span>}
      </figcaption>

      {rating != null && rating > 0 && (
        <div className="bds-card-testimonial__stars" role="img" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Icon key={i} icon="ph:star-fill" style={{ opacity: i < rating ? 1 : 0.3 }} />
          ))}
        </div>
      )}
    </figure>
  );
}

export default CardTestimonial;
