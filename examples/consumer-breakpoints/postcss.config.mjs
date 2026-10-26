// Consumer recipe — resolve BDS breakpoint custom media in your own CSS.
//   npm i -D postcss postcss-custom-media @csstools/postcss-global-data
// postcss-global-data loads the @custom-media definitions without emitting them,
// so only the resolved @media conditions reach your output.
import { createRequire } from 'node:module';
import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

// global-data reads file paths, not package specifiers — resolve through the
// package's `exports` map so the path survives hoisting and workspaces.
const customMedia = createRequire(import.meta.url).resolve('@brikdesigns/bds/custom-media.css');

export default {
  plugins: [
    postcssGlobalData({ files: [customMedia] }),
    postcssCustomMedia(),
  ],
};
