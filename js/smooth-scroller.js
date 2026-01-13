// Only ONE ScrollSmoother initialization!
if (window.ScrollSmoother) {
  ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 2,
    effects: true
  });
}