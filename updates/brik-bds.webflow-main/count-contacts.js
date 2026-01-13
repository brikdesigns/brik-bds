const { Client } = require('@notionhq/client');

const notion = new Client({ auth: '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' });
const databaseId = '1a097d34-ed28-8157-8778-ea3017a052cd';

async function countContacts() {
  let hasMore = true;
  let startCursor = undefined;
  let total = 0;
  let active = 0;
  let inactive = 0;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
    });
    response.results.forEach(page => {
      total++;
      const statusProp = page.properties['Status'];
      let status = '';
      if (statusProp && statusProp.select && statusProp.select.name) {
        status = statusProp.select.name;
      }
      if (status.toLowerCase() === 'active') active++;
      else if (status.toLowerCase() === 'inactive') inactive++;
    });
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  console.log(`Total contacts: ${total}`);
  console.log(`Active contacts: ${active}`);
  console.log(`Inactive contacts: ${inactive}`);
}

countContacts().catch(e => {
  console.error('Error:', e.body || e.message || e);
}); 