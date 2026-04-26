import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ComponentPreview } from '@/components/component-preview';
import * as BDS from '@brikdesigns/bds';

/**
 * MDX component registry. Anything exposed here is callable from any .mdx file
 * without an explicit import — the lazy escape hatch for live demos.
 *
 * Pattern: BDS components are spread under `BDS.*` so authors write
 * `<BDS.Button>...` in MDX. This keeps the component namespace explicit and
 * avoids name collisions with HTML primitives (e.g. <Card>, <Tabs>).
 */
export function getMDXComponents(extra?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    // The BDS namespace export includes hooks (useTheme) alongside components.
    // MDX's component-map type rejects that mix; cast since MDX only ever calls
    // the JSX entries (`<BDS.Button>`), never the hooks.
    BDS: BDS as unknown as MDXComponents[string],
    ...extra,
  };
}
