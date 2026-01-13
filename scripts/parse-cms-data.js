/**
 * =============================================
 *           CMS DATA PARSER
 * =============================================
 * Parses the CMS CSV data and generates
 * JavaScript data structures for industry
 * switching functionality.
 * =============================================
 */

const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '..', 'Brik Web Templates - Home Pages.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

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

// Generate industry data structure
function generateIndustryData(cmsData) {
  const industryData = {};
  
  cmsData.forEach(row => {
    const industry = row['Industry'];
    const slug = row['Slug'];
    
    if (!industryData[industry]) {
      industryData[industry] = {
        hero: {
          title: row['Hero Title'] || '',
          description: row['Hero Description'] || ''
        },
        about: {
          title: row['Hero Description'] || '' // Using hero description for about section
        },
        services: [
          {
            title: 'Service 1',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            image: row['image 1 - location'] || ''
          },
          {
            title: 'Service 2', 
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            image: row['image 2 - location'] || ''
          },
          {
            title: 'Service 3',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            image: row['image 3 - location'] || ''
          }
        ],
        cta: {
          title: `Get started with ${industry} services today`,
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        },
        images: [
          row['image 1 - location'] || '',
          row['image 2 - location'] || '',
          row['image 3 - location'] || '',
          row['image 4 - person'] || '',
          row['image 5 - person'] || '',
          row['image 6 - person'] || ''
        ].filter(img => img) // Remove empty images
      };
    }
  });
  
  return industryData;
}

// Generate JavaScript code
function generateJavaScriptCode(industryData) {
  const jsCode = `// Auto-generated from CMS data
const industryData = ${JSON.stringify(industryData, null, 2)};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = industryData;
} else if (typeof window !== 'undefined') {
  window.industryData = industryData;
}`;

  return jsCode;
}

// Main execution
try {
  console.log('📊 Parsing CMS data...');
  const cmsData = parseCSV(csvContent);
  console.log(`✅ Parsed ${cmsData.length} CMS entries`);
  
  // Log the parsed data for debugging
  console.log('\n📋 Parsed data:');
  cmsData.forEach((row, index) => {
    console.log(`Entry ${index + 1}:`);
    console.log(`  Industry: ${row['Industry']}`);
    console.log(`  Hero Title: ${row['Hero Title']}`);
    console.log(`  Image 1: ${row['image 1 - location']}`);
  });
  
  console.log('\n🏭 Generating industry data...');
  const industryData = generateIndustryData(cmsData);
  console.log(`✅ Generated data for ${Object.keys(industryData).length} industries`);
  
  console.log('📝 Generating JavaScript code...');
  const jsCode = generateJavaScriptCode(industryData);
  
  // Write to file
  const outputPath = path.join(__dirname, '..', 'js', 'industry-data.js');
  fs.writeFileSync(outputPath, jsCode);
  console.log(`✅ Generated ${outputPath}`);
  
  // Also create a JSON file for reference
  const jsonPath = path.join(__dirname, '..', 'js', 'industry-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(industryData, null, 2));
  console.log(`✅ Generated ${jsonPath}`);
  
  console.log('🎉 CMS data parsing complete!');
  
  // Log available industries
  console.log('\n📋 Available industries:');
  Object.keys(industryData).forEach(industry => {
    console.log(`  - ${industry}`);
  });
  
} catch (error) {
  console.error('❌ Error parsing CMS data:', error);
  process.exit(1);
} 