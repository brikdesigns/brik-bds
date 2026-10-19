import { type CSSProperties, type IframeHTMLAttributes, useEffect } from 'react';
import { bdsClass } from '../../utils';
import { ensureGhlEmbedScript, ghlFormSrc } from './ghlEmbed';
import './GhlForm.css';

/** GhlForm component props */
export interface GhlFormProps
  extends Omit<IframeHTMLAttributes<HTMLIFrameElement>, 'src' | 'title' | 'height' | 'children'> {
  /** The GHL form's id — the `id` in the form's embed code. */
  formId: string;
  /**
   * The form's name. Becomes the iframe `title`, which is what a screen reader
   * announces for the frame (WCAG 4.1.2). A blank value falls back to `Form`
   * so the title is never empty.
   */
  formName: string;
  /**
   * Height in px, from the embed code's `data-height`. Reserved as `min-height`
   * so the section does not collapse before GHL's script sizes the frame; the
   * frame grows past it if the form is taller.
   */
  height: number;
}

/**
 * GhlForm — a GoHighLevel form embedded as an iframe.
 *
 * GHL forms are Brik's form standard: the iframe posts from the visitor's
 * browser straight to GHL, so no Brik host handles the submission. This renders
 * the same iframe the hand-written embeds did, with a required `title`, and loads
 * GHL's `form_embed.js` once per page however many forms the page holds.
 *
 * The form's own field styling is set inside GHL — see `ghl-form-a11y.css` for
 * the baseline that clears WCAG 2.1 AA 1.4.11 / 2.4.7. The frame's `lang` and
 * `<title>` are GHL's and cannot be set from here.
 *
 * Astro twin: `content-system/blueprints/astro/GhlForm.astro`.
 *
 * @example
 * ```tsx
 * <GhlForm formId="rvGeUFEFytjrjxr7XiDE" formName="Contact Us" height={838} />
 * ```
 *
 * @summary A GoHighLevel form iframe with a required title and a reserved height
 */
export function GhlForm({ formId, formName, height, className, style, ...props }: GhlFormProps) {
  useEffect(() => {
    ensureGhlEmbedScript(document);
  }, []);

  const frameId = `inline-${formId}`;
  const name = formName.trim() || 'Form';

  return (
    <iframe
      {...props}
      className={bdsClass('bds-ghl-form', className)}
      // Runtime binding for the CSS — defining a --bds-* property, not consuming a token.
      style={{ ...style, '--bds-ghl-form-height': `${height}px` } as CSSProperties}
      src={ghlFormSrc(formId)}
      id={frameId}
      title={name}
      data-layout="{'id':'INLINE'}"
      data-trigger-type="alwaysShow"
      data-trigger-value=""
      data-activation-type="alwaysActivated"
      data-activation-value=""
      data-deactivation-type="neverDeactivate"
      data-deactivation-value=""
      data-form-name={name}
      data-height={height}
      data-layout-iframe-id={frameId}
      data-form-id={formId}
      data-cookie-consent="true"
      data-cookie-consent-provider="auto"
    />
  );
}

export default GhlForm;
