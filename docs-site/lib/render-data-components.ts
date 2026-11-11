import { isValidElement, type ReactNode } from 'react';
import type { Element as HastElement, ElementContent, Root as HastRoot } from 'hast';
import type { Nodes as MdastNodes } from 'mdast';
import { toMdast } from 'hast-util-to-mdast';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';

// A page can define its own data components (`export const Settings = …` in
// the MDX) that build tables from BDS data. The processed Markdown keeps only
// the tag, `<Settings style="Modern" />`, so the agent surface and brik-rag got
// the tag and none of the data (brik-llm#5604). This renders each such tag to
// Markdown in place.
//
// Only page-local components are rendered. They are plain functions over BDS
// data that return HTML elements. Shared MDX components (`Callout`, `Cards`,
// live previews) are left as written: their props are already flattened to
// strings in the processed text, and a preview has no text to give.

type Component = (props: Record<string, unknown>) => ReactNode;

const FRAGMENT = Symbol.for('react.fragment');

/** The page's exported function components, by name. */
function pageComponents(exports: Record<string, unknown> | undefined): Map<string, Component> {
  const found = new Map<string, Component>();
  for (const [name, value] of Object.entries(exports ?? {})) {
    if (/^[A-Z]/.test(name) && typeof value === 'function') found.set(name, value as Component);
  }
  return found;
}

/** Walk a React element tree into hast, calling function components on the way. */
function toHast(node: ReactNode): ElementContent[] {
  if (node === null || node === undefined || typeof node === 'boolean') return [];
  if (typeof node === 'string' || typeof node === 'number') {
    return [{ type: 'text', value: String(node) }];
  }
  if (Array.isArray(node)) return node.flatMap(toHast);
  if (!isValidElement(node)) {
    throw new Error(`cannot render ${typeof node} to Markdown`);
  }
  const { children, ...props } = node.props as Record<string, unknown> & { children?: ReactNode };
  if ((node.type as unknown) === FRAGMENT) return toHast(children);
  if (typeof node.type === 'function') {
    return toHast((node.type as Component)(node.props as Record<string, unknown>));
  }
  if (typeof node.type !== 'string') {
    throw new Error('cannot render a non-function component to Markdown');
  }
  const element: HastElement = {
    type: 'element',
    tagName: node.type,
    properties: typeof props.href === 'string' ? { href: props.href } : {},
    children: toHast(children),
  };
  return [element];
}

/** String-valued attributes only — the processed text has already flattened expressions. */
function stringProps(attributes: unknown[]): Record<string, unknown> | null {
  const props: Record<string, unknown> = {};
  for (const attribute of attributes as { type: string; name?: string; value?: unknown }[]) {
    if (attribute.type !== 'mdxJsxAttribute' || typeof attribute.name !== 'string') return null;
    if (attribute.value !== null && typeof attribute.value !== 'string') return null;
    props[attribute.name] = attribute.value ?? true;
  }
  return props;
}

/**
 * Replace each page-local data component tag in `markdown` with its rendered
 * Markdown. Text outside those tags is returned byte for byte.
 */
export function renderDataComponents(
  markdown: string,
  exports: Record<string, unknown> | undefined,
): string {
  const components = pageComponents(exports);
  if (components.size === 0) return markdown;

  const tree = remark().use(remarkMdx).use(remarkGfm).parse(markdown);
  const edits: { start: number; end: number; text: string }[] = [];
  for (const node of tree.children) {
    if (node.type !== 'mdxJsxFlowElement' || !node.name) continue;
    const component = components.get(node.name);
    const props = stringProps(node.attributes);
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (!component || !props || start === undefined || end === undefined) continue;

    const hast: HastRoot = { type: 'root', children: toHast(component(props)) };
    const text = toMarkdown(toMdast(hast) as MdastNodes, {
      // No column padding: aligned pipes add hundreds of spaces per row, which
      // an agent reads and brik-rag embeds as noise.
      extensions: [gfmToMarkdown({ tablePipeAlign: false })],
    });
    edits.push({ start, end, text: text.trimEnd() });
  }

  let out = markdown;
  for (const { start, end, text } of edits.reverse()) {
    out = out.slice(0, start) + text + out.slice(end);
  }
  return out;
}
