/**
 * POST /api/feedback → Notion Backlog.
 *
 * Docs-site sibling of the Storybook feedback function
 * (brik-bds/netlify/functions/feedback.mjs). Same Notion Backlog database,
 * tagged Product = "BDS Docs" so submissions from design.brikdesigns.com are
 * distinguishable from Storybook feedback.
 *
 * Reads NOTION_TOKEN from the brik-bds-docs Netlify site's environment.
 */

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const BACKLOG_DATABASE_ID = '32097d34-ed28-8051-8225-eb6800c2e05a';
const PRODUCT_NAME = 'BDS Docs';
const SITE_ORIGIN = 'https://design.brikdesigns.com';

const SCOPE_MAP: Record<string, string> = {
  bug: 'Critical',
  ui: 'Normal',
  suggestion: 'Low',
  question: 'Low',
};

const FEEDBACK_TYPE_MAP: Record<string, string> = {
  bug: 'Bug',
  ui: 'UI Issue',
  suggestion: 'Suggestion',
  question: 'Question',
};

const EMOJI_MAP: Record<string, string> = {
  bug: '🐛',
  ui: '🎨',
  suggestion: '💡',
  question: '❓',
};

const json = (status: number, data: unknown) =>
  Response.json(data, { status });

export async function POST(request: Request) {
  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) {
    return json(500, { error: 'NOTION_TOKEN not configured' });
  }

  let body: {
    page_url?: string;
    feedback_type?: string;
    description?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const { page_url, feedback_type, description } = body;
  if (!description) {
    return json(400, { error: 'description is required' });
  }

  const type = feedback_type ?? 'bug';
  const emoji = EMOJI_MAP[type] ?? '📝';
  const title = `${emoji} ${description.slice(0, 80)}${
    description.length > 80 ? '...' : ''
  }`;
  const pagePath = page_url ?? '';
  const url = pagePath.startsWith('http')
    ? pagePath
    : `${SITE_ORIGIN}${pagePath}`;

  try {
    const notionRes = await fetch(`${NOTION_API}/pages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notionToken}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: BACKLOG_DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: title } }] },
          Description: { rich_text: [{ text: { content: description } }] },
          Submitter: { rich_text: [{ text: { content: PRODUCT_NAME } }] },
          'Feedback Type': {
            select: { name: FEEDBACK_TYPE_MAP[type] ?? 'Bug' },
          },
          Product: { select: { name: PRODUCT_NAME } },
          Client: { select: { name: 'Brik Designs' } },
          Status: { status: { name: 'Not Started' } },
          Scope: { select: { name: SCOPE_MAP[type] ?? 'Normal' } },
          URL: { url },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.json().catch(() => ({}));
      console.error('[feedback] Notion API error:', JSON.stringify(err));
      return json(500, { error: 'Failed to submit to Notion', details: err });
    }

    const page = await notionRes.json();
    return json(200, { id: page.id, status: 'submitted' });
  } catch (err) {
    console.error('[feedback] route error:', err);
    return json(500, { error: 'Internal server error' });
  }
}
