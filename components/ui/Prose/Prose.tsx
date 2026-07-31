import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Prose.css';

export interface ProseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'dangerouslySetInnerHTML'> {
  /**
   * Sanitized HTML markup to render. BDS does not sanitize — `Prose` is a
   * presentation-only Block; the caller sanitizes before passing `html`
   * (mirrors brikdesigns' `RichContentBlock`, which calls its own
   * `sanitizeHtml` at ISR time before handing markup to `.rich-content`).
   * Never pass unsanitized user/CMS input.
   */
  html: string;
}

/**
 * Prose — free-form CMS-HTML Block. Formalizes brikdesigns' `.rich-content`:
 * renders already-sanitized HTML and owns the vertical rhythm BETWEEN its
 * rendered elements (element-adjacency rhythm, not named-slot rhythm —
 * `ContentBlock` owns that case).
 *
 * Per ADR-023 §3: a heading directly followed by a paragraph gets the medium
 * gap; two consecutive paragraphs get the wide gap. Both are mode-tied
 * `--gap-*` tokens, never raw px.
 *
 * @summary Sanitized rich-text Block — owns heading/paragraph rhythm
 */
export function Prose({ html, className, style, ...props }: ProseProps) {
  if (!html) return null;
  return (
    <div
      className={bdsClass('bds-prose', className)}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}

export default Prose;
