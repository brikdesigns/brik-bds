const esbuild = require('esbuild');
const fs = require('fs');

const watch = process.argv.includes('--watch');

const sharedConfig = {
  bundle: true,
  platform: 'browser',
  target: 'es2017',
  logLevel: 'info',
};

async function build() {
  // 1. Bundle main thread (code.ts → dist/code.js)
  await esbuild.build({
    ...sharedConfig,
    entryPoints: ['src/code.ts'],
    outfile: 'dist/code.js',
    format: 'iife',
  });

  // 2. Bundle UI logic (ui.ts → dist/ui-bundle.js)
  await esbuild.build({
    ...sharedConfig,
    entryPoints: ['src/ui.ts'],
    outfile: 'dist/ui-bundle.js',
    format: 'iife',
  });

  // 3. Inline bundled JS into ui.html → dist/ui.html
  const html = fs.readFileSync('src/ui.html', 'utf8');
  const bundle = fs.readFileSync('dist/ui-bundle.js', 'utf8');
  const output = html.replace('/* __INLINE_BUNDLE__ */', bundle);
  fs.writeFileSync('dist/ui.html', output);

  console.log('✓ Build complete → dist/');
}

if (watch) {
  const chokidar = require('chokidar');
  console.log('Watching src/ for changes...');
  chokidar.watch('src/**/*').on('change', (path) => {
    console.log(`Changed: ${path}`);
    build().catch(console.error);
  });
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
