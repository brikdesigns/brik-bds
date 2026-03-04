import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib-entry.ts'),
      name: 'BrikBDS',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.esm.js' : 'index.cjs.js',
    },
    rollupOptions: {
      // Externalize peer dependencies — do NOT bundle React or FontAwesome
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        '@fortawesome/react-fontawesome',
        '@fortawesome/free-solid-svg-icons',
        '@fortawesome/fontawesome-svg-core',
      ],
      output: {
        globals: {
          'react': 'React',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react-dom': 'ReactDOM',
        },
        // Rename CSS output to styles.css
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'styles.css';
          return assetInfo.name ?? 'assets/[name][extname]';
        },
      },
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
