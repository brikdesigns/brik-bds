import { useEffect, useState } from 'react';

/**
 * Track `prefers-reduced-motion: reduce`, reacting to live changes.
 *
 * Starts `false` and corrects in an effect rather than reading `matchMedia`
 * during render: the server has no `matchMedia`, and a first client render that
 * disagreed with the server's would hydrate mismatched. Every consumer must
 * therefore treat the first paint as "motion allowed" and stop on the effect —
 * which is why the components using this also set their non-animated state in
 * CSS via `@media (prefers-reduced-motion: reduce)`, where it applies with no
 * JS at all.
 *
 * Listens for change so a person toggling the OS setting is honoured without a
 * reload, which is the case a one-shot `matchMedia().matches` read misses.
 *
 * Duplicated verbatim inside MediaTabs.tsx and SyncedMediaSteps.tsx, which
 * predate this module; migrating those two is a separate change (they ship
 * today and this PR does not touch them).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
