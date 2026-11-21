import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { stringifyJsxAttributes } from './lib/stringify-jsx-attributes';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // Exports each page's processed Markdown, reachable via
    // `page.data.getText('processed')`. That is what feeds /llms-full.txt and
    // the per-page /docs/**.md routes — the agent-readable surface (#2616).
    postprocess: {
      includeProcessedMarkdown: { stringify: stringifyJsxAttributes },
    },
  },
});

export default defineConfig();
