/**
 * =============================================
 *        ENHANCED CMS DATA PARSER
 * =============================================
 * Parses all CMS CSV files and generates
 * comprehensive JavaScript data structures
 * for dynamic content injection.
 * =============================================
 */

const fs = require('fs');
const path = require('path');

// CSV file mappings
const CSV_FILES = {
  home: 'Brik Web Templates [Demo] - Home Pages.csv',
  about: 'Brik Web Templates [Demo] - About Pages.csv',
  services: 'Brik Web Templates [Demo] - Services Pages.csv',
  contact: 'Brik Web Templates [Demo] - Contact Pages.csv',
  audience: 'Brik Web Templates [Demo] - Audience Pages.csv'
};

// Parse CSV content with proper quote handling
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = parseCSVLine(lines[0]);
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return data;
}

// Parse a single CSV line, handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

// Load and parse all CSV files
function loadAllCMSData() {
  const allData = {};
  
  Object.entries(CSV_FILES).forEach(([pageType, filename]) => {
    const csvPath = path.join(__dirname, '..', 'cms', filename);
    
    try {
      console.log(`📊 Loading ${pageType} data from ${filename}...`);
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const parsedData = parseCSV(csvContent);
      allData[pageType] = parsedData;
      console.log(`✅ Loaded ${parsedData.length} ${pageType} entries`);
    } catch (error) {
      console.warn(`⚠️ Could not load ${filename}:`, error.message);
      allData[pageType] = [];
    }
  });
  
  return allData;
}

// Generate comprehensive industry data structure
function generateComprehensiveIndustryData(allData) {
  const industryData = {};
  
  // Initialize industries from home page data
  if (allData.home) {
    allData.home.forEach(row => {
      const industry = row['Industry'];
      if (!industryData[industry]) {
        industryData[industry] = {
          slug: row['Slug'],
          name: row['Name'],
          home: {},
          about: {},
          services: {},
          contact: {},
          audience: {}
        };
      }
    });
  }
  
  // Process each page type
  Object.entries(allData).forEach(([pageType, data]) => {
    data.forEach(row => {
      const industry = row['Industry'];
      if (!industryData[industry]) return;
      
      switch (pageType) {
        case 'home':
          industryData[industry].home = {
            hero: {
              title: row['Hero Title'] || '',
              description: row['Hero Description'] || ''
            },
            images: {
              location1: row['image 1 - location'] || '',
              location2: row['image 2 - location'] || '',
              location3: row['image 3 - location'] || '',
              person1: row['image 4 - person'] || '',
              person2: row['image 5 - person'] || '',
              person3: row['image 6 - person'] || ''
            },
            cta: {
              title: `Get started with ${industry} services today`,
              description: row['Hero Description'] || ''
            }
          };
          break;
          
        case 'about':
          industryData[industry].about = {
            title: row['Title'] || '',
            description: row['Description'] || '',
            images: {
              image1: row['Image 1'] || '',
              image2: row['Image 2'] || '',
              image3: row['Image 3'] || '',
              image4: row['Image 4'] || '',
              image5: row['Image 5'] || ''
            },
            topics: [
              {
                title: row['Topic 1 Title'] || '',
                description: row['Topic 1 Description'] || ''
              },
              {
                title: row['Topic 2 Title'] || '',
                description: row['Topic 2 Description'] || ''
              },
              {
                title: row['Topic 3 Title'] || '',
                description: row['Topic 3 Description'] || ''
              },
              {
                title: row['Topic 4 Title'] || '',
                description: row['Topic 4 Description'] || ''
              }
            ]
          };
          break;
          
        case 'services':
          industryData[industry].services = {
            hero: {
              title: row['Hero Title'] || '',
              description: row['Hero Description'] || ''
            },
            images: {
              image1: row['Image 1'] || '',
              image2: row['Image 2'] || '',
              image3: row['Image 3'] || ''
            },
            serviceList: [
              {
                title: row['Service 1 Title'] || '',
                description: row['Service 1 Description'] || ''
              },
              {
                title: row['Service 2 Title'] || '',
                description: row['Service 2 Description'] || ''
              },
              {
                title: row['Service 3 Title'] || '',
                description: row['Service 3 Description'] || ''
              },
              {
                title: row['Service 4 Title'] || '',
                description: row['Service 4 Description'] || ''
              }
            ]
          };
          break;
          
        case 'contact':
          // Add contact page data structure when CSV is available
          industryData[industry].contact = {
            // Will be populated when contact CSV structure is known
          };
          break;
          
        case 'audience':
          // Add audience page data structure when CSV is available
          industryData[industry].audience = {
            // Will be populated when audience CSV structure is known
          };
          break;
      }
    });
  });
  
  return industryData;
}

// Generate content mapping for dynamic injection
function generateContentMappings(industryData) {
  const mappings = {
    // Hero section mappings
    hero: {
      title: [
        'h1.text_display-xl',
        '.text_display-xl',
        '[data-cms-field="hero-title"]'
      ],
      description: [
        'p.text_body-xxl',
        '.text_body-xxl',
        '[data-cms-field="hero-description"]'
      ]
    },
    
    // About section mappings
    about: {
      title: [
        '.text_heading-lg',
        'h2.text_heading-md',
        '[data-cms-field="about-title"]'
      ],
      description: [
        'p.text_body-md.center',
        '.text_body-lg.center',
        '[data-cms-field="about-description"]'
      ]
    },
    
    // Services section mappings
    services: {
      title: [
        '.text_heading-lg',
        '[data-cms-field="services-title"]'
      ],
      description: [
        '.text_body-md',
        '[data-cms-field="services-description"]'
      ]
    },
    
    // CTA section mappings
    cta: {
      title: [
        'h3.text_heading-md',
        '.text_heading-xxl.center',
        '[data-cms-field="cta-title"]'
      ],
      description: [
        'h2.text_body-xl',
        '.text_body-md.center.inverse',
        '[data-cms-field="cta-description"]'
      ]
    },
    
    // Image mappings
    images: {
      hero: [
        '.img-hero img',
        '[data-cms-field="hero-image"]'
      ],
      location1: [
        '[data-cms-image="location-1"]',
        '.img[data-industry-image]'
      ],
      location2: [
        '[data-cms-image="location-2"]'
      ],
      location3: [
        '[data-cms-image="location-3"]'
      ],
      person1: [
        '[data-cms-image="person-1"]'
      ],
      person2: [
        '[data-cms-image="person-2"]'
      ],
      person3: [
        '[data-cms-image="person-3"]'
      ]
    }
  };
  
  return mappings;
}

// Generate JavaScript code for content injection
function generateContentInjectionCode(industryData, mappings) {
  const jsCode = `/**
 * =============================================
 *        CMS CONTENT INJECTION SYSTEM
 * =============================================
 * Auto-generated from CMS data
 * Handles dynamic content updates based on
 * industry selection.
 * =============================================
 */

// CMS Data
const cmsData = ${JSON.stringify(industryData, null, 2)};

// Content mappings for dynamic injection
const contentMappings = ${JSON.stringify(mappings, null, 2)};

// Content injection functions
function updateTextContent(selectors, content, context = document) {
  if (!content) return;
  
  selectors.forEach(selector => {
    const elements = context.querySelectorAll(selector);
    elements.forEach(element => {
      if (element) {
        element.textContent = content;
      }
    });
  });
}

function updateImageContent(selectors, imageUrl, context = document) {
  if (!imageUrl) return;
  
  selectors.forEach(selector => {
    const elements = context.querySelectorAll(selector);
    elements.forEach(element => {
      if (element) {
        if (element.tagName === 'IMG') {
          element.src = imageUrl;
        } else {
          // Handle background images
          element.style.backgroundImage = \`url(\${imageUrl})\`;
        }
      }
    });
  });
}

// Main content update function
function updateIndustryContent(industry) {
  console.log(\`🎯 Updating content for industry: \${industry}\`);
  
  const data = cmsData[industry];
  if (!data) {
    console.warn(\`⚠️ No data found for industry: \${industry}\`);
    return;
  }
  
  // Update hero content
  if (data.home && data.home.hero) {
    updateTextContent(contentMappings.hero.title, data.home.hero.title);
    updateTextContent(contentMappings.hero.description, data.home.hero.description);
  }
  
  // Update about content
  if (data.about) {
    updateTextContent(contentMappings.about.title, data.about.title);
    updateTextContent(contentMappings.about.description, data.about.description);
  }
  
  // Update services content
  if (data.services && data.services.hero) {
    updateTextContent(contentMappings.services.title, data.services.hero.title);
    updateTextContent(contentMappings.services.description, data.services.hero.description);
  }
  
  // Update CTA content
  if (data.home && data.home.cta) {
    updateTextContent(contentMappings.cta.title, data.home.cta.title);
    updateTextContent(contentMappings.cta.description, data.home.cta.description);
  }
  
  // Update images
  if (data.home && data.home.images) {
    Object.entries(data.home.images).forEach(([key, imageUrl]) => {
      if (contentMappings.images[key] && imageUrl) {
        updateImageContent(contentMappings.images[key], imageUrl);
      }
    });
  }
  
  // Update about page images
  if (data.about && data.about.images) {
    Object.entries(data.about.images).forEach(([key, imageUrl]) => {
      if (contentMappings.images[key] && imageUrl) {
        updateImageContent(contentMappings.images[key], imageUrl);
      }
    });
  }
  
  // Update services page images
  if (data.services && data.services.images) {
    Object.entries(data.services.images).forEach(([key, imageUrl]) => {
      if (contentMappings.images[key] && imageUrl) {
        updateImageContent(contentMappings.images[key], imageUrl);
      }
    });
  }
  
  console.log(\`✅ Content updated for \${industry}\`);
}

// Integration with existing industry switcher
if (typeof window !== 'undefined') {
  // Make functions globally available
  window.cmsData = cmsData;
  window.updateIndustryContent = updateIndustryContent;
  
  // Listen for industry changes
  document.addEventListener('industryChanged', function(event) {
    const industry = event.detail.industry;
    updateIndustryContent(industry);
  });
  
  // Update content on page load
  document.addEventListener('DOMContentLoaded', function() {
    // Get current industry from localStorage or default
    const currentIndustry = localStorage.getItem('brik-bds-industry') || 'dental';
    updateIndustryContent(currentIndustry);
  });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cmsData,
    updateIndustryContent,
    contentMappings
  };
}`;

  return jsCode;
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting enhanced CMS data parsing...');
    
    // Load all CSV data
    const allData = loadAllCMSData();
    
    // Generate comprehensive industry data
    console.log('🏭 Generating comprehensive industry data...');
    const industryData = generateComprehensiveIndustryData(allData);
    console.log(`✅ Generated data for ${Object.keys(industryData).length} industries`);
    
    // Generate content mappings
    console.log('🗺️ Generating content mappings...');
    const mappings = generateContentMappings(industryData);
    
    // Generate content injection code
    console.log('📝 Generating content injection JavaScript...');
    const jsCode = generateContentInjectionCode(industryData, mappings);
    
    // Write files
    const outputPath = path.join(__dirname, '..', 'js', 'cms-content-system.js');
    fs.writeFileSync(outputPath, jsCode);
    console.log(`✅ Generated ${outputPath}`);
    
    // Also create a JSON file for reference
    const jsonPath = path.join(__dirname, '..', 'js', 'cms-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(industryData, null, 2));
    console.log(`✅ Generated ${jsonPath}`);
    
    // Update existing industry-data.js for backward compatibility
    const legacyPath = path.join(__dirname, '..', 'js', 'industry-data.js');
    const legacyCode = `// Auto-generated from CMS data (legacy format)
const industryData = ${JSON.stringify(industryData, null, 2)};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = industryData;
} else if (typeof window !== 'undefined') {
  window.industryData = industryData;
}`;
    fs.writeFileSync(legacyPath, legacyCode);
    console.log(`✅ Updated ${legacyPath}`);
    
    console.log('🎉 Enhanced CMS data parsing complete!');
    
    // Log summary
    console.log('\n📋 Available industries and pages:');
    Object.entries(industryData).forEach(([industry, data]) => {
      console.log(`  ${industry}:`);
      console.log(`    - Home: ${data.home.hero?.title ? '✅' : '❌'}`);
      console.log(`    - About: ${data.about.title ? '✅' : '❌'}`);
      console.log(`    - Services: ${data.services.hero?.title ? '✅' : '❌'}`);
      console.log(`    - Images: ${Object.values(data.home.images || {}).filter(img => img).length} images`);
    });
    
  } catch (error) {
    console.error('❌ Error in enhanced CMS parsing:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  loadAllCMSData,
  generateComprehensiveIndustryData,
  generateContentMappings,
  generateContentInjectionCode
}; 