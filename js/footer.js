/**
 * =============================================
 *           BRIK BDS THEME SYSTEM
 * =============================================
 * Unified theme and industry switching system
 * for Webflow integration with localStorage
 * persistence and CMS content mapping.
 * =============================================
 */

// =============================================
// CONFIGURATION & CONSTANTS
// =============================================

const CONFIG = {
  THEME_STORAGE_KEY: 'brik-bds-theme',
  INDUSTRY_STORAGE_KEY: 'brik-bds-industry',
  
  // Theme mapping: picker ID → CSS class
  THEME_MAPPING: {
    'modern-theme-1': 'theme-1',
    'modern-theme-2': 'theme-2', 
    'modern-theme-3': 'theme-3',
    'modern-theme-4': 'theme-4',
    'expressive-theme-1': 'theme-5',
    'expressive-theme-2': 'theme-6',
    'expressive-theme-3': 'theme-7',
    'expressive-theme-4': 'theme-8'
  },
  
  DEFAULT_THEME: 'modern-theme-1',
  DEFAULT_INDUSTRY: 'dental',
  
  INDUSTRIES: ['dental', 'finance', 'real-estate', 'small-business']
};

// Derived constants
const ALL_THEME_IDS = Object.keys(CONFIG.THEME_MAPPING);
const ALL_THEME_CLASSES = Object.values(CONFIG.THEME_MAPPING);

// =============================================
// WEBFLOW INTERACTION COMPATIBILITY
// =============================================

/**
 * Checks if a click should be handled by our JavaScript or allowed to proceed to Webflow
 * This preserves Webflow interactions while maintaining our theme functionality
 * @param {Element} element - Clicked element
 * @returns {boolean} True if we should handle it, false if Webflow should handle it
 */
function shouldHandleClick(element) {
  // Handle theme and industry switcher clicks
  if (element.classList.contains('theme-link') || 
      element.hasAttribute('data-theme') || 
      element.hasAttribute('data-industry')) {
    return true;
  }
  
  // Handle clicks within theme/industry switcher components
  const themeSwitcher = element.closest('.theme-switcher-component, #color-theme-switcher, #industry-theme-switcher');
  if (themeSwitcher) {
    return true;
  }
  
  // Let Webflow handle all other navigation clicks (preserves loading interactions)
  return false;
}

/**
 * Checks if an element is a navigation link that should trigger loading overlay
 * @param {Element} element - Clicked element
 * @returns {boolean} True if it's a navigation link
 */
function isNavigationLink(element) {
  // Check if it's a direct link with href
  if (element.tagName === 'A' && element.href && 
      element.href !== window.location.href && 
      !element.href.startsWith('mailto:') && 
      !element.href.startsWith('tel:') &&
      !element.href.startsWith('#')) {
    return true;
  }
  
  // Check if it's inside a navigation area
  const navParent = element.closest('nav, .navbar, .navigation, .nav-menu, [class*="nav"]');
  if (navParent && element.tagName === 'A') {
    return true;
  }
  
  // Check for common navigation classes
  if (element.classList.contains('nav-link') || 
      element.classList.contains('menu-link') ||
      element.closest('.nav-link, .menu-link')) {
    return true;
  }
  
  return false;
}

/**
 * Programmatically trigger the Webflow loading overlay to ensure it appears
 * This ensures the loading animation shows every time, not just when Webflow detects it
 */
function triggerLoadingOverlay() {
  // Look for existing Webflow loading interactions
  const loadingElements = document.querySelectorAll('[data-w-id], [class*="loading"]');
  
  // Try to find and trigger Webflow interactions programmatically
  loadingElements.forEach(element => {
    const wId = element.getAttribute('data-w-id');
    if (wId) {
      console.log(`🎭 Attempting to trigger loading interaction: ${wId}`);
      
      // Try to trigger Webflow interaction
      if (window.Webflow && window.Webflow.push) {
        try {
          // Trigger the interaction
          element.style.display = 'flex';
          element.style.opacity = '1';
          element.style.visibility = 'visible';
          console.log(`✅ Loading overlay triggered programmatically`);
        } catch (error) {
          console.log(`⚠️ Could not trigger Webflow interaction:`, error);
        }
      }
    }
  });
  
  // Backup: Create our own loading overlay if none exists or works
  if (!document.querySelector('.loading-overlay-backup')) {
    createBackupLoadingOverlay();
  } else {
    showBackupLoadingOverlay();
  }
}

/**
 * Create a backup loading overlay to ensure consistent coverage
 * This shows when Webflow's native loading doesn't trigger
 */
function createBackupLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay-backup';
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: white !important;
    z-index: 99999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    opacity: 0 !important;
    transition: opacity 0.3s ease-in-out !important;
  `;
  
  overlay.innerHTML = `
    <div style="text-align: center;">
      <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid var(--_color---theme--primary, #4665f5); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
      <p style="color: var(--_color---text--primary, #333); font-family: var(--_typography---font-family--body, sans-serif); margin: 0;">Loading...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  document.body.appendChild(overlay);
  
  // Fade in the overlay
  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 10);
  
  console.log(`🛡️ Backup loading overlay created`);
}

/**
 * Show the backup loading overlay
 */
function showBackupLoadingOverlay() {
  const overlay = document.querySelector('.loading-overlay-backup');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    console.log(`🛡️ Backup loading overlay shown`);
  }
}

/**
 * Enhanced click handler that preserves Webflow interactions and ensures loading overlay
 * @param {Event} e - Click event
 */
function handleSmartClick(e) {
  const element = e.target;
  
  // Only prevent default for our theme/industry switcher links
  if (shouldHandleClick(element)) {
    e.preventDefault();
    e.stopPropagation();
    
    const themePickerId = element.id;
    const industry = element.getAttribute('data-industry') || element.id;
    
    console.log(`🖱️ Handling click: ${themePickerId || industry}`);
    
    // Handle theme switching
    if (ALL_THEME_IDS.includes(themePickerId)) {
      applyTheme(themePickerId);
      closeWebflowDropdown(element);
    }
    // Handle industry switching
    else if (CONFIG.INDUSTRIES.includes(industry)) {
      applyIndustry(industry);
      closeWebflowDropdown(element);
    }
  }
  // For navigation links, ensure loading overlay appears and apply state immediately
  else if (isNavigationLink(element)) {
    console.log(`🔄 Navigation click detected: ${element.href || element.textContent}`);
    
    // Apply current state immediately before navigation
    applyImmediateState();
    
    // Trigger loading overlay programmatically to ensure it shows
    triggerLoadingOverlay();
    
    // Let Webflow handle the navigation naturally (don't prevent default)
  }
  
  // For all other clicks, let Webflow handle them naturally
}

// =============================================
// WEBFLOW INTEGRATION FIXES
// =============================================

/**
 * Apply Webflow-specific fixes for dropdowns and components
 */
function applyWebflowFixes() {
  // Fix missing theme-switcher-component classes
  const colorThemeSwitcher = document.getElementById('color-theme-switcher');
  const industryThemeSwitcher = document.getElementById('industry-theme-switcher');
  
  if (colorThemeSwitcher && !colorThemeSwitcher.classList.contains('theme-switcher-component')) {
    colorThemeSwitcher.classList.add('theme-switcher-component');
    console.log('✅ Fixed missing theme-switcher-component class');
  }
  
  if (industryThemeSwitcher && !industryThemeSwitcher.classList.contains('theme-switcher-component')) {
    industryThemeSwitcher.classList.add('theme-switcher-component');
    console.log('✅ Fixed missing industry-switcher-component class');
  }
  
  // Add dropdown positioning fixes
  const dropdownFixCSS = `
  <style id="webflow-dropdown-fix">
  .w-dropdown-list {
    z-index: 9999 !important;
    position: absolute !important;
  }
  .w-dropdown.w--open .w-dropdown-list {
    z-index: 9999 !important;
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
  }
  #smooth-wrapper, #smooth-content {
    position: relative !important;
    z-index: auto !important;
  }
  .navbar {
    position: relative !important;
    z-index: 1000 !important;
  }
  .theme-switcher-component .w-dropdown-list {
    z-index: 10000 !important;
    background: var(--_color---surface--primary) !important;
    border: 1px solid var(--_color---border--secondary) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  }
  </style>
  `;
  
  if (!document.getElementById('webflow-dropdown-fix')) {
    document.head.insertAdjacentHTML('beforeend', dropdownFixCSS);
    console.log('✅ Added Webflow dropdown positioning fixes');
  }

  // Preserve Webflow interactions by using smart click handling
  document.body.addEventListener('click', handleSmartClick, true);
  console.log('✅ Added smart click handler for Webflow compatibility');
}

// =============================================
// THEME SYSTEM
// =============================================

/**
 * Apply theme to the page
 * @param {string} themePickerId - Theme picker ID (e.g., 'modern-theme-1')
 */
function applyTheme(themePickerId) {
  const cssThemeClass = CONFIG.THEME_MAPPING[themePickerId];
  if (!cssThemeClass) {
    console.warn(`⚠️ Unknown theme: ${themePickerId}`);
    return;
  }
  
  console.log(`🎨 Switching to theme: ${themePickerId} → ${cssThemeClass}`);
  
  // Ensure body has the 'body' class for Webflow theme structure
  if (!document.body.classList.contains('body')) {
    document.body.classList.add('body');
  }
  
  // Remove all existing theme classes
  ALL_THEME_CLASSES.forEach(cls => document.body.classList.remove(cls));
  ALL_THEME_IDS.forEach(id => document.body.classList.remove(id));
  
  // Apply the correct Webflow theme class
  document.body.classList.add(cssThemeClass);
  
  // Mark that theme has been applied (shows content)
  document.body.classList.add('theme-applied');
  
  // Force reflow
  document.body.offsetHeight;
  
  // Save to localStorage
  saveToStorage(CONFIG.THEME_STORAGE_KEY, themePickerId);
  
  // Update UI
  updateDropdownLabels();
  
  // Dispatch event
  dispatchThemeEvent(themePickerId, cssThemeClass);
  
  console.log(`✅ Applied theme: ${themePickerId} (CSS: ${cssThemeClass})`);
}

/**
 * Initialize theme switcher components (Webflow-compatible)
 * Uses smart click handling that preserves Webflow interactions
 * @param {Element} switcher - Theme switcher component
 */
function initializeThemeSwitcher(switcher) {
  const links = switcher.querySelectorAll('.theme-link');
  console.log(`🔗 Found ${links.length} theme links (using smart click handling)`);
  
  // Ensure theme links have proper attributes for smart click handling
  links.forEach(link => {
    if (!link.hasAttribute('data-theme') && link.id) {
      link.setAttribute('data-theme', link.id);
    }
  });
  
  console.log(`✅ Theme switcher initialized with Webflow interaction preservation`);
}

// =============================================
// INDUSTRY SYSTEM
// =============================================

/**
 * Apply industry filter
 * @param {string} industry - Industry name
 */
function applyIndustry(industry) {
  if (!CONFIG.INDUSTRIES.includes(industry)) {
    console.warn(`⚠️ Unsupported industry: ${industry}`);
    return;
  }
  
  console.log(`🎯 Switching to industry: ${industry}`);
  
  // Show only the selected industry content using JavaScript
  showIndustryContent(industry);
  
  // Remove existing filter classes
  document.body.classList.forEach(cls => {
    if (cls.startsWith('filter-')) {
      document.body.classList.remove(cls);
    }
  });
  
  // Apply new filter class for CSS fallback
  document.body.classList.add(`filter-${industry}`);
  
  // Save to localStorage
  saveToStorage(CONFIG.INDUSTRY_STORAGE_KEY, industry);
  
  // Update UI
  updateDropdownLabels();
  
  // Dispatch event
  dispatchIndustryEvent(industry);
  
  console.log(`✅ Applied industry filter: filter-${industry}`);
}

/**
 * Initialize industry switcher (Webflow-compatible)
 * Uses smart click handling that preserves Webflow interactions
 */
function initializeIndustrySwitcher() {
  const industrySwitcher = document.getElementById('industry-theme-switcher');
  if (!industrySwitcher) return;
  
  const industryLinks = industrySwitcher.querySelectorAll('.theme-link');
  console.log(`🎯 Found ${industryLinks.length} industry links (using smart click handling)`);
  
  // Ensure industry links have proper attributes for smart click handling
  industryLinks.forEach(link => {
    if (!link.hasAttribute('data-industry') && link.id) {
      link.setAttribute('data-industry', link.id);
    }
  });
  
  console.log(`✅ Industry switcher initialized with Webflow interaction preservation`);
}

// =============================================
// CMS CONTENT MAPPING
// =============================================

/**
 * Show only the selected industry content using JavaScript display control
 * This handles both correct data-industry attributes AND content-based detection
 * @param {string} industry - Industry to show
 */
function showIndustryContent(industry) {
  console.log(`🔄 Showing content for industry: ${industry}`);
  
  // Find content wrappers
  const contentWrappers = document.querySelectorAll('.industry-content');
  
  if (contentWrappers.length === 0) {
    // Fallback: if no specific wrappers, search the entire document
    console.log('⚠️ No .industry-content wrappers found, searching entire document');
    const allItems = document.querySelectorAll('[data-industry]');
    showHideItems(allItems, industry);
    return;
  }
  
  // Process each content wrapper
  contentWrappers.forEach(wrapper => {
    const items = wrapper.querySelectorAll('[data-industry]');
    showHideItemsWithContentDetection(items, industry);
  });
  
  console.log(`✅ Industry content visibility updated for: ${industry}`);
}

/**
 * Helper function to show/hide items based on industry with smart content detection
 * This handles both correct data-industry attributes AND content-based detection
 * @param {NodeList} items - Items to process
 * @param {string} targetIndustry - Industry to show
 */
function showHideItemsWithContentDetection(items, targetIndustry) {
  if (items.length === 0) return;
  
  let foundMatch = false;
  const industryTextMap = {
    'dental': ['dental', 'tooth', 'dentist', 'oral', 'teeth'],
    'finance': ['finance', 'financial', 'money', 'investment', 'banking'],
    'real-estate': ['real estate', 'property', 'housing', 'realty'],
    'small-business': ['small business', 'entrepreneur', 'startup', 'sme']
  };
  
  // Show/hide items based on data-industry attribute OR content detection
  items.forEach(item => {
    const itemIndustry = item.getAttribute('data-industry');
    let shouldShow = false;
    
    // First, check if data-industry matches exactly
    if (itemIndustry === targetIndustry) {
      shouldShow = true;
      console.log(`👁️ Showing item: ${itemIndustry} (exact match)`);
    }
    // If no exact match, check content for industry keywords
    else {
      const itemText = item.textContent.toLowerCase();
      const targetKeywords = industryTextMap[targetIndustry] || [targetIndustry];
      
      const hasKeyword = targetKeywords.some(keyword => 
        itemText.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        shouldShow = true;
        console.log(`👁️ Showing item: ${itemIndustry} (content match for "${targetIndustry}")`);
      } else {
        console.log(`🙈 Hiding item: ${itemIndustry} (no match for "${targetIndustry}")`);
      }
    }
    
    if (shouldShow) {
      item.style.display = '';
      foundMatch = true;
    } else {
      item.style.display = 'none';
    }
  });
  
  // Fallback: if no match found, show the first available item
  if (!foundMatch && items.length > 0) {
    items[0].style.display = '';
    console.log(`🔄 No matches found, showing first available item as fallback`);
  }
}

/**
 * Helper function to show/hide items based on industry (original simple version)
 * @param {NodeList} items - Items to process
 * @param {string} targetIndustry - Industry to show
 */
function showHideItems(items, targetIndustry) {
  if (items.length === 0) return;
  
  let foundMatch = false;
  
  // Show/hide items based on their data-industry attribute
  items.forEach(item => {
    const itemIndustry = item.getAttribute('data-industry');
    if (itemIndustry === targetIndustry) {
      item.style.display = ''; // Show the item
      foundMatch = true;
      console.log(`👁️ Showing item: ${itemIndustry}`);
    } else {
      item.style.display = 'none'; // Hide the item
      console.log(`🙈 Hiding item: ${itemIndustry}`);
    }
  });
  
  // Fallback: if no exact match found, show the first available item
  if (!foundMatch && items.length > 0) {
    items[0].style.display = '';
    console.log(`🔄 No exact match found, showing first available item as fallback`);
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Save value to localStorage with error handling
 * @param {string} key - Storage key
 * @param {string} value - Value to save
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`⚠️ Could not save ${key} to localStorage:`, error);
  }
}

/**
 * Load value from localStorage with error handling
 * @param {string} key - Storage key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} Stored or default value
 */
function loadFromStorage(key, defaultValue) {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.warn(`⚠️ Could not load ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Get URL parameter value
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value
 */
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Close Webflow dropdown
 * @param {Element} element - Element inside dropdown
 */
function closeWebflowDropdown(element) {
  const dropdown = element.closest('.w-dropdown');
  if (dropdown) {
    const toggle = dropdown.querySelector('.w-dropdown-toggle');
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.click();
    }
  }
}

/**
 * Update dropdown labels to show current selections
 */
function updateDropdownLabels() {
  const currentTheme = loadFromStorage(CONFIG.THEME_STORAGE_KEY, CONFIG.DEFAULT_THEME);
  const currentIndustry = loadFromStorage(CONFIG.INDUSTRY_STORAGE_KEY, CONFIG.DEFAULT_INDUSTRY);
  
  updateThemeDropdownLabel(currentTheme);
  updateIndustryDropdownLabel(currentIndustry);
}

/**
 * Update theme dropdown label
 * @param {string} themePickerId - Current theme picker ID
 */
function updateThemeDropdownLabel(themePickerId) {
  document.querySelectorAll('.theme-switcher-component').forEach(switcher => {
    const display = switcher.querySelector('.text_label-sm');
    const selectedLink = switcher.querySelector(`.theme-link#${themePickerId}`);
    if (display && selectedLink) {
      display.textContent = selectedLink.textContent;
    }
  });
}

/**
 * Update industry dropdown label
 * @param {string} industry - Current industry
 */
function updateIndustryDropdownLabel(industry) {
  const industrySwitcher = document.getElementById('industry-theme-switcher');
  if (industrySwitcher) {
    const display = industrySwitcher.querySelector('.text_label-sm');
    const selectedLink = industrySwitcher.querySelector(`.theme-link#${industry}`);
    if (display && selectedLink) {
      display.textContent = selectedLink.textContent;
    } else if (display) {
      display.textContent = industry.charAt(0).toUpperCase() + industry.slice(1);
    }
  }
}

/**
 * Dispatch theme change event
 * @param {string} themePickerId - Theme picker ID
 * @param {string} cssClass - CSS class name
 */
function dispatchThemeEvent(themePickerId, cssClass) {
  document.dispatchEvent(new CustomEvent('themeChanged', { 
    detail: { 
      themePickerId: themePickerId,
      cssClass: cssClass
    } 
  }));
}

/**
 * Dispatch industry change event
 * @param {string} industry - Industry name
 */
function dispatchIndustryEvent(industry) {
  const industryChangedEvent = new CustomEvent('industryChanged', {
    detail: { 
      industry: industry,
      timestamp: new Date().toISOString()
    }
  });
  document.dispatchEvent(industryChangedEvent);
}

// =============================================
// IMMEDIATE STATE APPLICATION (FLASH PREVENTION)
// =============================================

/**
 * Apply theme and industry state immediately on page load
 * This prevents flash of unstyled content by applying styles before DOM is ready
 */
function applyImmediateState() {
  // Add immediate flash prevention CSS if not already added
  addFlashPreventionCSS();
  
  // Get saved state or defaults
  const savedTheme = loadFromStorage(CONFIG.THEME_STORAGE_KEY, CONFIG.DEFAULT_THEME);
  const savedIndustry = loadFromStorage(CONFIG.INDUSTRY_STORAGE_KEY, CONFIG.DEFAULT_INDUSTRY);
  
  // Handle URL parameters
  const urlTheme = getUrlParam('theme');
  const urlIndustry = getUrlParam('industry');
  
  const finalTheme = (urlTheme && ALL_THEME_IDS.includes(urlTheme)) ? urlTheme : savedTheme;
  const finalIndustry = (urlIndustry && CONFIG.INDUSTRIES.includes(urlIndustry)) ? urlIndustry : savedIndustry;
  
  // Apply theme immediately without logging (for speed)
  const cssThemeClass = CONFIG.THEME_MAPPING[finalTheme];
  if (cssThemeClass) {
    // Ensure body has the 'body' class
    document.body.classList.add('body');
    
    // Remove all existing theme classes
    ALL_THEME_CLASSES.forEach(cls => document.body.classList.remove(cls));
    ALL_THEME_IDS.forEach(id => document.body.classList.remove(id));
    
    // Apply theme class
    document.body.classList.add(cssThemeClass);
    
    // Apply industry filter class
    document.body.classList.forEach(cls => {
      if (cls.startsWith('filter-')) {
        document.body.classList.remove(cls);
      }
    });
    document.body.classList.add(`filter-${finalIndustry}`);
    
    // Mark that theme has been applied
    document.body.classList.add('theme-applied');
    
    // Save to localStorage if URL params were used
    if (urlTheme) saveToStorage(CONFIG.THEME_STORAGE_KEY, finalTheme);
    if (urlIndustry) saveToStorage(CONFIG.INDUSTRY_STORAGE_KEY, finalIndustry);
  }
  
  return { theme: finalTheme, industry: finalIndustry };
}

/**
 * Add CSS to prevent flash of unstyled content during theme switching
 * This hides content until themes are applied
 */
function addFlashPreventionCSS() {
  if (document.getElementById('flash-prevention-css')) return;
  
  const style = document.createElement('style');
  style.id = 'flash-prevention-css';
  style.innerHTML = `
    /* Hide content until theme is applied to prevent flash */
    body:not(.theme-applied) main,
    body:not(.theme-applied) .hero,
    body:not(.theme-applied) .hero-section,
    body:not(.theme-applied) [class*="hero"] {
      visibility: hidden !important;
    }
    
    /* Show content once theme is applied */
    body.theme-applied main,
    body.theme-applied .hero,
    body.theme-applied .hero-section,
    body.theme-applied [class*="hero"] {
      visibility: visible !important;
      transition: visibility 0.1s ease-in-out;
    }
    
    /* Ensure navigation and theme switchers are always visible */
    nav,
    .navbar,
    .theme-switcher-component,
    #color-theme-switcher,
    #industry-theme-switcher {
      visibility: visible !important;
    }
  `;
  
  // Insert at the very beginning of head for maximum priority
  const head = document.head || document.getElementsByTagName('head')[0];
  head.insertBefore(style, head.firstChild);
}

// =============================================
// INITIALIZATION
// =============================================

// Apply state immediately (before DOM ready for fastest loading)
let immediateState = null;

// Apply state as early as possible to prevent flash
if (document.readyState === 'loading') {
  // Page still loading - apply immediately and also on DOM ready
  immediateState = applyImmediateState();
  document.addEventListener('DOMContentLoaded', function() {
    // Reapply to ensure everything is set correctly
    applyImmediateState();
  });
} else {
  // Page already loaded - apply now  
  immediateState = applyImmediateState();
}

// Also apply on page show (for back/forward navigation)
window.addEventListener('pageshow', function(event) {
  if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
    // Page was restored from cache, reapply state
    applyImmediateState();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎨 Webflow-Aligned Theme Switcher - Supporting All 8 Themes');
  
  // Apply Webflow fixes
  applyWebflowFixes();
  
  // Initialize theme switchers
  document.querySelectorAll('.theme-switcher-component').forEach(initializeThemeSwitcher);
  
  // Initialize industry switcher
  initializeIndustrySwitcher();
  
  // Apply initial state if not already done
  if (!immediateState) {
    immediateState = applyImmediateState();
  }
  
  // Apply full state with UI updates  
  applyTheme(immediateState.theme);
  applyIndustry(immediateState.industry);
  
  // Initialize industry content visibility after Webflow CMS loads
  setTimeout(() => {
    showIndustryContent(immediateState.industry);
  }, 1000);
  
  console.log('🚀 Theme system ready!');
});

// =============================================
// GLOBAL API (for debugging and external use)
// =============================================

// Expose functions globally
window.switchToTheme = function(themePickerId) {
  if (ALL_THEME_IDS.includes(themePickerId)) {
    applyTheme(themePickerId);
  } else {
    console.warn(`⚠️ Unsupported theme: ${themePickerId}`);
  }
};

window.switchToIndustry = function(industry) {
  if (CONFIG.INDUSTRIES.includes(industry)) {
    applyIndustry(industry);
  } else {
    console.warn(`⚠️ Unsupported industry: ${industry}`);
  }
};

// Debugging functions
window.debugTheme = function() {
  console.log('🎨 Theme Debug Info:');
  console.log(`Current body classes: ${document.body.className}`);
  console.log(`Theme mapping:`, CONFIG.THEME_MAPPING);
  console.log(`Available themes:`, ALL_THEME_IDS);
  
  const currentThemeClass = ALL_THEME_CLASSES.find(cls => document.body.classList.contains(cls));
  if (currentThemeClass) {
    const currentPickerId = Object.keys(CONFIG.THEME_MAPPING).find(key => CONFIG.THEME_MAPPING[key] === currentThemeClass);
    console.log(`Current theme: ${currentPickerId} → ${currentThemeClass}`);
  } else {
    console.log('No theme class found on body');
  }
};

window.debugIndustry = function() {
  console.log('🎯 Industry Debug Info:');
  console.log(`Current body classes: ${document.body.className}`);
  
  const currentFilterClass = Array.from(document.body.classList).find(cls => cls.startsWith('filter-'));
  console.log(`Current industry filter: ${currentFilterClass || 'none'}`);
  
  const industryItems = document.querySelectorAll('[data-industry]');
  console.log(`Found ${industryItems.length} items with data-industry attributes`);
};

window.debugCMSItems = function() {
  console.log('🔍 CMS Debug Info:');
  const dynItems = document.querySelectorAll('[data-industry]');
  console.log(`Found ${dynItems.length} items with data-industry attributes:`);
  
  // Group items by data-industry value
  const industryGroups = {};
  dynItems.forEach((item, index) => {
    const industry = item.getAttribute('data-industry');
    const isVisible = item.style.display !== 'none' && getComputedStyle(item).display !== 'none';
    const inlineStyle = item.style.display || 'not set';
    const contentPreview = item.textContent.substring(0, 50).replace(/\s+/g, ' ').trim();
    
    if (!industryGroups[industry]) {
      industryGroups[industry] = [];
    }
    
    industryGroups[industry].push({
      index: index + 1,
      industry,
      inlineStyle,
      isVisible,
      contentPreview
    });
  });
  
  // Display grouped results
  Object.keys(industryGroups).forEach(industry => {
    console.log(`\n📁 data-industry="${industry}" (${industryGroups[industry].length} items):`);
    industryGroups[industry].forEach(item => {
      console.log(`  ${item.index}. inline="${item.inlineStyle}" | visible: ${item.isVisible} | content: "${item.contentPreview}"`);
    });
  });
  
  console.log(`\n📊 Content Wrappers:`);
  const contentWrappers = document.querySelectorAll('.industry-content');
  console.log(`Found ${contentWrappers.length} .industry-content wrappers`);
  
  console.log(`\n🎯 Body classes: ${document.body.className}`);
  
  // Check for potential data attribute issues
  const expectedIndustries = ['dental', 'finance', 'real-estate', 'small-business'];
  const actualIndustries = Object.keys(industryGroups);
  const unexpectedIndustries = actualIndustries.filter(industry => !expectedIndustries.includes(industry));
  
  if (unexpectedIndustries.length > 0) {
    console.log(`\n⚠️ POTENTIAL ISSUES DETECTED:`);
    console.log(`Expected industries: ${expectedIndustries.join(', ')}`);
    console.log(`Unexpected data-industry values found: ${unexpectedIndustries.join(', ')}`);
    console.log(`These items may not filter correctly. Check your Webflow CMS setup.`);
  }
};

window.clearInlineStyles = function() {
  console.log('🧹 Clearing all inline display styles from industry items...');
  const dynItems = document.querySelectorAll('[data-industry]');
  dynItems.forEach(item => {
    item.style.display = '';
  });
  console.log(`✅ Cleared inline styles from ${dynItems.length} items`);
};

window.testContentDetection = function() {
  console.log('🔍 Testing Content-Based Industry Detection:');
  const industries = ['dental', 'finance', 'real-estate', 'small-business'];
  const allItems = document.querySelectorAll('[data-industry]');
  
  const industryTextMap = {
    'dental': ['dental', 'tooth', 'dentist', 'oral', 'teeth'],
    'finance': ['finance', 'financial', 'money', 'investment', 'banking'],
    'real-estate': ['real estate', 'property', 'housing', 'realty'],
    'small-business': ['small business', 'entrepreneur', 'startup', 'sme']
  };
  
  industries.forEach(targetIndustry => {
    console.log(`\n📋 Testing industry: "${targetIndustry}"`);
    const targetKeywords = industryTextMap[targetIndustry] || [targetIndustry];
    console.log(`   Keywords: ${targetKeywords.join(', ')}`);
    
    let exactMatches = 0;
    let contentMatches = 0;
    
    allItems.forEach((item, index) => {
      const itemIndustry = item.getAttribute('data-industry');
      const itemText = item.textContent.toLowerCase();
      const contentPreview = item.textContent.substring(0, 40).replace(/\s+/g, ' ').trim();
      
      if (itemIndustry === targetIndustry) {
        exactMatches++;
        console.log(`   ✅ EXACT: data-industry="${itemIndustry}" | "${contentPreview}"`);
      } else {
        const hasKeyword = targetKeywords.some(keyword => 
          itemText.includes(keyword.toLowerCase())
        );
        if (hasKeyword) {
          contentMatches++;
          const matchedKeyword = targetKeywords.find(keyword => 
            itemText.includes(keyword.toLowerCase())
          );
          console.log(`   🔍 CONTENT: data-industry="${itemIndustry}" (matched: "${matchedKeyword}") | "${contentPreview}"`);
        }
      }
    });
    
    console.log(`   📊 Results: ${exactMatches} exact matches, ${contentMatches} content matches`);
  });
};

window.debugWebflowInteraction = function() {
  console.log('🎭 Webflow Loading Interaction Debug:');
  
  // Check for navigation links
  const navLinks = document.querySelectorAll('nav a, .navbar a, .nav-link');
  console.log(`\n🔗 Found ${navLinks.length} navigation links`);
  
  // Check for loading overlays
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="overlay"], .w-lightbox-backdrop');
  console.log(`\n🎭 Found ${loadingElements.length} potential loading overlay elements:`);
  loadingElements.forEach((el, index) => {
    const styles = getComputedStyle(el);
    console.log(`  ${index + 1}. ${el.className}`);
    console.log(`     - visible: ${styles.display !== 'none'}`);
    console.log(`     - opacity: ${styles.opacity}`);
    console.log(`     - z-index: ${styles.zIndex}`);
    console.log(`     - position: ${styles.position}`);
  });
  
  // Check for interactions on page
  const interactiveElements = document.querySelectorAll('[data-w-id]');
  console.log(`\n⚡ Found ${interactiveElements.length} elements with Webflow interactions (data-w-id)`);
  
  console.log(`\n📋 Webflow Loading Interaction Checklist:`);
  console.log(`  1. ✅ JavaScript preserves navigation clicks for Webflow interactions`);
  console.log(`  2. ✅ Theme/industry state applied immediately to prevent flash`);
  console.log(`  3. Check that interaction trigger is set to 'Each time' not 'Only first time'`);
  console.log(`  4. Ensure interaction is on navigation links, not theme switcher links`);
  console.log(`  5. Verify loading overlay has proper z-index and covers entire viewport`);
  console.log(`  6. Check that interaction duration matches your expected timing`);
  
  console.log(`\n🔧 Flash Prevention Strategy:`);
  console.log(`  - Theme applied BEFORE page content loads`);
  console.log(`  - Industry filtering applied immediately`);  
  console.log(`  - No content hiding/revealing - relies on Webflow overlay`);
  console.log(`  - Loading overlay should completely cover any transitions`);
  
  console.log(`\n🎯 To test: Click a nav link - overlay should cover any theme changes`);
};

window.testOverlayCoverage = function() {
  console.log('🧪 Testing Loading Overlay Coverage:');
  
  // Check if there are any loading overlays
  const overlays = document.querySelectorAll('[class*="loading"], [class*="overlay"], .w-lightbox-backdrop, [data-w-id]');
  
  if (overlays.length === 0) {
    console.log('❌ No loading overlays found! You need to create a loading animation in Webflow.');
    console.log('   1. Create a div with "loading-overlay" or similar class name');
    console.log('   2. Set up a Webflow interaction triggered by navigation clicks');
    console.log('   3. Make sure the overlay covers the full viewport (100vw x 100vh)');
    return;
  }
  
  overlays.forEach((overlay, index) => {
    const styles = getComputedStyle(overlay);
    const rect = overlay.getBoundingClientRect();
    const wId = overlay.getAttribute('data-w-id');
    
    console.log(`\n📐 Overlay ${index + 1} (${overlay.className}):`);
    console.log(`   - Data-w-id: ${wId || 'none'}`);
    console.log(`   - Position: ${styles.position}`);
    console.log(`   - Z-index: ${styles.zIndex}`);
    console.log(`   - Width: ${styles.width} (viewport: ${window.innerWidth}px)`);
    console.log(`   - Height: ${styles.height} (viewport: ${window.innerHeight}px)`);
    console.log(`   - Top: ${styles.top}, Left: ${styles.left}`);
    console.log(`   - Covers full viewport: ${rect.width >= window.innerWidth && rect.height >= window.innerHeight}`);
    console.log(`   - Currently visible: ${styles.display !== 'none' && styles.opacity !== '0'}`);
  });
  
  console.log('\n💡 For best flash prevention:');
  console.log('   - Overlay should be position: fixed with top: 0, left: 0');
  console.log('   - Size should be 100vw x 100vh to cover entire viewport');
  console.log('   - Z-index should be 99999 or higher');
  console.log('   - Background should be solid (not transparent)');
  console.log('   - Duration should match your expected page load time');
  console.log('   - Webflow interaction should trigger on "Page Loading" not just specific links');
};

window.testNavigationClick = function() {
  console.log('🧪 Testing Navigation Click Detection:');
  
  // Find navigation links
  const navLinks = document.querySelectorAll('a');
  const detectedNavLinks = [];
  
  navLinks.forEach((link, index) => {
    if (isNavigationLink(link)) {
      detectedNavLinks.push(link);
      console.log(`🔗 Nav Link ${detectedNavLinks.length}: ${link.textContent.trim()} → ${link.href}`);
    }
  });
  
  console.log(`\n📊 Found ${detectedNavLinks.length} navigation links that will trigger loading overlay`);
  
  if (detectedNavLinks.length > 0) {
    console.log('\n🎯 To test: Click one of these links to see if loading overlay appears');
    console.log('   Watch console for "🔄 Navigation click detected" message');
  } else {
    console.log('\n❌ No navigation links detected! Check your HTML structure.');
    console.log('   Make sure nav links are inside <nav> or have nav-related classes');
  }
};

window.forceLoadingOverlay = function() {
  console.log('🧪 Forcing Loading Overlay Display:');
  
  // Apply immediate state
  applyImmediateState();
  
  // Trigger loading overlay
  triggerLoadingOverlay();
  
  console.log('✅ Loading overlay should now be visible');
  console.log('   This simulates what happens during navigation');
  
  // Auto-hide after 5 seconds for testing
  setTimeout(() => {
    const backup = document.querySelector('.loading-overlay-backup');
    if (backup) {
      backup.style.opacity = '0';
      setTimeout(() => backup.remove(), 300);
    }
    console.log('🎭 Test loading overlay hidden');
  }, 5000);
};

console.log('💡 Debug commands available:');
console.log('  - switchToTheme("modern-theme-1") - Switch theme');
console.log('  - switchToIndustry("dental") - Switch industry');  
console.log('  - debugTheme() - Show theme debug info');
console.log('  - debugIndustry() - Show industry debug info');
console.log('  - debugCMSItems() - Show detailed CMS items debug info');
console.log('  - clearInlineStyles() - Clear all inline display styles');
console.log('  - testContentDetection() - Test content-based industry detection');
console.log('  - debugWebflowInteraction() - Debug loading interaction setup');
console.log('  - testOverlayCoverage() - Test loading overlay configuration');
console.log('  - testNavigationClick() - Test navigation link detection');
console.log('  - forceLoadingOverlay() - Force show loading overlay (5s test)');