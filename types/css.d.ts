declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Vite `?url` suffix — resolves a static asset to a string URL at build time.
// Used for loading CSS into iframe srcdoc (AtmospherePreview) where the URL
// must be resolvable from the static build output.
declare module '*.css?url' {
  const url: string;
  export default url;
}
