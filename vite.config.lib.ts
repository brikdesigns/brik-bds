import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, isAbsolute } from 'path';

// 'use client' banner — Next.js App Router requires this directive for modules
// that call React.createContext, useState, etc. Without it, SSR fails with
// "createContext is not a function". Under preserveModules it lands on every
// emitted module (whole bundle is client today; per-module is consistent).
const USE_CLIENT_BANNER = "'use client';";

// Rename the extracted CSS asset to a stable `styles.css` (consumers import
// `@brikdesigns/bds/styles.css`). cssCodeSplit is false in lib mode, so a
// single stylesheet is emitted regardless of preserveModules.
const assetFileNames = (assetInfo: { name?: string }) => {
  if (assetInfo.name?.endsWith('.css')) return 'styles.css';
  return assetInfo.name ?? 'assets/[name][extname]';
};

const globals = {
  react: 'React',
  'react/jsx-runtime': 'ReactJSXRuntime',
  'react-dom': 'ReactDOM',
};

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib-entry.ts'),
    },
    rollupOptions: {
      // Externalize every node_modules dependency — do NOT bundle any of them
      // into the per-module output. Consumers install BDS's runtime deps
      // (react, @iconify/react, @radix-ui/*, lottie-*, and their transitives)
      // through npm's dependency tree, so inlining them here would duplicate
      // code in the consumer bundle and defeat tree-shaking. Externalizing also
      // keeps lottie-react/lottie-web (UMD/CJS) out of the ESM output, which is
      // what the ESM-no-require gate enforces (scripts/check-esm-bundle.mjs) —
      // bundling a CJS dep inlines a dynamic `require()` that ESM-prerender
      // consumers (turbopack / Astro) reject. Only relative/absolute (BDS's own
      // source) and `@bds/*` aliases stay in the graph.
      external: (id) => {
        if (id.startsWith('.') || id.startsWith('/') || isAbsolute(id)) return false;
        if (id.startsWith('@bds/')) return false; // local alias → resolved to source
        return true; // every bare specifier is a node_modules dependency
      },
      // Per-module output (#1060) — emit each source module as its own file
      // preserving the source tree, so consumers tree-shake unused components
      // instead of pulling the whole graph into their shared chunk. Two outputs:
      // ESM (`.mjs`, the tree-shakeable path Next.js/Astro resolve via `import`)
      // and CJS (`.cjs` under `require`) — both preserved from the same entry.
      output: [
        {
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: '.',
          entryFileNames: '[name].mjs',
          banner: USE_CLIENT_BANNER,
          globals,
          assetFileNames,
        },
        {
          format: 'cjs',
          preserveModules: true,
          preserveModulesRoot: '.',
          entryFileNames: '[name].cjs',
          exports: 'named',
          banner: USE_CLIENT_BANNER,
          globals,
          assetFileNames,
        },
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
  },
  resolve: {
    alias: {
      '@bds/tokens': resolve(__dirname, 'tokens'),
      '@bds/components': resolve(__dirname, 'components'),
    },
  },
});
