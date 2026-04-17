/**
 * Netlify Function — POST /api/feedback → Notion Backlog.
 *
 * Mirrors .storybook/middleware.mjs for the deployed static Storybook.
 * Reads NOTION_TOKEN from the Netlify site's environment variables.
 */

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const BACKLOG_DATABASE_ID = '32097d34-ed28-8051-8225-eb6800c2e05a';
const PRODUCT_NAME = 'BDS Storybook';

const SCOPE_MAP = {
  bug: 'Critical',
  ui: 'Normal',
  suggestion: 'Low',
  question: 'Low',
};

const FEEDBACK_TYPE_MAP = {
  bug: 'Bug',
  ui: 'UI Issue',
  suggestion: 'Suggestion',
  question: 'Question',
};

const EMOJI_MAP = {
  bug: '🐛',
  ui: '🎨',
  suggestion: '💡',
  question: '❓',
};

const jsonResponse = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const notionToken = Netlify.env.get('NOTION_TOKEN');
  if (!notionToken) {
    return jsonResponse(500, { error: 'NOTION_TOKEN not configured' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const { page_url, feedback_type, description } = body;
  if (!description) {
    return jsonResponse(400, { error: 'description is required' });
  }

  const type = feedback_type ?? 'bug';
  const emoji = EMOJI_MAP[type] ?? '📝';
  const title = `${emoji} ${description.slice(0, 80)}${description.length > 80 ? '...' : ''}`;

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
          Submitter: { rich_text: [{ text: { content: 'BDS Storybook' } }] },
          'Feedback Type': { select: { name: FEEDBACK_TYPE_MAP[type] ?? 'Bug' } },
          Product: { select: { name: PRODUCT_NAME } },
          Client: { select: { name: 'Brik Designs' } },
          Status: { status: { name: 'Not Started' } },
          Scope: { select: { name: SCOPE_MAP[type] ?? 'Normal' } },
          URL: { url: `https://storybook.brikdesigns.com/?path=/story/${page_url ?? ''}` },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.json().catch(() => ({}));
      console.error('[feedback] Notion API error:', JSON.stringify(err));
      return jsonResponse(500, { error: 'Failed to submit to Notion', details: err });
    }

    const page = await notionRes.json();
    return jsonResponse(200, { id: page.id, status: 'submitted' });
  } catch (err) {
    console.error('[feedback] function error:', err);
    return jsonResponse(500, { error: 'Internal server error' });
  }
};

export const config = {
  path: '/api/feedback',
};
