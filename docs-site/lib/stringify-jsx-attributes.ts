import type { LLMsOptions } from 'fumadocs-core/mdx-plugins/remark-llms';

type Stringify = NonNullable<LLMsOptions['stringify']>;

// fumadocs-mdx@14.3.1 flattens a `code={`…`}` expression into a string
// attribute, and mdast-util-mdx-jsx then entity-escapes its double quotes, so
// every sample an agent lifts from the Markdown export is wrong (#2619). For an
// element carrying an expression attribute or a quoted string value, write the
// tag out ourselves with the expression kept as authored.
//
// Elements that need none of that return undefined and take the default path,
// which keeps `renderDataComponents` reading plain string props.

type Attribute = { type: string; name?: string; value?: unknown };

function needsOwnSerializer(attributes: Attribute[]): boolean {
  return attributes.some((attribute) => {
    if (attribute.type === 'mdxJsxExpressionAttribute') return true;
    const { value } = attribute;
    if (typeof value === 'string') return value.includes('"');
    return value !== null && value !== undefined;
  });
}

function serializeAttribute(attribute: Attribute): string {
  const { name, value } = attribute;
  if (attribute.type === 'mdxJsxExpressionAttribute') return `{${String(value)}}`;
  if (value === null || value === undefined) return String(name);
  if (typeof value === 'string') {
    // JSX string attributes have no escape for `"`; an expression is the only
    // way to keep one.
    return value.includes('"') ? `${name}={${JSON.stringify(value)}}` : `${name}="${value}"`;
  }
  return `${name}={${String((value as { value: unknown }).value)}}`;
}

export const stringifyJsxAttributes: Stringify = (node, _parent, state, info) => {
  if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return undefined;
  const attributes = node.attributes as Attribute[];
  if (!needsOwnSerializer(attributes)) return undefined;

  const name = node.name ?? '';
  const open = [name, ...attributes.map(serializeAttribute)].join(' ');
  if (node.children.length === 0) return `<${open} />`;
  const children =
    node.type === 'mdxJsxFlowElement'
      ? state.containerFlow(node, info)
      : state.containerPhrasing(node, info);
  return node.type === 'mdxJsxFlowElement'
    ? `<${open}>\n${children}\n</${name}>`
    : `<${open}>${children}</${name}>`;
};
