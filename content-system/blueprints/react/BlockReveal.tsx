/**
 * BlockReveal — the shared block-entrance primitive for the blueprint motion
 * axis (ADR-039 §Decision 2, brik-bds#2494).
 *
 * `reveal` is a MODIFIER, not an element, so the Astro rail applies the same
 * `bds-block-reveal--*` class directly to a block's element (e.g. `Hero.astro`
 * appends it to `bds-hero__content`) rather than through a wrapper partial — a
 * wrapper would move the element out of the block's Astro style scope. This React
 * component is the ergonomic wrapper for the React rail; both rails emit the same
 * class, so both render the same entrance.
 *
 * A blueprint never hand-rolls a `@keyframes` or an inline `animation:` — it
 * selects a `reveal` value from the closed `BlueprintReveal` union and BlockReveal
 * applies the matching entrance via the shared `bds-fade-in` / `bds-slide-up`
 * keyframes and `--stagger-*` delays (`tokens/animations.css` +
 * `tokens/motion-classes.css`), all backed by `--duration-*` / `--ease-*`.
 *
 *   none    — renders its children in a bare wrapper, no animation (the default).
 *   fade    — the wrapper fades + scales in as one unit (`bds-fade-in`).
 *   rise    — the wrapper slides up from below as one unit (`bds-slide-up`).
 *   stagger — the wrapper's DIRECT children fade in sequentially (`--stagger-*`).
 *
 * **Reduced-motion-gated by construction** (AC3): the gate is pure CSS —
 * `BlockReveal.css` sets `animation: none` under `@media (prefers-reduced-motion:
 * reduce)`, so it applies with no JS at all and an agent selecting a reveal value
 * cannot ship un-gated motion. This is why (unlike `BlockMedia`'s `bg-video`) no
 * `usePrefersReducedMotion` effect is needed — a declarative CSS animation is
 * neutralised declaratively.
 *
 * The `bds-block-reveal--*` classes are single-sourced in `BlockReveal.css`
 * (→ `dist/styles.css`) so `canonical-class-check` sees them and the Astro rail
 * can emit the equivalent class (ADR-040). This is a behaviour modifier applied
 * to a block's existing element, so it carries NO base class and `reveal: none`
 * emits nothing — the wrapper is then indistinguishable from a plain `<div>`, so
 * adopting it changes no existing rendering.
 *
 * @summary Blueprint motion primitive — applies a `fade` / `rise` / `stagger` entrance selected by the `reveal` axis, reduced-motion-gated by construction.
 */
import { type HTMLAttributes, type ReactNode } from 'react';

import type { BlueprintReveal } from '../astro/types';
import './BlockReveal.css';

export interface BlockRevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Which entrance the block reveals with. See `BlueprintReveal`. Default `none`. */
  reveal?: BlueprintReveal;
  /** The content the reveal wraps. For `stagger`, its direct children animate in turn. */
  children: ReactNode;
}

export function BlockReveal({ reveal = 'none', className, children, ...rest }: BlockRevealProps) {
  // Only a non-`none` value carries a modifier — a rule-less `--none` modifier
  // would be an invented class (`canonical-class-check`), and no base
  // `bds-block-reveal` class is emitted so `none` leaves the host layout
  // untouched (identical to a plain `<div>` with just `className`).
  const cls =
    [className, reveal !== 'none' && `bds-block-reveal--${reveal}`].filter(Boolean).join(' ') ||
    undefined;
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export default BlockReveal;
