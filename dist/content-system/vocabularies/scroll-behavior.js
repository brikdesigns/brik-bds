/**
 * Scroll Behavior — how the site header responds to user scroll.
 *
 * Paired with NAV_ARCHETYPE_VALUES on the BCS industry pack and
 * consumed by the BDS `<SiteHeader>` component's runtime script.
 *
 * Behavior semantics:
 *
 *   transparent-top-frosted-past-80
 *     Over-hero transparent at load; backdrop-filter(blur 18px) +
 *     rgba(0,0,0,0.78) past 80px scrollY. Hides on scroll-down past
 *     120px, reveals on scroll-up. The editorial default — lets hero
 *     photography dominate first impression while keeping the header
 *     within a reach for return navigation.
 *
 *   sticky-solid
 *     Always visible, always solid background, never hides. Predictable
 *     for utility-dense sites where users rely on the nav to navigate
 *     between catalog states (listings, filters, specialty pages).
 *
 *   reveal-on-scroll
 *     Solid background. Visible at top, hides immediately on scroll-down
 *     past 120px, reveals on scroll-up. Single-CTA sites where chrome
 *     should get out of the way during content consumption.
 *
 *   hide-on-scroll
 *     Transparent or solid (archetype decides), hides on scroll-down
 *     past 80px, no reveal until the user hits the top of the page.
 *     Aggressive — only use for portfolio / artist sites where the
 *     work demands the full viewport.
 */
export const SCROLL_BEHAVIOR_VALUES = [
    'transparent-top-frosted-past-80',
    'sticky-solid',
    'reveal-on-scroll',
    'hide-on-scroll',
];
export const isScrollBehavior = (value) => SCROLL_BEHAVIOR_VALUES.includes(value);
//# sourceMappingURL=scroll-behavior.js.map