/**
 * =============================================
 *    FIX WEBFLOW THEME SWITCHER DROPDOWNS
 * =============================================
 * Comprehensive fix for theme switcher issues
 * caused by missing classes and scroll wrapper
 * interference in the live Webflow site.
 * =============================================
 */

console.log('🔧 Fixing Webflow Theme Switcher Dropdowns...');

// =============================================
// 1. FIX MISSING THEME-SWITCHER-COMPONENT CLASS
// =============================================

// Find all theme switcher dropdowns and add missing class
const colorThemeSwitcher = document.getElementById('color-theme-switcher');
const industryThemeSwitcher = document.getElementById('industry-theme-switcher');

if (colorThemeSwitcher && !colorThemeSwitcher.classList.contains('theme-switcher-component')) {
  colorThemeSwitcher.classList.add('theme-switcher-component');
  console.log('✅ Added theme-switcher-component class to color theme switcher');
}

if (industryThemeSwitcher && !industryThemeSwitcher.classList.contains('theme-switcher-component')) {
  industryThemeSwitcher.classList.add('theme-switcher-component');
  console.log('✅ Added theme-switcher-component class to industry theme switcher');
}

// =============================================
// 2. FIX DROPDOWN Z-INDEX ISSUES
// =============================================

// Add CSS to fix z-index and positioning issues with scroll containers
const fixDropdownCSS = `
<style id="dropdown-fix-styles">
/* Fix dropdown z-index and positioning issues */
.w-dropdown-list {
  z-index: 9999 !important;
  position: absolute !important;
}

.w-dropdown.w--open .w-dropdown-list {
  z-index: 9999 !important;
  position: absolute !important;
  top: 100% !important;
  left: 0 !important;
  transform: none !important;
}

/* Ensure smooth wrapper doesn't interfere */
#smooth-wrapper,
#smooth-content {
  position: relative !important;
  z-index: auto !important;
}

/* Fix navbar positioning */
.navbar {
  position: relative !important;
  z-index: 1000 !important;
}

/* Ensure dropdowns appear above everything */
.theme-switcher-component .w-dropdown-list,
.button_primary-dropdown .w-dropdown-list {
  z-index: 10000 !important;
  position: absolute !important;
  background: white !important;
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  min-width: 200px !important;
}
</style>
`;

// Add the CSS if it doesn't exist
if (!document.getElementById('dropdown-fix-styles')) {
  document.head.insertAdjacentHTML('beforeend', fixDropdownCSS);
  console.log('✅ Added dropdown positioning fixes');
}

// =============================================
// 3. ENHANCED THEME SWITCHER INITIALIZATION
// =============================================

// Constants
const THEME_STORAGE_KEY = 'brik-bds-theme';
const INDUSTRY_STORAGE_KEY = 'brik-bds-industry';

const ALL_THEMES = [
  'modern-theme-1',
  'modern-theme-2', 
  'modern-theme-3',
  'modern-theme-4',
  'expressive-theme-1',
  'expressive-theme-2',
  'expressive-theme-3',
  'expressive-theme-4'
];

// Enhanced theme application function
function applyTheme(theme) {
  console.log(`🎨 Switching to theme: ${theme}`);
  
  // Remove ALL theme classes
  ALL_THEMES.forEach(t => document.body.classList.remove(t));
  document.body.classList.remove('theme-1', 'theme-2', 'theme-3', 'theme-4');
  
  // Add the new theme class
  document.body.classList.add(theme);
  
  // Force reflow
  document.body.offsetHeight;
  
  // Save to localStorage
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('⚠️ Could not save theme to localStorage:', error);
  }
  
  console.log(`✅ Applied theme: ${theme}`);
  console.log(`📋 Current body classes: ${document.body.className}`);
}

// Enhanced industry switching function
function showIndustry(industry) {
  console.log(`🏢 Switching to industry: ${industry}`);
  
  // Remove all existing filter classes
  document.body.classList.remove('filter-dental', 'filter-finance', 'filter-real-estate', 'filter-small-business', 'filter-all');
  
  // Add the new filter class
  document.body.classList.add(`filter-${industry}`);
  
  // Save to localStorage
  try {
    localStorage.setItem(INDUSTRY_STORAGE_KEY, industry);
  } catch (error) {
    console.warn('⚠️ Could not save industry to localStorage:', error);
  }
  
  console.log(`✅ Applied industry filter: ${industry}`);
}

// =============================================
// 4. ROBUST DROPDOWN INITIALIZATION
// =============================================

function initializeThemeSwitchers() {
  console.log('🔄 Initializing theme switchers...');
  
  // Find all theme switcher components with multiple selectors
  const themeSwitchers = document.querySelectorAll('.theme-switcher-component, #color-theme-switcher, #industry-theme-switcher');
  
  themeSwitchers.forEach(switcher => {
    console.log(`🔗 Processing switcher:`, switcher.id || 'unnamed');
    
    // Find theme links with multiple possible selectors
    const themeLinks = switcher.querySelectorAll('.theme-link, [data-theme], [data-industry]');
    console.log(`  Found ${themeLinks.length} theme links`);
    
    themeLinks.forEach(link => {
      // Remove existing listeners to prevent duplicates
      link.removeEventListener('click', handleThemeClick);
      
      // Add click handler
      link.addEventListener('click', handleThemeClick);
      console.log(`  ✅ Added listener to: ${link.textContent.trim()}`);
    });
  });
}

// Enhanced click handler
function handleThemeClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const theme = this.getAttribute('data-theme') || this.id;
  const industry = this.getAttribute('data-industry');
  
  console.log(`🖱️ Clicked:`, { theme, industry, element: this });
  
  if (theme && ALL_THEMES.includes(theme)) {
    applyTheme(theme);
  } else if (industry) {
    showIndustry(industry);
  } else {
    console.warn(`⚠️ Unknown selection:`, { theme, industry });
  }
  
  // Close dropdown
  const dropdown = this.closest('.w-dropdown');
  if (dropdown) {
    const toggle = dropdown.querySelector('.w-dropdown-toggle');
    if (toggle) {
      // Force close the dropdown
      setTimeout(() => {
        if (toggle.getAttribute('aria-expanded') === 'true') {
          toggle.click();
        }
      }, 100);
    }
  }
}

// =============================================
// 5. LOAD SAVED PREFERENCES
// =============================================

function loadSavedPreferences() {
  // Load saved theme
  let savedTheme = 'modern-theme-1';
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'modern-theme-1';
  } catch (error) {
    console.warn('⚠️ Could not load theme from localStorage:', error);
  }
  
  console.log(`💾 Loading saved theme: ${savedTheme}`);
  applyTheme(savedTheme);
  
  // Load saved industry
  let savedIndustry = 'all';
  try {
    savedIndustry = localStorage.getItem(INDUSTRY_STORAGE_KEY) || 'all';
  } catch (error) {
    console.warn('⚠️ Could not load industry from localStorage:', error);
  }
  
  console.log(`💾 Loading saved industry: ${savedIndustry}`);
  if (savedIndustry !== 'all') {
    showIndustry(savedIndustry);
  }
}

// =============================================
// 6. INITIALIZE EVERYTHING
// =============================================

// Wait for DOM and Webflow to be ready
function initialize() {
  console.log('🚀 Starting theme switcher initialization...');
  
  // Initialize theme switchers
  initializeThemeSwitchers();
  
  // Load saved preferences
  loadSavedPreferences();
  
  // Re-initialize after a delay to catch any Webflow dynamic content
  setTimeout(initializeThemeSwitchers, 1000);
  
  console.log('✅ Theme switcher fix complete!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Also initialize when Webflow is ready
if (window.Webflow) {
  window.Webflow.ready(initialize);
} else {
  // Fallback: try again after a delay
  setTimeout(initialize, 2000);
}

// Expose functions globally for debugging
window.fixWebflowThemes = {
  applyTheme,
  showIndustry,
  initializeThemeSwitchers,
  loadSavedPreferences
};

console.log('🎉 Webflow theme switcher fix loaded!'); 