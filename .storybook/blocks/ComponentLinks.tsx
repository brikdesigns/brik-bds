/**
 * ComponentLinks — triple-link header for component MDX pages.
 *
 * Per ADR-007, every component page renders this block immediately after the
 * H1. It connects the Storybook page (live demos + props) to its narrative
 * counterpart on design.brikdesigns.com (when-to-use, anatomy, accessibility),
 * mirroring Carbon's `Source code | Usage guidelines | Accessibility` pattern.
 *
 * Usage in MDX:
 *
 *   import { ComponentLinks } from '../../../.storybook/blocks/ComponentLinks';
 *   <ComponentLinks slug="button" />
 *
 * The component name for the GitHub source link is derived from `slug` by
 * converting kebab-case to PascalCase (e.g. "addable-entry-list" →
 * "AddableEntryList"). Override with `name` if the directory name differs.
 */

interface ComponentLinksProps {
  /** docs-site slug in kebab-case. Required. e.g. "button", "catalog-picker". */
  slug: string;
  /** PascalCase directory name under components/ui/. Defaults to slug-derived. */
  name?: string;
}

const REPO_BASE =
  'https://github.com/brikdesigns/brik-bds/tree/main/components/ui';
const DOCS_BASE = 'https://design.brikdesigns.com/docs/components';

function kebabToPascal(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function ComponentLinks({ slug, name }: ComponentLinksProps) {
  const directory = name ?? kebabToPascal(slug);
  return (
    <p className="sb-component-links">
      <a
        href={`${REPO_BASE}/${directory}`}
        target="_blank"
        rel="noreferrer"
      >
        Source code
      </a>
      <span className="sb-component-links__sep" aria-hidden="true">
        {' | '}
      </span>
      <a href={`${DOCS_BASE}/${slug}`} target="_blank" rel="noreferrer">
        Usage guidelines
      </a>
      <span className="sb-component-links__sep" aria-hidden="true">
        {' | '}
      </span>
      <a
        href={`${DOCS_BASE}/${slug}#accessibility`}
        target="_blank"
        rel="noreferrer"
      >
        Accessibility
      </a>
    </p>
  );
}
