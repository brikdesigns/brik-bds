/**
 * =============================================
 *      FIX WEBFLOW CMS INTEGRATION
 * =============================================
 * Fixes the "No items found" issue by properly
 * handling Webflow's dynamic content structure
 * =============================================
 */

const fs = require('fs');
const path = require('path');

// Read the existing CMS data
const cmsDataPath = path.join(__dirname, '..', 'js', 'cms-data.json');
const cmsData = JSON.parse(fs.readFileSync(cmsDataPath, 'utf8'));

// Enhanced content mappings that work with Webflow's structure
const webflowMappings = {
  // Hero section mappings
  hero: {
    title: [
      '.section_hero h1.text_display-xl.inverse',
      '.collection-hero-item h1.text_display-xl',
      '.hero_interior h1.text_display-sm.inverse',
      '[data-industry] h1.text_display-xl',
      '[data-industry] h1.text_display-sm'
    ],
    description: [
      '.section_hero p.text_body-xxl.inverse',
      '.collection-hero-item p.text_body-xxl',
      '.hero_interior p.text_body-lg.inverse',
      '[data-industry] p.text_body-xxl',
      '[data-industry] p.text_body-lg'
    ],
    subtitle: [
      '.hero_interior .text_body-lg.inverse',
      '.subtitle-wrapper p.text_body-lg.inverse'
    ],
    image: [
      '.section_hero .img-hero img',
      '.collection-hero-item .img',
      '[data-industry] .img-hero img'
    ]
  },
  
  // About section mappings
  about: {
    title: [
      '.section_about h2.text_heading-md',
      '.section_intro h2.text_heading-md',
      '.section_4-col p.text_heading-lg',
      '.cms_layout-wrapper p.text_heading-lg',
      '[data-industry] .text_heading-lg',
      '[data-industry] h2.text_heading-md'
    ],
    description: [
      '.section_4-col p.text_body-md.center',
      '.cms_layout-wrapper p.text_body-md.center',
      '.section_about .text_body-md',
      '[data-industry] p.text_body-md.center'
    ]
  },
  
  // Services section mappings
  services: {
    title: [
      '.section_services .text_heading-lg',
      '.services-section .text_heading-lg',
      '[data-industry] .text_heading-lg'
    ],
    description: [
      '.section_services .text_body-md',
      '.services-section .text_body-md',
      '[data-industry] .text_body-md'
    ]
  },
  
  // CTA section mappings
  cta: {
    title: [
      '.section_cta h3.text_heading-md',
      '.section_cta .text_heading-xxl.center',
      '.collection-item-cta h3',
      '[data-industry] .text_heading-xxl.center',
      '[data-industry] h3.text_heading-md'
    ],
    description: [
      '.section_cta h2.text_body-xl',
      '.section_cta .text_body-md.center.inverse',
      '.collection-item-cta h2',
      '[data-industry] h2.text_body-xl',
      '[data-industry] .text_body-md.center.inverse'
    ]
  },
  
  // Team/Staff content mappings
  team: {
    memberTitle: [
      '.text_label-md',
      '.col_1 .text_label-md',
      '[data-industry] .text_label-md'
    ],
    memberDescription: [
      '.text_body-md:not(.center):not(.inverse)',
      '.col_1 .text_body-md',
      '[data-industry] .text_body-md:not(.center)'
    ]
  },
  
  // FAQ section mappings
  faq: {
    sectionTitle: [
      '.faq_section h2.text_heading-sm.secondary.center',
      '.faq_section [data-industry] h2'
    ]
  },
  
  // Image mappings
  images: {
    hero: [
      '.section_hero .img-hero img',
      '.collection-hero-item img.img',
      '[data-industry] .img-hero img'
    ],
    teamMember: [
      '.img-frame-portrait img',
      '.col_1 img.img.height',
      '[data-industry] .img-frame-portrait img'
    ]
  }
};

// Generate the fixed CMS content system
function generateFixedCMSSystem() {
  const jsCode = `/**
 * =============================================
 *        FIXED CMS CONTENT INJECTION SYSTEM
 * =============================================
 * Properly handles Webflow's dynamic content
 * structure including w-dyn-empty sections
 * and w-dyn-bind-empty classes.
 * =============================================
 */

// CMS Data
const cmsData = ${JSON.stringify(cmsData, null, 2)};

// Webflow-compatible content mappings
const contentMappings = ${JSON.stringify(webflowMappings, null, 2)};

// Fix Webflow dynamic content structure
function fixWebflowStructure() {
  console.log('🔧 Fixing Webflow dynamic content structure...');
  
  // Hide all "No items found" messages
  const emptyMessages = document.querySelectorAll('.w-dyn-empty');
  emptyMessages.forEach(empty => {
    empty.style.display = 'none';
    console.log('✅ Hidden "No items found" message');
  });
  
  // Show all dynamic item containers
  const dynamicItems = document.querySelectorAll('.w-dyn-items');
  dynamicItems.forEach(items => {
    items.style.display = '';
    console.log('✅ Showed dynamic items container');
  });
  
  // Show all list items with data-industry attributes
  const industryItems = document.querySelectorAll('[data-industry]');
  industryItems.forEach(item => {
    item.style.display = '';
    console.log('✅ Showed industry item');
  });
}

// Enhanced content injection that works with Webflow structure
function updateTextContent(selectors, content, context = document) {
  if (!content) return;
  
  let elementsFound = 0;
  selectors.forEach(selector => {
    try {
      const elements = context.querySelectorAll(selector);
      elements.forEach(element => {
        if (element) {
          element.textContent = content;
          // Remove Webflow's empty binding class
          element.classList.remove('w-dyn-bind-empty');
          elementsFound++;
          console.log(\`✅ Updated text content: \${selector}\`);
        }
      });
    } catch (error) {
      console.warn(\`⚠️ Invalid selector: \${selector}\`, error);
    }
  });
  
  if (elementsFound === 0) {
    console.warn(\`⚠️ No elements found for selectors: \${selectors.join(', ')}\`);
  }
  
  return elementsFound;
}

function updateImageContent(selectors, imageUrl, context = document) {
  if (!imageUrl) return;
  
  let elementsFound = 0;
  selectors.forEach(selector => {
    try {
      const elements = context.querySelectorAll(selector);
      elements.forEach(element => {
        if (element) {
          if (element.tagName === 'IMG') {
            element.src = imageUrl;
            element.alt = 'Industry specific image';
            // Remove Webflow's empty binding class
            element.classList.remove('w-dyn-bind-empty');
            elementsFound++;
            console.log(\`✅ Updated image: \${selector} -> \${imageUrl}\`);
          } else {
            // Handle background images
            element.style.backgroundImage = \`url(\${imageUrl})\`;
            elementsFound++;
            console.log(\`✅ Updated background image: \${selector}\`);
          }
        }
      });
    } catch (error) {
      console.warn(\`⚠️ Invalid selector: \${selector}\`, error);
    }
  });
  
  if (elementsFound === 0) {
    console.warn(\`⚠️ No image elements found for selectors: \${selectors.join(', ')}\`);
  }
  
  return elementsFound;
}

// Main content update function with Webflow fixes
function updateIndustryContent(industry) {
  console.log(\`🎯 Updating content for industry: \${industry}\`);
  
  // First, fix the Webflow structure
  fixWebflowStructure();
  
  const data = cmsData[industry];
  if (!data) {
    console.warn(\`⚠️ No data found for industry: \${industry}\`);
    return;
  }
  
  let totalUpdates = 0;
  
  // Update hero content
  if (data.home && data.home.hero) {
    console.log('📝 Updating hero content...');
    totalUpdates += updateTextContent(contentMappings.hero.title, data.home.hero.title);
    totalUpdates += updateTextContent(contentMappings.hero.description, data.home.hero.description);
    
    // Update hero image if available
    if (data.home.images && data.home.images.location1) {
      totalUpdates += updateImageContent(contentMappings.images.hero, data.home.images.location1);
    }
  }
  
  // Update services hero content
  if (data.services && data.services.hero) {
    console.log('📝 Updating services hero content...');
    totalUpdates += updateTextContent(contentMappings.hero.title, data.services.hero.title);
    totalUpdates += updateTextContent(contentMappings.hero.description, data.services.hero.description);
    totalUpdates += updateTextContent(contentMappings.hero.subtitle, \`Services for \${industry.replace('-', ' ')}\`);
  }
  
  // Update about content
  if (data.about) {
    console.log('📝 Updating about content...');
    totalUpdates += updateTextContent(contentMappings.about.title, data.about.title);
    totalUpdates += updateTextContent(contentMappings.about.description, data.about.description);
  }
  
  // Update CTA content
  if (data.home && data.home.cta) {
    console.log('📝 Updating CTA content...');
    totalUpdates += updateTextContent(contentMappings.cta.title, data.home.cta.title);
    totalUpdates += updateTextContent(contentMappings.cta.description, data.home.cta.description);
  }
  
  // Update team member content (populate multiple team members)
  if (data.about && data.about.topics) {
    console.log('👥 Updating team member content...');
    const teamMembers = data.about.topics.slice(0, 4); // Get first 4 team members
    const memberTitleElements = document.querySelectorAll('.text_label-md');
    const memberDescriptionElements = document.querySelectorAll('.col_1 .text_body-md:not(.center)');
    const memberImages = document.querySelectorAll('.img-frame-portrait img');
    
    teamMembers.forEach((member, index) => {
      if (memberTitleElements[index]) {
        memberTitleElements[index].textContent = member.title;
        memberTitleElements[index].classList.remove('w-dyn-bind-empty');
        totalUpdates++;
      }
      if (memberDescriptionElements[index]) {
        memberDescriptionElements[index].textContent = member.description;
        memberDescriptionElements[index].classList.remove('w-dyn-bind-empty');
        totalUpdates++;
      }
      if (memberImages[index] && data.about.images && data.about.images[\`image\${index + 1}\`]) {
        memberImages[index].src = data.about.images[\`image\${index + 1}\`];
        memberImages[index].classList.remove('w-dyn-bind-empty');
        totalUpdates++;
      }
    });
  }
  
  // Update FAQ section title
  if (data.contact && data.contact.title) {
    console.log('❓ Updating FAQ section...');
    totalUpdates += updateTextContent(contentMappings.faq.sectionTitle, \`Frequently Asked Questions - \${data.contact.title}\`);
  }
  
  console.log(\`✅ Content update completed for \${industry}: \${totalUpdates} elements updated\`);
  
  // Dispatch completion event
  const updateCompleteEvent = new CustomEvent('cmsContentUpdated', {
    detail: { 
      industry: industry,
      elementsUpdated: totalUpdates,
      timestamp: new Date().toISOString()
    }
  });
  document.dispatchEvent(updateCompleteEvent);
  
  return totalUpdates;
}

// Debug function to test selectors and Webflow structure
function debugSelectors() {
  console.log('🔍 Testing CMS content selectors and Webflow structure...');
  
  // Check Webflow structure
  console.log('\\n🏗️ Webflow Structure Analysis:');
  const emptyMessages = document.querySelectorAll('.w-dyn-empty');
  const dynamicItems = document.querySelectorAll('.w-dyn-items');
  const industryItems = document.querySelectorAll('[data-industry]');
  const emptyBindings = document.querySelectorAll('.w-dyn-bind-empty');
  
  console.log(\`  - w-dyn-empty messages: \${emptyMessages.length}\`);
  console.log(\`  - w-dyn-items containers: \${dynamicItems.length}\`);
  console.log(\`  - data-industry items: \${industryItems.length}\`);
  console.log(\`  - w-dyn-bind-empty elements: \${emptyBindings.length}\`);
  
  // Test content selectors
  Object.entries(contentMappings).forEach(([section, fields]) => {
    console.log(\`\\n📋 Section: \${section}\`);
    Object.entries(fields).forEach(([field, selectors]) => {
      console.log(\`  Field: \${field}\`);
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(\`    \${selector}: \${elements.length} elements found\`);
        if (elements.length > 0) {
          elements.forEach((el, i) => {
            console.log(\`      [\${i}] \${el.tagName}.\${el.className}\`);
          });
        }
      });
    });
  });
}

// Integration with existing industry switcher
if (typeof window !== 'undefined') {
  // Make functions globally available
  window.cmsData = cmsData;
  window.updateIndustryContent = updateIndustryContent;
  window.debugSelectors = debugSelectors;
  window.contentMappings = contentMappings;
  window.fixWebflowStructure = fixWebflowStructure;
  
  // Listen for industry changes
  document.addEventListener('industryChanged', function(event) {
    const industry = event.detail.industry;
    console.log(\`🔄 Industry changed event received: \${industry}\`);
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      updateIndustryContent(industry);
    }, 100);
  });
  
  // Update content on page load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Fixed CMS Content System initialized');
    
    // Fix Webflow structure immediately
    fixWebflowStructure();
    
    // Get current industry from localStorage or default
    const currentIndustry = localStorage.getItem('brik-bds-industry') || 'dental';
    console.log(\`📍 Initial industry: \${currentIndustry}\`);
    
    // Wait for other scripts to load, then update content
    setTimeout(() => {
      updateIndustryContent(currentIndustry);
    }, 500);
  });
  
  // Debug commands
  console.log('🛠️ Fixed CMS Debug commands available:');
  console.log('  - window.debugSelectors() - Test all selectors and Webflow structure');
  console.log('  - window.fixWebflowStructure() - Fix "No items found" issues');
  console.log('  - window.updateIndustryContent("dental") - Update to specific industry');
  console.log('  - window.cmsData - View all CMS data');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cmsData,
    updateIndustryContent,
    contentMappings,
    debugSelectors,
    fixWebflowStructure
  };
}`;

  return jsCode;
}

// Main execution
try {
  console.log('🔧 Creating fixed CMS content system for Webflow...');
  
  const fixedCode = generateFixedCMSSystem();
  
  // Write the fixed file
  const outputPath = path.join(__dirname, '..', 'js', 'cms-content-system.js');
  fs.writeFileSync(outputPath, fixedCode);
  console.log(`✅ Updated ${outputPath} with Webflow fixes`);
  
  console.log('🎉 Fixed CMS content system created!');
  console.log('\n📋 Key fixes:');
  console.log('  - Hides "No items found" messages (.w-dyn-empty)');
  console.log('  - Shows dynamic content containers (.w-dyn-items)');
  console.log('  - Removes .w-dyn-bind-empty classes after populating content');
  console.log('  - Properly handles [data-industry] elements');
  console.log('  - Enhanced team member content population');
  console.log('  - Better error handling and logging');
  
} catch (error) {
  console.error('❌ Error creating fixed CMS content system:', error);
  process.exit(1);
}

module.exports = { generateFixedCMSSystem, webflowMappings }; 