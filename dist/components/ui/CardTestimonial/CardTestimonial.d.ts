import { type HTMLAttributes } from 'react';
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
export declare function CardTestimonial({ quote, authorName, authorRole, rating, variant, className, style, ...props }: CardTestimonialProps): import("react/jsx-runtime").JSX.Element;
export default CardTestimonial;
