/**
 * =============================================
 *           THEME SWITCHER SCRIPT
 * =============================================
 * Handles theme switching for the Brik BDS
 * design system with support for 8 themes.
 * Integrates with Webflow dropdowns and
 * provides localStorage persistence.
 * =============================================
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎨 Simple Theme Switcher - Supporting All 8 Themes');

  const THEME_STORAGE_KEY = 'brik-bds-theme';
  const INDUSTRY_STORAGE_KEY = 'brik-bds-industry';
  
  // All 8 supported themes
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

  function applyTheme(theme) {
    console.log(`🎨 Switching to theme: ${theme}`);
    
    // Remove ALL theme classes and any conflicting classes
    ALL_THEMES.forEach(t => document.body.classList.remove(t));
    
    // Remove any existing theme-1, theme-2, etc. classes that might conflict
    document.body.classList.remove('theme-1', 'theme-2', 'theme-3', 'theme-4');
    
    // Add the new theme class
    document.body.classList.add(theme);
    
    // Force a reflow to ensure CSS custom properties are applied
    document.body.offsetHeight;
    
    // Save to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('⚠️ Could not save theme to localStorage:', error);
    }
    
    // Update all switcher displays
    updateAllSwitcherDisplays(theme);
    
    console.log(`✅ Applied theme: ${theme}`);
    console.log(`📋 Current body classes: ${document.body.className}`);
    
    // Dispatch a custom event for other scripts to listen to
    document.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: theme } 
    }));
  }

  function updateSwitcherDisplay(switcher, theme) {
    // const display = switcher.querySelector('.theme-link');
    // const selectedLink = switcher.querySelector(`[data-theme="${theme}"]`);
    // if (display && selectedLink) {
    //   display.textContent = selectedLink.textContent;
    //   console.log(`📝 Updated display to: ${selectedLink.textContent}`);
    // }
  }

  function updateAllSwitcherDisplays(theme) {
    document.querySelectorAll('.theme-switcher-component').forEach(switcher => {
      updateSwitcherDisplay(switcher, theme);
    });
  }

  function initializeSwitcher(switcher) {
    const links = switcher.querySelectorAll('.theme-link[data-theme]');
    console.log(`🔗 Found ${links.length} theme links with class "theme-link"`);
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const theme = this.getAttribute('data-theme');
        console.log(`🖱️ Clicked: ${theme}`);
        
        // Validate theme is supported
        if (ALL_THEMES.includes(theme)) {
          applyTheme(theme);
        } else {
          console.warn(`⚠️ Unsupported theme: ${theme}`);
        }
        
        // Close Webflow dropdown
        const dropdown = this.closest('.w-dropdown');
        if (dropdown) {
          const toggle = dropdown.querySelector('.w-dropdown-toggle');
          if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
            toggle.click();
          }
        }
      });
    });
  }

  // Initialize all theme switchers on the page
  document.querySelectorAll('.theme-switcher-component').forEach(initializeSwitcher);

  // Load saved theme or default
  let savedTheme = 'modern-theme-1';
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'modern-theme-1';
  } catch (error) {
    console.warn('⚠️ Could not load theme from localStorage:', error);
  }
  
  console.log(`💾 Loading saved theme: ${savedTheme}`);
  applyTheme(savedTheme);

  // Update dropdown label to match saved theme
  document.querySelectorAll('.theme-switcher-component').forEach(switcher => {
    const display = switcher.querySelector('.text_label-sm'); // or your label element
    const selectedLink = switcher.querySelector(`[data-theme="${savedTheme}"]`);
    if (display && selectedLink) {
      display.textContent = selectedLink.textContent;
    }
  });

  console.log('🚀 Theme switcher ready!');
  
  // Expose theme switching function globally for Webflow interactions
  window.switchToTheme = function(theme) {
    if (ALL_THEMES.includes(theme)) {
      applyTheme(theme);
    } else {
      console.warn(`⚠️ Unsupported theme: ${theme}`);
    }
  };

  // ===============================
  // SCOPED INDUSTRY SWITCHER
  // ===============================
  // Scope to the industry switcher component
  const industrySwitcher = document.getElementById('industry-theme-switcher');
  if (industrySwitcher) {
    const industryLinks = industrySwitcher.querySelectorAll('.theme-link[data-industry]');
    // Only select content blocks that are NOT inside the dropdown
    // Assumes your content blocks are inside a wrapper with class 'industry-content'
    const contentWrappers = document.querySelectorAll('.industry-content');

    // Helper: Remove all filter classes from body
    function removeAllIndustryFilters() {
      document.body.classList.forEach(cls => {
        if (cls.startsWith('filter-')) document.body.classList.remove(cls);
      });
    }

    // Helper: Show only the selected industry content
    function showIndustry(industry) {
      contentWrappers.forEach(wrapper => {
        const items = wrapper.querySelectorAll('[data-industry]');
        items.forEach(item => {
          if (item.getAttribute('data-industry') === industry) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
      removeAllIndustryFilters();
      document.body.classList.add('filter-' + industry);
    }

    // Load saved industry or default to dental
    let savedIndustry = 'dental';
    try {
      savedIndustry = localStorage.getItem(INDUSTRY_STORAGE_KEY) || 'dental';
    } catch (error) {
      console.warn('⚠️ Could not load industry from localStorage:', error);
    }
    showIndustry(savedIndustry);

    // Add click handlers
    industryLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const industry = this.getAttribute('data-industry');
        showIndustry(industry);
        try {
          localStorage.setItem(INDUSTRY_STORAGE_KEY, industry);
        } catch (error) {
          console.warn('⚠️ Could not save industry to localStorage:', error);
        }
      });
    });

    // Always show all menu options in the dropdown
    industryLinks.forEach(link => {
      link.style.display = '';
    });

    // Event delegation for dynamically rendered dropdowns
    industrySwitcher.addEventListener('click', function(e) {
      if (e.target.classList.contains('theme-link') && e.target.hasAttribute('data-industry')) {
        e.preventDefault();
        const industry = e.target.getAttribute('data-industry');
        showIndustry(industry);
        try {
          localStorage.setItem(INDUSTRY_STORAGE_KEY, industry);
        } catch (error) {
          console.warn('⚠️ Could not save industry to localStorage:', error);
        }
      }
    });
  }
});