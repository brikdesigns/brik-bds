const https = require('https');
https.get('https://mcp.notion.com/sse', res => {
  console.log('statusCode:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
}).on('error', e => {
  console.error('ERROR:', e);
}); 