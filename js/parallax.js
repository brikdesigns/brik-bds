/**
 * Brik Design System - Parallax Scroll Helper
 *
 * Provides smooth, lerped parallax scrolling with performance optimizations.
 * Uses requestAnimationFrame for 60fps updates and linear interpolation
 * for buttery smooth movement.
 *
 * Dependencies: animations.css (for .parallax-element class)
 *
 * Usage:
 *   1. Include this script after DOM is ready
 *   2. Add .parallax-element class to elements
 *   3. Set data-parallax-speed attribute (0.05-0.25 range)
 *   4. Optionally set data-parallax-type="image" for reveal effects
 *
 * Example HTML:
 *   <div class="parallax-container">
 *     <div class="parallax-element" data-parallax-speed="0.08">
 *       Subtle parallax
 *     </div>
 *     <div class="parallax-element" data-parallax-speed="0.15">
 *       Medium parallax
 *     </div>
 *   </div>
 *
 * Speed Guide:
 *   0.05-0.08 = Very subtle (background elements)
 *   0.10-0.15 = Medium (hero elements, decorative shapes)
 *   0.20-0.25 = Noticeable (accent elements - use sparingly)
 */

(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    lerpFactor: 0.08,     // Lower = smoother/slower (0.05-0.15 range)
    defaultSpeed: 0.1,    // Default parallax speed if not specified
    threshold: 0.01,      // Minimum difference to update (performance)
  };

  // State
  const parallaxState = new Map();
  let parallaxElements = [];
  let isRunning = false;
  let prefersReducedMotion = false;

  /**
   * Initialize parallax system
   */
  function init() {
    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = motionQuery.matches;

    // Listen for preference changes
    motionQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        resetAllElements();
      }
    });

    // Find all parallax elements
    parallaxElements = document.querySelectorAll('.parallax-element');

    if (parallaxElements.length === 0 || prefersReducedMotion) {
      return;
    }

    // Initialize state for each element
    parallaxElements.forEach((el) => {
      parallaxState.set(el, { current: 0, target: 0 });
    });

    // Start animation loop
    startLoop();
  }

  /**
   * Calculate target position for each element based on scroll
   */
  function calculateTargets() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;

    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallaxSpeed) || CONFIG.defaultSpeed;
      const type = el.dataset.parallaxType || 'default';
      const state = parallaxState.get(el);

      if (!state) return;

      // Get element position
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrollY;

      // Calculate target offset based on type
      if (type === 'image') {
        // Image reveal: element moves relative to its position in viewport
        state.target = (scrollY - elementTop + viewportHeight) * speed;
      } else {
        // Default: element moves based on overall scroll position
        state.target = scrollY * speed;
      }
    });
  }

  /**
   * Update element positions with lerping for smooth movement
   */
  function updatePositions() {
    let hasMovement = false;

    parallaxElements.forEach((el) => {
      const state = parallaxState.get(el);
      if (!state) return;

      // Lerp: smoothly interpolate current toward target
      const diff = state.target - state.current;

      // Only update if difference is meaningful (performance)
      if (Math.abs(diff) > CONFIG.threshold) {
        state.current += diff * CONFIG.lerpFactor;
        hasMovement = true;

        // Apply transform with GPU acceleration
        el.style.transform = `translate3d(0, ${state.current}px, 0)`;
      }
    });

    return hasMovement;
  }

  /**
   * Animation loop
   */
  function animationLoop() {
    if (prefersReducedMotion) {
      isRunning = false;
      return;
    }

    calculateTargets();
    updatePositions();

    requestAnimationFrame(animationLoop);
  }

  /**
   * Start the animation loop
   */
  function startLoop() {
    if (isRunning) return;
    isRunning = true;
    requestAnimationFrame(animationLoop);
  }

  /**
   * Reset all elements to original position
   */
  function resetAllElements() {
    parallaxElements.forEach((el) => {
      el.style.transform = 'none';
      const state = parallaxState.get(el);
      if (state) {
        state.current = 0;
        state.target = 0;
      }
    });
  }

  /**
   * Refresh parallax (call after dynamic content changes)
   */
  function refresh() {
    parallaxElements = document.querySelectorAll('.parallax-element');
    parallaxElements.forEach((el) => {
      if (!parallaxState.has(el)) {
        parallaxState.set(el, { current: 0, target: 0 });
      }
    });
  }

  /**
   * Destroy parallax system
   */
  function destroy() {
    isRunning = false;
    resetAllElements();
    parallaxState.clear();
    parallaxElements = [];
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external control
  window.BrikParallax = {
    init,
    refresh,
    destroy,
    config: CONFIG,
  };
})();
