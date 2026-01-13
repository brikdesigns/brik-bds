const axios = require('axios');

// Hardcoded credentials (for testing only)
const API_TOKEN = 'b467581adea84a392f5fb62909ba880e48649eadaab59108a1bc2df7beb496ab';
const SITE_ID = '67c4e62250923072710d472c';

const api = axios.create({
  baseURL: 'https://api.webflow.com',
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    'accept-version': '1.0.0',
    'Content-Type': 'application/json',
  },
});

async function publishSite() {
  try {
    // 1. Get the list of domains for the site
    const siteRes = await api.get(`/sites/${SITE_ID}`);
    console.log('Site data:', siteRes.data); // Debug: see what domains are returned
    const domains = siteRes.data.domains.map(d => d.name);

    if (!domains.length) {
      console.error('No domains found for this site.');
      process.exit(1);
    }

    // 2. Publish to all domains
    const publishRes = await api.post(`/sites/${SITE_ID}/publish`, { domains });
    console.log('Site published:', publishRes.data);
  } catch (err) {
    console.error('Failed to publish:', err.response ? err.response.data : err.message);
    if (err.response) {
      console.error('Full error response:', err.response);
    } else {
      console.error('Full error object:', err);
    }
    process.exit(1);
  }
}

publishSite(); 