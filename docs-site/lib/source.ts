import { docs } from '@/.source/server';
import { llms, loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

// Agent-readable surface (#2616). BDS had no hosted path an agent could read:
// the docs site served only the rendered SPA, so any agent without a local
// checkout or our MCP servers had no correct way to build on BDS.
//
// `llms()` in fumadocs-core@16 gives us the index only — it exposes
// `index`/`indexNode`, not the `page`/`full` helpers documented for later
// versions. The full text and per-page renders below are composed here from
// `getText('processed')`, which `source.config.ts` enables.
const docsLlms = llms(source);

type DocsPage = NonNullable<ReturnType<typeof source.getPage>>;

/**
 * Point every index link at its Markdown twin.
 *
 * `llms()` emits `node.url` verbatim — the rendered HTML page — so an agent
 * following a link from `/llms.txt` lands on the SPA shell, which is the exact
 * failure this feature exists to remove. The spec asks for the opposite:
 * "The links in an llms.txt file should therefore point to LLM-friendly
 * content, such as the markdown versions of pages" (https://llmstxt.org/).
 * fumadocs-core@16 exposes no URL hook (`LLMsConfig` covers name and
 * description only), so the rewrite happens here.
 */
function toMarkdownLinks(index: string): string {
  return index.replace(
    /\]\((\/docs(?:\/[^)]*)?)\)/g,
    (_match, url: string) => `](${url === '/docs' ? '/docs/index' : url}.md)`,
  );
}

/** The `/llms.txt` body — the section index, linked to Markdown. */
export function renderIndex(): string {
  return toMarkdownLinks(docsLlms.index());
}

/** One page as Markdown, titled and self-locating. */
export async function renderPage(page: DocsPage): Promise<string> {
  const body = await page.data.getText('processed');
  return `# ${page.data.title} (${page.url})\n\n${body}`;
}

/** Every page, concatenated — the `/llms-full.txt` body. */
export async function renderFull(): Promise<string> {
  const pages = source.getPages();
  const rendered = await Promise.all(pages.map((page) => renderPage(page)));
  return rendered.join('\n\n');
}
