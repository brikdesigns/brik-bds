/**
 * Brik Design System - GSAP ScrollTrigger Effects
 *
 * Premium scroll-based animations using GSAP ScrollTrigger.
 * Provides reusable patterns for scroll choreography.
 *
 * Dependencies:
 *   - GSAP Core (gsap.min.js)
 *   - ScrollTrigger plugin (ScrollTrigger.min.js)
 *
 * CDN (add to HTML):
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
 *
 * Usage:
 *   1. Load GSAP and ScrollTrigger from CDN
 *   2. Load this file
 *   3. Call BrikScrollEffects.init() after DOM ready
 *   4. Add data attributes to elements (see patterns below)
 *
 * Patterns:
 *   - data-scroll-fade     : Fade in on scroll
 *   - data-scroll-reveal   : Reveal with slide up
 *   - data-scroll-parallax : GSAP-powered parallax
 *   - data-scroll-pin      : Pin element while scrolling
 *   - data-scroll-scrub    : Scrubbed animation (ties to scroll)
 *   - data-scroll-scale    : Scale up on scroll
 *   - data-scroll-rotate   : Rotate on scroll
 *   - data-scroll-batch    : Batch stagger animations
 */

(function () {
  'use strict';

  // Check for GSAP
  if (typeof gsap === 'undefined') {
    console.warn('BrikScrollEffects: GSAP not found. Load gsap.min.js first.');
    return;
  }

  // Check for ScrollTrigger
  if (typeof ScrollTrigger === 'undefined') {
    console.warn('BrikScrollEffects: ScrollTrigger not found. Load ScrollTrigger.min.js first.');
    return;
  }

  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Configuration
  const CONFIG = {
    // Default animation settings
    duration: 1,
    ease: 'power2.out',
    stagger: 0.1,

    // ScrollTrigger defaults
    start: 'top 85%',
    end: 'bottom 15%',
    scrubDuration: 1,

    // Parallax
    parallaxSpeed: 0.3,

    // Reduced motion
    respectReducedMotion: true,
  };

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Initialize all scroll effects
   */
  function init(options = {}) {
    const config = { ...CONFIG, ...options };

    if (config.respectReducedMotion && prefersReducedMotion) {
      console.log('BrikScrollEffects: Reduced motion preferred, skipping animations.');
      showAllElements();
      return;
    }

    // Initialize each pattern
    initFadeIn(config);
    initReveal(config);
    initParallax(config);
    initPin(config);
    initScrub(config);
    initScale(config);
    initRotate(config);
    initBatch(config);
    initHorizontalScroll(config);
    initTextSplit(config);
    initScrollDirection();
    initSmartHeader();
    initAntiFlicker();
  }

  /**
   * Show all elements immediately (reduced motion fallback)
   */
  function showAllElements() {
    gsap.set('[data-scroll-fade], [data-scroll-reveal], [data-scroll-scale]', {
      opacity: 1,
      y: 0,
      scale: 1,
      rotation: 0,
    });
  }

  // ============================================================
  // PATTERN: Fade In
  // Usage: <div data-scroll-fade>Content</div>
  // Options: data-scroll-fade="0.5" (custom duration)
  // ============================================================
  function initFadeIn(config) {
    const elements = document.querySelectorAll('[data-scroll-fade]');

    elements.forEach((el) => {
      const duration = parseFloat(el.dataset.scrollFade) || config.duration;

      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration,
          ease: config.ease,
          scrollTrigger: {
            trigger: el,
            start: config.start,
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }

  // ============================================================
  // PATTERN: Reveal (Fade + Slide Up)
  // Usage: <div data-scroll-reveal>Content</div>
  // Options: data-scroll-reveal="50" (custom y offset in px)
  // ============================================================
  function initReveal(config) {
    const elements = document.querySelectorAll('[data-scroll-reveal]');

    elements.forEach((el) => {
      const yOffset = parseFloat(el.dataset.scrollReveal) || 40;

      gsap.fromTo(
        el,
        { opacity: 0, y: yOffset },
        {
          opacity: 1,
          y: 0,
          duration: config.duration,
          ease: config.ease,
          scrollTrigger: {
            trigger: el,
            start: config.start,
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }

  // ============================================================
  // PATTERN: GSAP Parallax
  // Usage: <div data-scroll-parallax>Content</div>
  // Options: data-scroll-parallax="0.5" (speed factor)
  //          data-parallax-direction="up|down" (default: up)
  // ============================================================
  function initParallax(config) {
    const elements = document.querySelectorAll('[data-scroll-parallax]');

    elements.forEach((el) => {
      const speed = parseFloat(el.dataset.scrollParallax) || config.parallaxSpeed;
      const direction = el.dataset.parallaxDirection || 'up';
      const yPercent = direction === 'up' ? -100 * speed : 100 * speed;

      gsap.to(el, {
        yPercent,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // ============================================================
  // PATTERN: Pin Section
  // Usage: <section data-scroll-pin>Pinned content</section>
  // Options: data-scroll-pin="500" (pin duration in px)
  //          data-pin-spacing="true|false" (default: true)
  // ============================================================
  function initPin(config) {
    const elements = document.querySelectorAll('[data-scroll-pin]');

    elements.forEach((el) => {
      const pinDuration = el.dataset.scrollPin || '100%';
      const pinSpacing = el.dataset.pinSpacing !== 'false';

      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: `+=${pinDuration}`,
        pin: true,
        pinSpacing,
      });
    });
  }

  // ============================================================
  // PATTERN: Scrubbed Animation
  // Usage: <div data-scroll-scrub="scale">Content</div>
  // Types: scale, rotate, x, y, opacity
  // Options: data-scrub-value="1.5" (target value)
  //          data-scrub-start="0" (start value)
  // ============================================================
  function initScrub(config) {
    const elements = document.querySelectorAll('[data-scroll-scrub]');

    elements.forEach((el) => {
      const type = el.dataset.scrollScrub || 'y';
      const endValue = parseFloat(el.dataset.scrubValue) || 100;
      const startValue = parseFloat(el.dataset.scrubStart) || 0;

      const animation = {};
      animation[type] = endValue;

      // Set initial state
      gsap.set(el, { [type]: startValue });

      gsap.to(el, {
        ...animation,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-scrub-container]') || el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: config.scrubDuration,
        },
      });
    });
  }

  // ============================================================
  // PATTERN: Scale Up
  // Usage: <div data-scroll-scale>Content</div>
  // Options: data-scroll-scale="1.2" (target scale)
  //          data-scale-from="0.8" (start scale)
  // ============================================================
  function initScale(config) {
    const elements = document.querySelectorAll('[data-scroll-scale]');

    elements.forEach((el) => {
      const targetScale = parseFloat(el.dataset.scrollScale) || 1;
      const fromScale = parseFloat(el.dataset.scaleFrom) || 0.9;

      gsap.fromTo(
        el,
        { scale: fromScale, opacity: 0 },
        {
          scale: targetScale,
          opacity: 1,
          duration: config.duration,
          ease: config.ease,
          scrollTrigger: {
            trigger: el,
            start: config.start,
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }

  // ============================================================
  // PATTERN: Rotate
  // Usage: <div data-scroll-rotate>Content</div>
  // Options: data-scroll-rotate="180" (degrees)
  // ============================================================
  function initRotate(config) {
    const elements = document.querySelectorAll('[data-scroll-rotate]');

    elements.forEach((el) => {
      const rotation = parseFloat(el.dataset.scrollRotate) || 360;

      gsap.to(el, {
        rotation,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // ============================================================
  // PATTERN: Batch Animations (Staggered)
  // Usage: <div data-scroll-batch>
  //          <div class="batch-item">1</div>
  //          <div class="batch-item">2</div>
  //        </div>
  // Options: data-batch-stagger="0.1" (stagger delay)
  //          data-batch-selector=".item" (child selector)
  // ============================================================
  function initBatch(config) {
    const containers = document.querySelectorAll('[data-scroll-batch]');

    containers.forEach((container) => {
      const selector = container.dataset.batchSelector || '.batch-item';
      const stagger = parseFloat(container.dataset.batchStagger) || config.stagger;
      const items = container.querySelectorAll(selector);

      if (items.length === 0) return;

      gsap.set(items, { opacity: 0, y: 30 });

      ScrollTrigger.batch(items, {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: config.duration,
            ease: config.ease,
            stagger,
          });
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            opacity: 0,
            y: 30,
            stagger,
          });
        },
      });
    });
  }

  // ============================================================
  // PATTERN: Horizontal Scroll Section
  // Usage: <section data-scroll-horizontal>
  //          <div class="horizontal-track">
  //            <div class="panel">1</div>
  //            <div class="panel">2</div>
  //          </div>
  //        </section>
  // ============================================================
  function initHorizontalScroll(config) {
    const sections = document.querySelectorAll('[data-scroll-horizontal]');

    sections.forEach((section) => {
      const track = section.querySelector('.horizontal-track');
      if (!track) return;

      const panels = track.querySelectorAll('.panel');
      if (panels.length === 0) return;

      // Calculate total scroll distance
      const totalWidth = track.scrollWidth - section.offsetWidth;

      gsap.to(track, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${totalWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });
    });
  }

  // ============================================================
  // PATTERN: Text Split Reveal
  // Usage: <h1 data-scroll-text-split>Headline</h1>
  // Options: data-split-type="chars|words|lines" (default: words)
  //          data-split-stagger="0.05" (stagger delay)
  // Note: Requires SplitText plugin OR manual splitting
  // ============================================================
  function initTextSplit(config) {
    const elements = document.querySelectorAll('[data-scroll-text-split]');

    elements.forEach((el) => {
      const splitType = el.dataset.splitType || 'words';
      const stagger = parseFloat(el.dataset.splitStagger) || 0.03;

      // Simple word splitting (no SplitText plugin required)
      if (splitType === 'words') {
        const text = el.textContent;
        const words = text.split(' ');
        el.innerHTML = words
          .map((word) => `<span class="split-word" style="display:inline-block">${word}</span>`)
          .join(' ');

        const wordSpans = el.querySelectorAll('.split-word');
        gsap.set(wordSpans, { opacity: 0, y: 20 });

        gsap.to(wordSpans, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Character splitting
      if (splitType === 'chars') {
        const text = el.textContent;
        const chars = text.split('');
        el.innerHTML = chars
          .map((char) =>
            char === ' '
              ? ' '
              : `<span class="split-char" style="display:inline-block">${char}</span>`
          )
          .join('');

        const charSpans = el.querySelectorAll('.split-char');
        gsap.set(charSpans, { opacity: 0, y: 10 });

        gsap.to(charSpans, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: stagger * 0.5,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });
  }

  // ============================================================
  // PATTERN: Scroll Direction Tracking
  // Adds data-scroll-direction="up|down" to body
  // Usage: Use CSS to show/hide elements based on scroll direction
  // Example: body[data-scroll-direction="down"] .header { opacity: 0; }
  // ============================================================
  function initScrollDirection() {
    // Set initial direction
    document.body.dataset.scrollDirection = 'up';
    document.body.dataset.scrolledPast = 'false';

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const direction = self.direction === 1 ? 'down' : 'up';
        document.body.dataset.scrollDirection = direction;

        // Track if scrolled past threshold (e.g., 100px)
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        document.body.dataset.scrolledPast = scrollY > 100 ? 'true' : 'false';
      },
    });
  }

  // ============================================================
  // PATTERN: Smart Header (Hide on Scroll Down, Show on Scroll Up)
  // Usage: <header data-scroll-header>...</header>
  // Options:
  //   data-header-threshold="100"  (px before hiding starts)
  //   data-header-delay="2000"     (ms delay before hiding, 0 = immediate)
  //   data-header-utility          (add to sibling utility nav above)
  //
  // Dual-Nav Example (utility nav + main nav):
  //   <nav data-scroll-header-utility>Utility nav</nav>
  //   <nav data-scroll-header data-header-delay="2000">Main nav</nav>
  //
  // Behavior with utility nav:
  //   - Utility nav scrolls away naturally (static positioning)
  //   - Main nav is position:fixed, top adjusts to sit below utility nav
  //   - Once scrolled past utility nav, main nav fixes to viewport top
  //   - Hides after delay on scroll-down, reappears on scroll-up
  //   - Stops at utility nav bottom edge when scrolling back to top
  // ============================================================
  function initSmartHeader() {
    const headers = document.querySelectorAll('[data-scroll-header]');

    headers.forEach((header) => {
      const threshold = parseFloat(header.dataset.headerThreshold) || 100;
      const hideDelay = parseFloat(header.dataset.headerDelay) || 0;
      const utilityNav = document.querySelector('[data-scroll-header-utility]');
      const utilityNavHeight = utilityNav ? utilityNav.offsetHeight : 0;

      let isHidden = false;
      let hideTimer = null;
      let lastDirection = 0;

      // Insert spacer to prevent content jump when header is position:fixed
      const spacer = document.createElement('div');
      spacer.className = 'nav-spacer';
      spacer.style.height = header.offsetHeight + 'px';
      header.parentNode.insertBefore(spacer, header.nextSibling);

      // Set initial position below utility nav
      gsap.set(header, { y: 0 });
      if (utilityNav) {
        header.style.top = utilityNavHeight + 'px';
      }

      function showHeader() {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        if (isHidden) {
          gsap.to(header, { y: 0, duration: 0.3, ease: 'power2.out' });
          isHidden = false;
        }
      }

      function hideHeader() {
        if (!isHidden) {
          gsap.to(header, {
            y: -header.offsetHeight,
            duration: 0.3,
            ease: 'power2.out',
          });
          isHidden = true;
        }
      }

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const scrollY = self.scroll();
          const direction = self.direction; // 1 = down, -1 = up

          // Dynamic top position when utility nav is present
          if (utilityNav) {
            if (scrollY < utilityNavHeight) {
              // Utility nav still partially visible - position below it
              header.style.top = (utilityNavHeight - scrollY) + 'px';
              header.classList.remove('nav-scrolled');
              showHeader();
              lastDirection = 0;
              return;
            } else {
              // Utility nav scrolled away - fix to top
              header.style.top = '0px';
              header.classList.add('nav-scrolled');
            }
          }

          // No utility nav: use threshold-based logic
          if (!utilityNav && scrollY <= threshold) {
            showHeader();
            header.classList.remove('nav-scrolled');
            lastDirection = 0;
            return;
          } else if (!utilityNav) {
            header.classList.add('nav-scrolled');
          }

          // Direction change detection
          if (direction !== lastDirection) {
            lastDirection = direction;

            if (direction === 1) {
              // Scrolling DOWN - hide (with optional delay)
              if (hideDelay > 0) {
                if (hideTimer) clearTimeout(hideTimer);
                hideTimer = setTimeout(hideHeader, hideDelay);
              } else {
                hideHeader();
              }
            } else {
              // Scrolling UP - show immediately
              showHeader();
            }
          }
        },
      });

      // Handle resize - recalculate utility nav height and spacer
      window.addEventListener('resize', function () {
        if (utilityNav) {
          var newHeight = utilityNav.offsetHeight;
          // Recalculate if not scrolled past utility
          var scrollY = window.pageYOffset || document.documentElement.scrollTop;
          if (scrollY < newHeight) {
            header.style.top = (newHeight - scrollY) + 'px';
          }
        }
        spacer.style.height = header.offsetHeight + 'px';
      });
    });
  }

  // ============================================================
  // PATTERN: Page Load Reveal (Anti-Flicker)
  // Prevents content flash before animations are ready
  // Usage: Add class="anti-flicker" to elements, call revealPage() when ready
  // ============================================================
  function initAntiFlicker() {
    // Hide anti-flicker elements until ready
    const style = document.createElement('style');
    style.id = 'brik-anti-flicker';
    style.textContent = `
      .anti-flicker { visibility: hidden; opacity: 0; }
      .page-loaded .anti-flicker { visibility: visible; }
    `;
    document.head.appendChild(style);
  }

  function revealPage(options = {}) {
    const duration = options.duration || 0.6;
    const stagger = options.stagger || 0.1;
    const ease = options.ease || 'power2.out';

    // Mark page as loaded
    document.body.classList.add('page-loaded');

    // Animate anti-flicker elements
    const elements = document.querySelectorAll('.anti-flicker');
    if (elements.length > 0) {
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease,
        onStart: () => {
          elements.forEach((el) => (el.style.visibility = 'visible'));
        },
      });
    }
  }

  // ============================================================
  // UTILITY: Create Custom ScrollTrigger
  // For advanced use cases not covered by patterns
  // ============================================================
  function createScrollTrigger(options) {
    return ScrollTrigger.create(options);
  }

  // ============================================================
  // UTILITY: Create Timeline with ScrollTrigger
  // For complex sequenced animations
  // ============================================================
  function createScrollTimeline(trigger, options = {}) {
    return gsap.timeline({
      scrollTrigger: {
        trigger,
        start: options.start || 'top center',
        end: options.end || 'bottom center',
        scrub: options.scrub !== undefined ? options.scrub : 1,
        pin: options.pin || false,
        ...options,
      },
    });
  }

  /**
   * Refresh ScrollTrigger (call after DOM changes)
   */
  function refresh() {
    ScrollTrigger.refresh();
  }

  /**
   * Kill all ScrollTriggers
   */
  function destroy() {
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }

  // Expose API
  window.BrikScrollEffects = {
    init,
    refresh,
    destroy,
    revealPage,
    createScrollTrigger,
    createScrollTimeline,
    config: CONFIG,
    gsap, // Expose gsap for custom animations
    ScrollTrigger, // Expose ScrollTrigger for custom triggers
  };
})();
