/**
 * BlueprintFallback (React) — renders when BlueprintDispatcher
 * encounters a `visualNotes.blueprintKey` that is not in
 * BLUEPRINT_REGISTRY. Mirrors `../astro/BlueprintFallback.astro`:
 * a loud visible stub with a CI-greppable
 * `data-blueprint-unknown-key` attribute.
 *
 * Zero-sized or silent fallbacks defeat the whole point of the
 * scaffold-task preflight — see the Astro twin for the full
 * rationale.
 *
 * Contract: BlueprintProps (same shape as every renderer). Reads
 * `section.visualNotes.blueprintKey` to report what was unmatched.
 */
import type { BlueprintProps } from '../astro/types';
import './BlueprintFallback.css';

interface Props extends BlueprintProps {}

export function BlueprintFallback({ section }: Props) {
  const unknownKey = section.visualNotes?.blueprintKey ?? null;
  const attrValue = unknownKey ?? '__null__';

  return (
    <section
      className="bp-fallback"
      data-blueprint-key="__fallback__"
      data-blueprint-unknown-key={attrValue}
      aria-label="Blueprint not yet shipped"
    >
      <div className="bp-fallback__container">
        <p className="bp-fallback__label">Blueprint not yet shipped</p>
        <p className="bp-fallback__key">
          Key:{' '}
          <code>{unknownKey ?? '(none — section has no blueprintKey)'}</code>
        </p>
        <p className="bp-fallback__meta">
          Section: <code>{section.sectionKey}</code> · Type:{' '}
          <code>{section.sectionType}</code>
        </p>
        <p className="bp-fallback__hint">
          CI will block publish on any client repo whose built{' '}
          <code>dist/</code> contains{' '}
          <code>data-blueprint-unknown-key=</code>. Add a renderer for
          this key in <code>@brikdesigns/bds</code> and bump the
          package version, or remove the key from the content.
        </p>
      </div>
    </section>
  );
}

export default BlueprintFallback;
