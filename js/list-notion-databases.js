const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function listDatabases() {
  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'database' },
      page_size: 100,
    });
    if (response.results.length === 0) {
      console.log('No databases found.');
      return;
    }
    console.log('Notion Databases:');
    response.results.forEach((db) => {
      const title = db.title && db.title[0] ? db.title[0].plain_text : '(Untitled)';
      console.log(`- ${title} (ID: ${db.id})`);
    });
  } catch (error) {
    console.error('Error fetching databases:', error.body || error.message || error);
  }
}

listDatabases(); 