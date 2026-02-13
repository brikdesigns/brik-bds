/**
 * Brik Design System - Scroll Triggered Animations
 *
 * Uses Intersection Observer API to trigger entrance animations
 * when elements scroll into view. Lightweight alternative to GSAP
 * for simple reveal animations.
 *
 * Dependencies: animations.css (for .animate-* classes)
 *
 * Usage:
 *   1. Include this script after DOM is ready
 *   2. Add animation class to elements (e.g., .animate-fade-up)
 *   3. Elements will animate when they enter viewport
 *
 * Example HTML:
 *   <h2 class="animate-fade-up">This fades in</h2>
 *   <div class="animate-fade-up stagger-1">First child</div>
 *   <div class="animate-fade-up stagger-2">Second child</div>
 *   <div class="animate-fade-up stagger-3">Third child</div>
 *
 * Supported classes:
 *   .animate-fade-up, .animate-fade-down
 *   .animate-slide-left, .animate-slide-right
 *   .animate-scale-in, .animate-fade
 *
 * Stagger classes:
 *   .stagger-1 through .stagger-6
 *   .stagger-children (auto-staggers direct children)
 */

(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    rootMargin: '0px 0px -80px 0px',  // Trigger before element fully enters
    threshold: 0.1,                     // 10% visibility triggers animation
    once: true,                         // Only animate once (performance)
  };

  // Animation class selectors
  const ANIMATE_SELECTORS = [
    '.animate-fade-up',
    '.animate-fade-down',
    '.animate-slide-left',
    '.animate-slide-right',
    '.animate-scale-in',
    '.animate-fade',
  ].join(', ');

  let observer = null;
  let prefersReducedMotion = false;

  /**
   * Initialize scroll animations
   */
  function init() {
    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = motionQuery.matches;

    // Listen for preference changes
    motionQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        showAllElements();
      }
    });

    // If reduced motion, show all immediately
    if (prefersReducedMotion) {
      showAllElements();
      return;
    }

    // Create observer
    observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: CONFIG.rootMargin,
      threshold: CONFIG.threshold,
    });

    // Observe all animated elements
    const elements = document.querySelectorAll(ANIMATE_SELECTORS);
    elements.forEach((el) => observer.observe(el));
  }

  /**
   * Handle intersection events
   */
  function handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');

        // Unobserve if only animating once
        if (CONFIG.once) {
          observer.unobserve(entry.target);
        }
      } else if (!CONFIG.once) {
        entry.target.classList.remove('is-visible');
      }
    });
  }

  /**
   * Show all elements immediately (for reduced motion)
   */
  function showAllElements() {
    const elements = document.querySelectorAll(ANIMATE_SELECTORS);
    elements.forEach((el) => el.classList.add('is-visible'));
  }

  /**
   * Refresh observer (call after dynamic content changes)
   */
  function refresh() {
    if (!observer || prefersReducedMotion) return;

    const elements = document.querySelectorAll(ANIMATE_SELECTORS);
    elements.forEach((el) => {
      // Only observe elements not yet visible
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });
  }

  /**
   * Destroy observer
   */
  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  /**
   * Trigger animation on specific element programmatically
   */
  function trigger(element) {
    if (element && typeof element.classList !== 'undefined') {
      element.classList.add('is-visible');
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external control
  window.BrikScrollAnimations = {
    init,
    refresh,
    destroy,
    trigger,
    config: CONFIG,
  };
})();
