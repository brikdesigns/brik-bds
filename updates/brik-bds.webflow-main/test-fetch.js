const https = require('https');
https.get('https://www.google.com', res => {
  console.log('statusCode:', res.statusCode);
}).on('error', e => {
  console.error(e);
}); 