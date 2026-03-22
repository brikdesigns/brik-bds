/**
 * Brik Design System - Premium Scroll Compositions
 *
 * Advanced scroll-driven effects that chain GSAP primitives into
 * signature website experiences. These are the "hero moves" from
 * sites like daylightcomputer.com, realfood.gov, and legend.xyz.
 *
 * Dependencies:
 *   - GSAP Core (gsap.min.js)
 *   - ScrollTrigger plugin (ScrollTrigger.min.js)
 *   - premium-effects.css (companion styles)
 *   - gsap-scroll-effects.js (loaded first for BrikScrollEffects base)
 *
 * CDN (add to HTML):
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
 *
 * Usage:
 *   1. Load GSAP + ScrollTrigger from CDN
 *   2. Load gsap-scroll-effects.js (base layer)
 *   3. Load this file
 *   4. Call BrikPremium.init() after DOM ready
 *   5. Add data attributes to elements (see patterns below)
 *
 * Compositions:
 *   - data-premium-hero         : Orchestrated hero entrance sequence
 *   - data-premium-morph        : Background color morph between sections
 *   - data-premium-counter      : Animated number counting on scroll
 *   - data-premium-magnetic     : Magnetic cursor attraction
 *   - data-premium-spotlight    : Cursor-following spotlight
 *   - data-premium-marquee      : Scroll-speed-aware marquee
 *   - data-premium-video-scrub  : Video playback tied to scroll
 *   - data-premium-stagger-lines: Line-by-line text reveal
 *   - data-premium-image-reveal : Cinematic image unveil
 *   - data-premium-tabs         : Scroll-activated tab/content switching
 */

(function () {
  'use strict';

  // Guard: GSAP required
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('BrikPremium: GSAP + ScrollTrigger required. Load them first.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Reduced motion check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Configuration
  const CONFIG = {
    heroStagger: 0.15,
    heroDuration: 0.8,
    heroEase: 'power3.out',
    counterDuration: 2,
    magneticStrength: 0.3,
    magneticRadius: 200,
    spotlightSize: 600,
  };

  /**
   * Initialize all premium compositions
   */
  function init(options = {}) {
    const config = { ...CONFIG, ...options };

    if (prefersReducedMotion) {
      showAllElements();
      return;
    }

    initHeroSequence(config);
    initBackgroundMorph(config);
    initCounters(config);
    initMagnetic(config);
    initCursorSpotlight(config);
    initScrollMarquee(config);
    initVideoScrub(config);
    initStaggerLines(config);
    initImageReveal(config);
    initScrollTabs(config);
  }

  /**
   * Reduced motion fallback
   */
  function showAllElements() {
    gsap.set('[data-premium-hero] > *', { opacity: 1, y: 0, scale: 1 });
    gsap.set('.counter', { opacity: 1 });

    // Make clip reveals visible
    document.querySelectorAll('[data-premium-image-reveal]').forEach((el) => {
      el.classList.add('is-visible');
    });
  }

  // ============================================================
  // COMPOSITION: Hero Entrance Sequence
  //
  // Orchestrated page-load reveal with staggered children.
  // Inspired by: daylightcomputer.com hero, linear.app landing
  //
  // Usage:
  //   <section data-premium-hero>
  //     <span data-hero-badge>New</span>
  //     <h1 data-hero-headline>Big headline</h1>
  //     <p data-hero-body>Supporting text</p>
  //     <div data-hero-cta>
  //       <a href="#">Primary</a>
  //       <a href="#">Secondary</a>
  //     </div>
  //     <div data-hero-media>
  //       <img src="hero.jpg" alt="...">
  //     </div>
  //   </section>
  //
  // Optional: data-hero-delay="0.5" on container for delayed start
  // ============================================================
  function initHeroSequence(config) {
    const heroes = document.querySelectorAll('[data-premium-hero]');

    heroes.forEach((hero) => {
      const delay = parseFloat(hero.dataset.heroDelay) || 0.2;

      // Gather hero elements in order
      const elements = [];
      const badge = hero.querySelector('[data-hero-badge]');
      const headline = hero.querySelector('[data-hero-headline]');
      const body = hero.querySelector('[data-hero-body]');
      const cta = hero.querySelector('[data-hero-cta]');
      const media = hero.querySelector('[data-hero-media]');

      if (badge) elements.push({ el: badge, from: { opacity: 0, y: 15, scale: 0.9 } });
      if (headline) elements.push({ el: headline, from: { opacity: 0, y: 30 } });
      if (body) elements.push({ el: body, from: { opacity: 0, y: 20 } });
      if (cta) elements.push({ el: cta, from: { opacity: 0, y: 15 } });
      if (media) elements.push({ el: media, from: { opacity: 0, y: 40, scale: 0.97 } });

      // Also gather any data-hero-order elements for custom sequencing
      const ordered = hero.querySelectorAll('[data-hero-order]');
      ordered.forEach((el) => {
        if (!el.dataset.heroBadge && !el.dataset.heroHeadline &&
            !el.dataset.heroBody && !el.dataset.heroCta &&
            !el.dataset.heroMedia) {
          elements.push({ el, from: { opacity: 0, y: 20 } });
        }
      });

      if (elements.length === 0) return;

      // Set initial states
      elements.forEach(({ el, from }) => gsap.set(el, from));

      // Build timeline
      const tl = gsap.timeline({ delay });

      elements.forEach(({ el, from }, i) => {
        const to = {};
        Object.keys(from).forEach((key) => {
          to[key] = key === 'opacity' ? 1 : key === 'scale' ? 1 : 0;
        });
        to.duration = config.heroDuration;
        to.ease = config.heroEase;

        tl.to(el, to, i * config.heroStagger);
      });
    });
  }

  // ============================================================
  // COMPOSITION: Background Color Morph
  //
  // Sections that transition background/text color as you scroll.
  // Inspired by: daylightcomputer.com cream-to-night transitions
  //
  // Usage:
  //   <section data-premium-morph class="morph-light-to-dark">
  //     Content here
  //   </section>
  //
  // Or with custom colors:
  //   <section data-premium-morph
  //            style="--bg-from:#fff; --bg-to:#0a0a0a;
  //                   --text-from:#111; --text-to:#fff">
  //
  // Options:
  //   data-morph-start="top center" (ScrollTrigger start)
  //   data-morph-end="bottom center" (ScrollTrigger end)
  // ============================================================
  function initBackgroundMorph(config) {
    const sections = document.querySelectorAll('[data-premium-morph]');

    sections.forEach((section) => {
      const start = section.dataset.morphStart || 'top 80%';
      const end = section.dataset.morphEnd || 'top 20%';

      gsap.to(section, {
        '--morph-progress': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start,
          end,
          scrub: true,
        },
      });
    });
  }

  // ============================================================
  // COMPOSITION: Counter / Stats Animation
  //
  // Numbers that count up when scrolled into view.
  // Inspired by: legend.xyz numbered sections, stat blocks
  //
  // Usage:
  //   <span data-premium-counter="500">0</span>
  //   <span data-premium-counter="98" data-counter-suffix="%">0</span>
  //   <span data-premium-counter="3.5" data-counter-prefix="$"
  //         data-counter-decimals="1">0</span>
  //
  // Options:
  //   data-counter-prefix="$" (text before number)
  //   data-counter-suffix="%" (text after number)
  //   data-counter-decimals="0" (decimal places, default: 0)
  //   data-counter-duration="2" (seconds, default: 2)
  //   data-counter-separator="true" (thousands separator)
  // ============================================================
  function initCounters(config) {
    const counters = document.querySelectorAll('[data-premium-counter]');

    counters.forEach((el) => {
      const target = parseFloat(el.dataset.premiumCounter);
      const prefix = el.dataset.counterPrefix || '';
      const suffix = el.dataset.counterSuffix || '';
      const decimals = parseInt(el.dataset.counterDecimals) || 0;
      const duration = parseFloat(el.dataset.counterDuration) || config.counterDuration;
      const useSeparator = el.dataset.counterSeparator === 'true';

      const obj = { value: 0 };

      gsap.to(obj, {
        value: target,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          let display = decimals > 0
            ? obj.value.toFixed(decimals)
            : Math.round(obj.value).toString();

          if (useSeparator) {
            const parts = display.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            display = parts.join('.');
          }

          el.textContent = prefix + display + suffix;
        },
      });
    });
  }

  // ============================================================
  // COMPOSITION: Magnetic Hover
  //
  // Elements that subtly move toward the cursor on hover.
  // Inspired by: stripe.com buttons, vercel.com CTAs
  //
  // Usage:
  //   <button data-premium-magnetic class="magnetic">Click me</button>
  //
  // Options:
  //   data-magnetic-strength="0.3" (0-1, how far it moves)
  //   data-magnetic-radius="200" (px, activation distance)
  // ============================================================
  function initMagnetic(config) {
    const elements = document.querySelectorAll('[data-premium-magnetic]');

    // Skip on touch devices
    if ('ontouchstart' in window) return;

    elements.forEach((el) => {
      const strength = parseFloat(el.dataset.magneticStrength) || config.magneticStrength;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * strength,
          y: y * strength,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  // ============================================================
  // COMPOSITION: Cursor Spotlight
  //
  // Section reveals a radial gradient following the cursor.
  // Inspired by: dark sections on stripe.com, linear.app
  //
  // Usage:
  //   <section data-premium-spotlight class="cursor-spotlight">
  //     Dark content
  //   </section>
  // ============================================================
  function initCursorSpotlight(config) {
    const sections = document.querySelectorAll('[data-premium-spotlight]');

    if ('ontouchstart' in window) return;

    sections.forEach((section) => {
      section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        section.style.setProperty('--cursor-x', (e.clientX - rect.left) + 'px');
        section.style.setProperty('--cursor-y', (e.clientY - rect.top) + 'px');
      });
    });
  }

  // ============================================================
  // COMPOSITION: Scroll-Speed Marquee
  //
  // Marquee that speeds up when scrolling, slows when idle.
  // Inspired by: agency sites, portfolio hero sections
  //
  // Usage:
  //   <div data-premium-marquee>
  //     <div class="marquee">
  //       <div class="marquee-track">
  //         <span>Text&nbsp;&nbsp;&nbsp;</span>
  //         <span>Text&nbsp;&nbsp;&nbsp;</span>
  //         <!-- Duplicate content for seamless loop -->
  //       </div>
  //     </div>
  //   </div>
  //
  // Options:
  //   data-marquee-speed-factor="2" (scroll speed multiplier)
  // ============================================================
  function initScrollMarquee(config) {
    const marquees = document.querySelectorAll('[data-premium-marquee]');

    marquees.forEach((container) => {
      const track = container.querySelector('.marquee-track');
      if (!track) return;

      const speedFactor = parseFloat(container.dataset.marqueeSpeedFactor) || 2;
      let baseSpeed = parseFloat(getComputedStyle(track).animationDuration) || 30;

      ScrollTrigger.create({
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          // Speed up marquee based on scroll velocity
          const velocity = Math.abs(self.getVelocity());
          const speedUp = Math.min(velocity / 1000, speedFactor);
          const newDuration = Math.max(baseSpeed / (1 + speedUp), baseSpeed * 0.3);
          track.style.animationDuration = newDuration + 's';
        },
        onLeave: () => {
          track.style.animationDuration = baseSpeed + 's';
        },
        onLeaveBack: () => {
          track.style.animationDuration = baseSpeed + 's';
        },
      });
    });
  }

  // ============================================================
  // COMPOSITION: Scroll-Scrubbed Video
  //
  // Video playback position tied to scroll. Apple-style product reveals.
  // Inspired by: apple.com product pages, daylightcomputer.com
  //
  // Usage:
  //   <div data-premium-video-scrub class="scrub-video-container"
  //        data-scrub-pin="true">
  //     <video muted playsinline preload="auto">
  //       <source src="product.mp4" type="video/mp4">
  //     </video>
  //   </div>
  //
  // Options:
  //   data-scrub-pin="true" (pin section while scrubbing)
  //   data-scrub-distance="200vh" (scroll distance for full video)
  // ============================================================
  function initVideoScrub(config) {
    const containers = document.querySelectorAll('[data-premium-video-scrub]');

    containers.forEach((container) => {
      const video = container.querySelector('video');
      if (!video) return;

      const shouldPin = container.dataset.scrubPin === 'true';
      const distance = container.dataset.scrubDistance || '200vh';

      // Wait for video metadata
      const setup = () => {
        const duration = video.duration;
        if (!duration || isNaN(duration)) return;

        ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: `+=${distance}`,
          pin: shouldPin,
          scrub: 0.5,
          onUpdate: (self) => {
            video.currentTime = self.progress * duration;
          },
        });
      };

      if (video.readyState >= 1) {
        setup();
      } else {
        video.addEventListener('loadedmetadata', setup, { once: true });
      }
    });
  }

  // ============================================================
  // COMPOSITION: Stagger Lines
  //
  // Text blocks where each line reveals sequentially.
  // Inspired by: editorial layouts, daylightcomputer.com body copy
  //
  // Usage:
  //   <div data-premium-stagger-lines>
  //     <p>Line one of text</p>
  //     <p>Line two of text</p>
  //     <p>Line three of text</p>
  //   </div>
  //
  // Options:
  //   data-stagger-delay="0.1" (delay between lines)
  //   data-stagger-selector="p" (child selector, default: direct children)
  // ============================================================
  function initStaggerLines(config) {
    const containers = document.querySelectorAll('[data-premium-stagger-lines]');

    containers.forEach((container) => {
      const selector = container.dataset.staggerSelector || ':scope > *';
      const delay = parseFloat(container.dataset.staggerDelay) || 0.08;
      const lines = container.querySelectorAll(selector);

      if (lines.length === 0) return;

      gsap.set(lines, { opacity: 0, y: 20 });

      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: delay,
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  // ============================================================
  // COMPOSITION: Cinematic Image Reveal
  //
  // Images that unveil with clip-path + zoom + optional parallax.
  // Inspired by: editorial photography reveals, luxury brand sites
  //
  // Usage:
  //   <div data-premium-image-reveal class="image-reveal">
  //     <img src="photo.jpg" alt="...">
  //   </div>
  //
  // Options:
  //   data-reveal-type="rise|curtain|circle|wipe" (default: rise)
  //   data-reveal-duration="1.2" (seconds)
  // ============================================================
  function initImageReveal(config) {
    const reveals = document.querySelectorAll('[data-premium-image-reveal]');

    reveals.forEach((container) => {
      const img = container.querySelector('img, video');
      if (!img) return;

      const type = container.dataset.revealType || 'rise';
      const duration = parseFloat(container.dataset.revealDuration) || 1.2;

      // Map type to clip-path animation
      const clipPaths = {
        rise:    { from: 'inset(100% 0 0 0)',    to: 'inset(0 0 0 0)' },
        curtain: { from: 'inset(0 50% 0 50%)',   to: 'inset(0 0 0 0)' },
        circle:  { from: 'circle(0% at 50% 50%)', to: 'circle(75% at 50% 50%)' },
        wipe:    { from: 'inset(0 100% 0 0)',     to: 'inset(0 0 0 0)' },
      };

      const clip = clipPaths[type] || clipPaths.rise;

      gsap.set(container, { clipPath: clip.from });
      gsap.set(img, { scale: 1.2 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tl.to(container, {
        clipPath: clip.to,
        duration,
        ease: 'power3.inOut',
      })
      .to(img, {
        scale: 1,
        duration: duration * 1.2,
        ease: 'power2.out',
      }, 0);
    });
  }

  // ============================================================
  // COMPOSITION: Scroll-Activated Tabs
  //
  // Content sections that switch as you scroll through a pinned area.
  // Inspired by: daylightcomputer.com feature explorer, Apple product pages
  //
  // Usage:
  //   <section data-premium-tabs>
  //     <div class="tabs-nav">
  //       <button class="tab-trigger" data-tab="0">Reading</button>
  //       <button class="tab-trigger" data-tab="1">Writing</button>
  //       <button class="tab-trigger" data-tab="2">Drawing</button>
  //     </div>
  //     <div class="tabs-content">
  //       <div class="tab-panel" data-tab-panel="0">Panel 1</div>
  //       <div class="tab-panel" data-tab-panel="1">Panel 2</div>
  //       <div class="tab-panel" data-tab-panel="2">Panel 3</div>
  //     </div>
  //   </section>
  //
  // Options:
  //   data-tab-pin-distance="300vh" (total scroll distance)
  // ============================================================
  function initScrollTabs(config) {
    const sections = document.querySelectorAll('[data-premium-tabs]');

    sections.forEach((section) => {
      const triggers = section.querySelectorAll('.tab-trigger');
      const panels = section.querySelectorAll('.tab-panel');
      const distance = section.dataset.tabPinDistance || (panels.length * 100) + 'vh';

      if (triggers.length === 0 || panels.length === 0) return;

      // Set initial state: first panel visible, rest hidden
      panels.forEach((panel, i) => {
        gsap.set(panel, {
          opacity: i === 0 ? 1 : 0,
          position: i === 0 ? 'relative' : 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        });
      });

      // Add active class to first trigger
      if (triggers[0]) triggers[0].classList.add('is-active');

      // Create pinned ScrollTrigger with panel switching
      const segmentSize = 1 / panels.length;

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${distance}`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const activeIndex = Math.min(
            Math.floor(progress / segmentSize),
            panels.length - 1
          );

          panels.forEach((panel, i) => {
            const isActive = i === activeIndex;
            gsap.set(panel, {
              opacity: isActive ? 1 : 0,
              position: isActive ? 'relative' : 'absolute',
            });
          });

          triggers.forEach((trigger, i) => {
            trigger.classList.toggle('is-active', i === activeIndex);
          });
        },
      });
    });
  }

  // ============================================================
  // UTILITY: Destroy all premium effects
  // ============================================================
  function destroy() {
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }

  /**
   * Refresh ScrollTrigger (call after DOM changes)
   */
  function refresh() {
    ScrollTrigger.refresh();
  }

  // Expose API
  window.BrikPremium = {
    init,
    refresh,
    destroy,
    config: CONFIG,
  };
})();
