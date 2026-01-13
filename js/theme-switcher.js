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
    updateCurrentSelections();
    updateThemeDropdownLabel(theme);
    setTimeout(() => updateThemeDropdownLabel(theme), 50); // Force update after Webflow re-renders
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
    const links = switcher.querySelectorAll('.theme-link');
    console.log(`🔗 Found ${links.length} theme links with class "theme-link"`);
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const theme = this.id;
        console.log(`🖱️ Clicked: ${theme}`);
        
        // Validate theme is supported
        if (ALL_THEMES.includes(theme)) {
          applyTheme(theme);
          updateThemeDropdownLabel(theme);
          setTimeout(() => updateThemeDropdownLabel(theme), 50); // Force update after Webflow re-renders
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

  // ===============================
  // URL PARAMETER SUPPORT FOR THEME & INDUSTRY
  // ===============================
  function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // Check for ?theme=... and ?industry=... in URL
  const urlTheme = getUrlParam('theme');
  const urlIndustry = getUrlParam('industry');

  // ===============================
  // THEME SWITCHER (with URL param support)
  // ===============================
  // Load saved theme or default
  let savedTheme = 'modern-theme-1';
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'modern-theme-1';
  } catch (error) {
    console.warn('⚠️ Could not load theme from localStorage:', error);
  }
  // If URL param is present and valid, use it
  let initialTheme = savedTheme;
  if (urlTheme && ALL_THEMES.includes(urlTheme)) {
    initialTheme = urlTheme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, urlTheme);
    } catch (error) {
      console.warn('⚠️ Could not save theme from URL param:', error);
    }
  }
  console.log(`💾 Loading theme: ${initialTheme}`);
  // On page load, after applying the initial theme and industry, update dropdown labels
  applyTheme(initialTheme);
  updateThemeDropdownLabel(initialTheme);

  // ===============================
  // INDUSTRY SWITCHER (with URL param support)
  // ===============================
  // Scope to the industry switcher component
  
  const industrySwitcher = document.getElementById('industry-theme-switcher');
  if (industrySwitcher) {
    const industryLinks = industrySwitcher.querySelectorAll('.theme-link');
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
        let found = false;
        items.forEach(item => {
          if (item.getAttribute('data-industry') === industry) {
            item.style.display = '';
            found = true;
          } else {
            item.style.display = 'none';
          }
        });
        // Fallback: if no item matched, show the first available
        if (!found && items.length > 0) {
          items[0].style.display = '';
        }
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
    // If URL param is present, use it
    let initialIndustry = savedIndustry;
    if (urlIndustry) {
      initialIndustry = urlIndustry;
      try {
        localStorage.setItem(INDUSTRY_STORAGE_KEY, urlIndustry);
      } catch (error) {
        console.warn('⚠️ Could not save industry from URL param:', error);
      }
    }
    showIndustry(initialIndustry);
    updateIndustryDropdownLabel(initialIndustry);

    // Add click handlers
    industryLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const industry = this.id;
        showIndustry(industry);
        try {
          localStorage.setItem(INDUSTRY_STORAGE_KEY, industry);
        } catch (error) {
          console.warn('⚠️ Could not save industry to localStorage:', error);
        }
        updateCurrentSelections();
        updateIndustryDropdownLabel(industry); // <-- Ensure this is here
      });
    });

    // Always show all menu options in the dropdown
    industryLinks.forEach(link => {
      link.style.display = '';
    });

    // Event delegation for dynamically rendered dropdowns
    industrySwitcher.addEventListener('click', function(e) {
      if (e.target.classList.contains('theme-link')) {
        e.preventDefault();
        const industry = e.target.id;
        showIndustry(industry);
        try {
          localStorage.setItem(INDUSTRY_STORAGE_KEY, industry);
        } catch (error) {
          console.warn('⚠️ Could not save industry to localStorage:', error);
        }
        updateCurrentSelections();
        updateIndustryDropdownLabel(industry);
      }
    });
  }

  console.log('🚀 Theme switcher ready!');
  
  // Expose theme switching function globally for Webflow interactions
  window.switchToTheme = function(theme) {
    if (ALL_THEMES.includes(theme)) {
      applyTheme(theme);
    } else {
      console.warn(`⚠️ Unsupported theme: ${theme}`);
    }
  };
});

function updateCurrentSelections() {
  // Get current theme and industry from localStorage (or your state logic)
  var theme = localStorage.getItem('brik-bds-theme') || 'modern-theme-1';
  var industry = localStorage.getItem('brik-bds-industry') || 'dental';

  // Make these more user-friendly
  var themeLabel = theme.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  var industryLabel = industry.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Update the display
  var themeSpan = document.getElementById('selected-theme');
  var industrySpan = document.getElementById('selected-industry');
  if (themeSpan) themeSpan.textContent = 'Theme: ' + themeLabel;
  if (industrySpan) industrySpan.textContent = 'Industry: ' + industryLabel;
}

function updateThemeDropdownLabel(theme) {
  document.querySelectorAll('.theme-switcher-component').forEach(switcher => {
    const display = switcher.querySelector('.text_label-sm');
    const selectedLink = switcher.querySelector(`.theme-link#${theme}`);
    if (display && selectedLink) {
      display.textContent = selectedLink.textContent;
    }
  });
}

function updateIndustryDropdownLabel(industry) {
  const industrySwitcher = document.getElementById('industry-theme-switcher');
  if (industrySwitcher) {
    const display = industrySwitcher.querySelector('.text_label-sm');
    const selectedLink = industrySwitcher.querySelector(`.theme-link#${industry}`);
    if (display && selectedLink) {
      display.textContent = selectedLink.textContent;
    } else if (display) {
      // Fallback: show the industry name capitalized
      display.textContent = industry.charAt(0).toUpperCase() + industry.slice(1);
    }
  }
}

// Call on page load
updateCurrentSelections();