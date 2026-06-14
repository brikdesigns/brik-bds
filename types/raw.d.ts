// Vite `?raw` imports return the file's text. Declared here (inside the
// tsconfig `types/**` include) so `tsc --noEmit` accepts widget IIFE source
// loaded into browser tests.
declare module '*?raw' {
  const content: string;
  export default content;
}
