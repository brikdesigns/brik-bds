// Minimal ambient `process.env.NODE_ENV` for the React-library dev-warning
// idiom. BDS ships un-minified with no `define`, so `process.env.NODE_ENV`
// survives to the published dist for the CONSUMER's bundler (webpack / Next /
// Vite) to replace at their build — the standard guard React itself uses to
// dead-code-eliminate dev-only warnings in production. Declared here (not via
// @types/node) so a browser-targeted lib does not pull the whole node global
// surface into scope. See ThemeProvider's offline-glyph gate (brik-bds#2253).
declare const process: {
  env: {
    NODE_ENV?: string;
  };
};
