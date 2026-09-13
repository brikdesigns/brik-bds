#!/usr/bin/env node
/**
 * Contract test for .github/workflows/stale-citation-sweep.yml (#2541).
 *
 * The sweep's logic lives inline in the workflow as an `actions/github-script`
 * block, so there is nothing importable to unit-test. This harness extracts
 * that exact block and runs it against stubbed `github` / `context` / `core`
 * objects, capturing the comment body it WOULD post. No network, no API calls,
 * no issues written — and, critically, it exercises the shipped source rather
 * than a copy that can drift away from it.
 *
 * `tracked` is stubbed too (the script shells out to `git ls-files`), so the
 * fixtures are a fixed synthetic file list and the assertions do not move when
 * the repo does.
 *
 * Run: node scripts/test-citation-sweep.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the fix can be negative-controlled against the PRE-fix
// workflow — the only way to show these assertions are not vacuous:
//   git show main:.github/workflows/stale-citation-sweep.yml > /tmp/before.yml
//   CITATION_SWEEP_WORKFLOW=/tmp/before.yml node scripts/test-citation-sweep.mjs
// That run MUST fail. If it passes, the test is asserting nothing.
const WORKFLOW = process.env.CITATION_SWEEP_WORKFLOW
  || path.join(ROOT, '.github/workflows/stale-citation-sweep.yml');

// ── Extract the `script: |` block ───────────────────────────────────────────
// Take everything indented under the literal-block scalar and dedent it. A
// brittle-looking parse, but the alternative is duplicating the logic here,
// and a copy that drifts is a test that passes while the gate is broken.
function extractScript() {
  const src = fs.readFileSync(WORKFLOW, 'utf8').split('\n');
  const start = src.findIndex(l => /^\s*script:\s*\|\s*$/.test(l));
  if (start === -1) throw new Error('no `script: |` block found in the workflow');
  const indent = src[start + 1].match(/^\s*/)[0].length;
  const body = [];
  for (let i = start + 1; i < src.length; i++) {
    const line = src[i];
    if (line.trim() !== '' && line.match(/^\s*/)[0].length < indent) break;
    body.push(line.slice(indent));
  }
  return body.join('\n');
}

// The file list every fixture resolves against. Mixed case on purpose — that
// is the whole subject of #2541.
const TRACKED = [
  'components/ui/Card/Card.tsx',
  'components/ui/Card/Card.css',
  'components/ui/Button/Button.tsx',
  'docs-site/content/docs/components/card.mdx',
  'docs-site/content/docs/build-standards/slot-vocabulary.mdx',
  'scripts/lint-mdx-tokens.mjs',
];

// ── Run the extracted script against one synthetic issue ────────────────────
// Returns { body, labeled } — the comment the sweep would post (null if it
// would post none) and whether it would apply needs:citation-fix.
async function runOn(issueBody, { labels = [], tracked = TRACKED } = {}) {
  const code = extractScript();
  let comment = null;
  let labeled = false;

  const issue = { number: 1, body: issueBody, labels: labels.map(name => ({ name })) };

  const github = {
    rest: {
      issues: {
        getLabel: async () => ({}),
        createLabel: async () => ({}),
        addLabels: async () => { labeled = true; },
        removeLabel: async () => { labeled = false; },
        createComment: async ({ body }) => { comment = body; },
        updateComment: async ({ body }) => { comment = body; },
        listComments: () => [],
        listForRepo: () => [],
      },
    },
    paginate: async fn => fn(),
    graphql: async () => ({ repository: {} }),
  };

  const context = {
    repo: { owner: 'brikdesigns', repo: 'brik-bds' },
    eventName: 'issues',
    payload: { action: 'edited', issue },
  };

  const core = {
    info: () => {}, warning: () => {},
    summary: { addHeading() { return this; }, addRaw() { return this; }, write() {} },
  };

  // Stub the two host reads: `git ls-files` and the token registry. Returning
  // no registry puts the sweep on its documented path-only path, which is the
  // half this test is about.
  const requireStub = name => {
    if (name === 'child_process') return { execSync: () => tracked.join('\n') };
    if (name === 'fs') return { existsSync: () => false, readFileSync: () => '' };
    throw new Error(`unexpected require(${name})`);
  };

  const sandbox = { require: requireStub, github, context, core, console };
  // The github-script body uses bare `return`, so it must be wrapped in a
  // function — an async IIFE, since it awaits.
  const fn = vm.runInNewContext(
    `(async () => {\n${code}\n})`,
    vm.createContext(sandbox),
    { filename: 'stale-citation-sweep.yml' },
  );
  await fn();
  return { body: comment, labeled };
}

// ── Assertions ──────────────────────────────────────────────────────────────
let pass = 0, fail = 0;
const failures = [];

function check(label, cond) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; failures.push(label); console.log(`  ✗ ${label}`); }
}

console.log('── stale-citation-sweep: case-mismatch contract (#2541) ──');

// AC-1 + the #2451 repro: a case-only mismatch is reported AS a case fix,
// naming the tracked spelling — never as "Not in git ls-files".
{
  const { body, labeled } = await runOn(
    'See `components/ui/card/Card.tsx` for the slot.',
  );
  check('case-only mismatch produces a comment', body !== null);
  check('names the cited and the tracked spelling',
    !!body && body.includes('`components/ui/card/Card.tsx` → `components/ui/Card/Card.tsx`'));
  check('does NOT claim the file is missing',
    !!body && !body.includes('Not in `git ls-files`'));
  check('headline does not say the file no longer exists',
    !!body && !body.includes('no longer exist'));
  check('still applies the label (actionable)', labeled === true);
}

// AC-2: a genuinely absent path keeps the original message.
{
  const { body } = await runOn('See `components/ui/Ghost/Ghost.tsx`.');
  check('absent path still reports "Not in `git ls-files`"',
    !!body && body.includes('Not in `git ls-files`'));
  check('absent path keeps the "no longer exist" headline',
    !!body && body.includes('no longer exist'));
  check('absent path is not dressed up as a case fix',
    !!body && !body.includes('Wrong case'));
}

// AC-3: two tracked paths differing only by case are ambiguous — report the
// miss rather than guessing a spelling.
{
  const { body } = await runOn('See `components/ui/card/Card.tsx`.', {
    tracked: [...TRACKED, 'components/ui/CARD/Card.tsx'],
  });
  check('ambiguous case key falls back to the dead-path report',
    !!body && body.includes('Not in `git ls-files`'));
  check('ambiguous case key suggests no spelling',
    !!body && !body.includes('Wrong case'));
}

// An exactly-correct citation is silent — the gate must not fire on good input.
{
  const { body } = await runOn('See `components/ui/Card/Card.tsx`.');
  check('exact-case citation posts nothing', body === null);
}

// The docs-route shorthand keeps working, and works case-folded too.
{
  const { body: exact } = await runOn('See `components/card.mdx`.');
  check('docs-route shorthand stays exempt', exact === null);
  const { body: wrongCase } = await runOn('See `components/Card.mdx`.');
  check('docs-route shorthand resolves case-folded',
    wrongCase === null || wrongCase.includes('Wrong case'));
}

// A wrong-case FIRST segment must still be reported — before #2541 it exited
// at the repo-relative test and produced no finding at all.
{
  const { body } = await runOn('See `Components/ui/Card/Card.tsx`.');
  check('wrong-case first segment is reported, not silently dropped',
    !!body && body.includes('`Components/ui/Card/Card.tsx` → `components/ui/Card/Card.tsx`'));
}

// The opt-out still short-circuits everything.
{
  const { body } = await runOn(
    '<!-- citation-sweep:ignore -->\nSee `components/ui/card/Card.tsx`.',
  );
  check('citation-sweep:ignore suppresses the case finding', body === null);
}

// NEGATIVE CONTROL: prove the suite has teeth. Against a tracked list that
// does NOT contain Card.tsx in any casing, the case-fix assertion must fail —
// if it passed here, it would be asserting nothing.
{
  const { body } = await runOn('See `components/ui/card/Card.tsx`.', {
    tracked: ['components/ui/Button/Button.tsx'],
  });
  check('control: with no Card.tsx tracked, no case fix is claimed',
    !!body && !body.includes('Wrong case'));
}

console.log('');
console.log(`── ${pass} passed, ${fail} failed`);
if (fail) {
  failures.forEach(f => console.log(`  → ${f}`));
  process.exit(1);
}
