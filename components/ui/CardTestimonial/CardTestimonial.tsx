import { type HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import './CardTestimonial.css';

export type CardTestimonialVariant = 'brand' | 'outlined';

export interface CardTestimonialProps extends HTMLAttributes<HTMLDivElement> {
  quote: string;
  authorName: string;
  authorRole?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
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
    <div
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

      <div className="bds-card-testimonial__attribution">
        <p className="bds-card-testimonial__name">{authorName}</p>
        {authorRole && <p className="bds-card-testimonial__role">{authorRole}</p>}
      </div>

      {rating != null && rating > 0 && (
        <div className="bds-card-testimonial__stars" role="img" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Icon key={i} icon="ph:star-fill" style={{ opacity: i < rating ? 1 : 0.3 }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CardTestimonial;
