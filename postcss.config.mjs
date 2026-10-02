// Breakpoint custom media (ADR-044, #2644). `@custom-media` is not Baseline in
// browsers, so every `@media (--bds-up-*|--bds-down-*)` must be resolved to px
// at build time. postcss-custom-media resolves per file only, so
// postcss-global-data runs FIRST to hand it the definitions in every file.
// Vite applies this config to all imported CSS (Storybook, vitest, build:lib).
import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

export default {
  plugins: [
    postcssGlobalData({ files: ['./tokens/custom-media.css'] }),
    postcssCustomMedia(),
  ],
};
