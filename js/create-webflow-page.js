const axios = require('axios');

// Webflow API credentials
const API_TOKEN = 'b467581adea84a392f5fb62909ba880e48649eadaab59108a1bc2df7beb496ab';
const SITE_ID = '67c4e62250923072710d472c';

const api = axios.create({
  baseURL: 'https://api.webflow.com/v2',
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

async function createPage() {
  try {
    // Create a new static page named "TEST 44"
    const pageData = {
      slug: 'test-44',
      title: 'TEST 44',
      isFolder: false,
      isDraft: false,
      isArchived: false,
      seo: {
        title: 'TEST 44',
        description: 'Test page 44'
      }
    };

    console.log('Creating page with data:', pageData);

    const response = await api.post(`/sites/${SITE_ID}/pages`, pageData);
    console.log('Page created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err) {
    console.error('Failed to create page:', err.response ? err.response.data : err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Full error response:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

createPage();
