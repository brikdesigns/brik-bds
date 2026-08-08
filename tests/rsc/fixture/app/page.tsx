// NO 'use client' — this file is a React Server Component, and that is the
// whole point of the fixture. See tests/rsc/README.md.
//
// Everything below imports from the package ROOT (`@brikdesigns/bds`), the way
// consumers actually do. brik-bds#1721 was invisible to every other gate
// precisely because Node-ESM and `tsc` see the real values; only an RSC bundle
// substitutes client references.
import {
  SOCIAL_ICON_PLATFORMS,
  CONTACT_ICON_PLATFORMS,
  SocialIcon,
  ContactIcon,
  Button,
  Tooltip,
  Accordion,
} from '@brikdesigns/bds';

/**
 * Assert a root-exported array is readable as real data on the server.
 *
 * Throwing here fails `next build` during prerender, so the fixture gates
 * itself — no stdout grepping. A client reference reports `typeof 'function'`
 * with `Array.isArray() === false`, which is exactly what shipped in v0.151.0.
 */
function assertServerReadableArray(name: string, value: readonly string[], expected: number) {
  if (!Array.isArray(value)) {
    throw new Error(
      `RSC smoke FAILED — ${name} is not an array in a server component ` +
        `(typeof ${typeof value}). It is reaching the server as a client reference, ` +
        `which means its module carries the 'use client' banner. Add the module to ` +
        `SERVER_SAFE_MODULES in scripts/server-safe-modules.mjs (brik-bds#1721).`,
    );
  }
  if (value.length !== expected) {
    throw new Error(`RSC smoke FAILED — ${name} has ${value.length} entries, expected ${expected}.`);
  }
  // The reported symptom: `.includes` was undefined on the client reference.
  if (typeof value.includes !== 'function') {
    throw new Error(`RSC smoke FAILED — ${name}.includes is not a function.`);
  }
}

export default function Page() {
  assertServerReadableArray('SOCIAL_ICON_PLATFORMS', SOCIAL_ICON_PLATFORMS, 10);
  assertServerReadableArray('CONTACT_ICON_PLATFORMS', CONTACT_ICON_PLATFORMS, 5);

  if (!SOCIAL_ICON_PLATFORMS.includes('youtube')) {
    throw new Error('RSC smoke FAILED — SOCIAL_ICON_PLATFORMS is missing "youtube".');
  }

  return (
    <main>
      <p>social: {SOCIAL_ICON_PLATFORMS.join(',')}</p>
      <p>contact: {CONTACT_ICON_PLATFORMS.join(',')}</p>
      {/* Rendering real components from a server component guards the OTHER
          direction: a module that lost its 'use client' banner but still calls
          a client-only React API fails here with "createContext is not a
          function". Tooltip and Accordion are the context/state-carrying ones. */}
      <SocialIcon platform="youtube" tone="brand" />
      <ContactIcon platform="email" />
      <Button>go</Button>
      <Tooltip content="hi">
        <span>t</span>
      </Tooltip>
      <Accordion items={[{ id: 'a', title: 'A', content: 'body' }]} />
    </main>
  );
}
