/**
 * Narrative — canonical `bds-narrative` narrative section primitive (Phase D,
 * brik-bds#1198). Consolidates the about blueprint family — the last family
 * in the ADR-008 Phase D sequence — retiring the per-blueprint
 * `bp-about-story-split` class.
 *
 * `about` is a single-member family, so there is no structural modifier: the
 * block *is* the narrative section (ADR-008 §3 — a modifier needs a sibling
 * layout to contrast against, and there is none). The former `--story` /
 * `--split` descriptors are dropped: `story` was variant-by-purpose and the
 * split was only ever a *state* (present when a pull-quote is supplied), which
 * the CSS now drives from the presence of the `__callout` slot via `:has()`.
 *
 * The spine is a narrative column: (eyebrow) → `h2` → lead. An optional
 * `testimonial` renders as a composed `<CardTestimonial>` aside — the ADR-008
 * primitive for pull-quotes. A hand-rolled quote element here is a
 * `lint-blueprint-naming` reinvented-primitive error; resolving that
 * pre-existing hazard is part of this consolidation.
 *
 * Two ways to drive it, mirroring `../astro/Narrative.astro` (#2352): **composed**
 * (`title` / `body` / `testimonial`) or **dispatched** (a `section` — the block
 * maps `section.*` itself, taking the first item as the pull-quote).
 * `BlueprintDispatcher` sends `story_split` here, with the key as `blueprintKey`.
 *
 * Slots (all pass `scripts/slot-pattern-check.mjs`):
 *   bds-narrative, __container, __narrative, __subtitle, __title, __lead, __callout
 *
 * Composed with the shared shell (ADR-021): `bds-blueprint-section` on the root,
 * `bds-blueprint-section__container` on the container.
 *
 * Token pairs (paired family ↔ size — never mix):
 *   subtitle    — --bds-font-family-label + --bds-label-lg (uppercase eyebrow)
 *   title (h2)  — --bds-font-family-heading + clamp(--bds-heading-lg … --bds-heading-xl)
 *   lead        — --bds-font-family-body + --bds-heading-sm
 *
 * a11y: `<section>` with `aria-labelledby` → the h2. Reading order is natural
 * (narrative first, supporting callout second) on every viewport.
 *
 * @summary About-page narrative — eyebrow + `h2` + lead, with an optional pull-quote `CardTestimonial` aside.
 */
import { type HTMLAttributes } from 'react';

import { CardTestimonial } from '../../../components';
import { bdsClass } from '../../../components/utils';
import type {
  BlueprintAlign,
  BlueprintMediaPosition,
  BlueprintOrientation,
  BlueprintProps,
  KnownBlueprintKey,
} from '../astro/types';
import { resolveSectionTitles } from '../astro/types';
import '../section-shell.css';
import './Narrative.css';

/** Optional pull-quote rendered as a `CardTestimonial` aside. */
export interface NarrativeTestimonial {
  /** The quote body. */
  quote: string;
  /** Attribution — typically a name. Maps to `CardTestimonial` `authorName`. */
  author: string;
  /** Optional role / company under the attribution. */
  authorRole?: string;
}

export interface NarrativeProps extends HTMLAttributes<HTMLElement> {
  /**
   * Stable section identifier. Drives the `aria-labelledby` id — keep it
   * stable across renders for a given section.
   */
  sectionKey: string;
  /** Section heading. Renders as `<h2>`. */
  title: string;
  /** Optional uppercase eyebrow above the heading. */
  subtitle?: string;
  /** The narrative paragraph under the heading. */
  body?: string;
  /**
   * Optional pull-quote. When present the section becomes a two-column
   * narrative-plus-callout layout; when absent it is a single narrative
   * column. Rendered as an `outlined` `<CardTestimonial>`.
   */
  testimonial?: NarrativeTestimonial;
  /**
   * Narrative-column placement (structure axis, ADR-039). `left` (default) or
   * `center`; emits the enum-bound `bds-narrative--align-center` modifier. Reads
   * most naturally on the single-column (no-testimonial) narrative.
   */
  align?: BlueprintAlign;
  /**
   * Pull-quote (aside) column side (structure axis, ADR-039, #3051). `end`
   * (default) keeps it after the narrative; `start` places it first from the
   * tablet rung up (with `orientation="vertical"`, at every width). Emits
   * `data-media-position="start"`; DOM order is unchanged.
   */
  mediaPosition?: BlueprintMediaPosition;
  /**
   * Narrative / pull-quote stacking (structure axis, ADR-039, #3051).
   * `horizontal` (default) sits them side by side from the tablet rung up;
   * `vertical` stacks them at every width. Emits `data-orientation="vertical"`.
   */
  orientation?: BlueprintOrientation;
}

/** Dispatched-mode props: a `BlueprintSection` plus the key rendered as the marker. */
export interface NarrativeSectionProps extends BlueprintProps {
  /** Rendered as `data-blueprint-key` so the scaffold contract can assert on it. */
  blueprintKey?: KnownBlueprintKey;
}

function NarrativeShell({
  sectionKey,
  title,
  subtitle,
  body,
  testimonial,
  align = 'left',
  mediaPosition = 'end',
  orientation = 'horizontal',
  className,
  ...rest
}: NarrativeProps) {
  const titleId = `${sectionKey}-title`;

  return (
    <section
      className={bdsClass(
        'bds-blueprint-section',
        'bds-narrative',
        align === 'center' && 'bds-narrative--align-center',
        className,
      )}
      aria-labelledby={titleId}
      data-media-position={mediaPosition !== 'end' ? mediaPosition : undefined}
      data-orientation={orientation !== 'horizontal' ? orientation : undefined}
      {...rest}
    >
      <div className="bds-blueprint-section__container bds-narrative__container">
        <div className="bds-narrative__narrative">
          {subtitle && <p className="bds-narrative__subtitle">{subtitle}</p>}
          <h2 id={titleId} className="bds-narrative__title">
            {title}
          </h2>
          {body && <p className="bds-narrative__lead">{body}</p>}
        </div>

        {testimonial && (
          <CardTestimonial
            className="bds-narrative__callout"
            variant="outlined"
            quote={testimonial.quote}
            authorName={testimonial.author}
            authorRole={testimonial.authorRole}
          />
        )}
      </div>
    </section>
  );
}

function NarrativeFromSection({ section, blueprintKey }: NarrativeSectionProps) {
  const titles = resolveSectionTitles(section);
  const callout = section.items[0];

  return (
    <NarrativeShell
      sectionKey={section.sectionKey}
      title={titles.title ?? ''}
      subtitle={titles.subtitle ?? undefined}
      body={section.body ?? undefined}
      testimonial={
        callout
          ? { quote: callout.description, author: callout.title }
          : undefined
      }
      mediaPosition={section.mediaPosition}
      orientation={section.orientation}
      data-blueprint-key={blueprintKey}
    />
  );
}

export function Narrative(props: NarrativeProps | NarrativeSectionProps) {
  return 'section' in props ? <NarrativeFromSection {...props} /> : <NarrativeShell {...props} />;
}

export default Narrative;
