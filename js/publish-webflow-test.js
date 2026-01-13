const axios = require('axios');

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

async function getSite() {
  try {
    const siteRes = await api.get(`/sites/${SITE_ID}`);
    console.log('Site data:', siteRes.data);
  } catch (err) {
    console.error('Failed to fetch site:', err.response ? err.response.data : err.message);
    if (err.response) {
      console.error('Full error response:', err.response);
    } else {
      console.error('Full error object:', err);
    }
    process.exit(1);
  }
}

getSite(); 