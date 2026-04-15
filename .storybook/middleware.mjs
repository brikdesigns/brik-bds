/**
 * Storybook Express middleware — handles POST /api/feedback → Notion Backlog.
 * Reads NOTION_TOKEN from .env (already present in BDS repo).
 *
 * Uses raw Node.js res.writeHead/end since Storybook's internal server
 * may not expose the full Express response API.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

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

/** Send a JSON response using raw Node.js HTTP API */
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/** Collect raw request body and parse as JSON */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export default function feedbackMiddleware(app) {
  app.post('/api/feedback', async (req, res) => {
    const notionToken = process.env.NOTION_TOKEN;
    if (!notionToken) {
      return sendJson(res, 500, { error: 'NOTION_TOKEN not configured in .env' });
    }

    let body;
    try {
      body = await parseJsonBody(req);
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON body' });
    }

    const { page_url, feedback_type, description } = body;
    if (!description) {
      return sendJson(res, 400, { error: 'description is required' });
    }

    const type = feedback_type ?? 'bug';
    const emoji = EMOJI_MAP[type] ?? '📝';
    const title = `${emoji} ${description.slice(0, 80)}${description.length > 80 ? '...' : ''}`;

    try {
      const notionRes = await fetch(`${NOTION_API}/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionToken}`,
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
        const err = await notionRes.json();
        console.error('Notion API error:', JSON.stringify(err, null, 2));
        return sendJson(res, 500, { error: 'Failed to submit to Notion', details: err });
      }

      const page = await notionRes.json();
      return sendJson(res, 200, { id: page.id, status: 'submitted' });
    } catch (err) {
      console.error('Feedback middleware error:', err);
      return sendJson(res, 500, { error: 'Internal server error' });
    }
  });
}
