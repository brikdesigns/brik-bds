/**
 * Proof that lint-naming-canon actually fails, one planted violation per rule.
 *
 * ADR-033 § Enforcement requires exactly this: "Each rule below must be
 * demonstrated failing on a planted violation. A rule that only passes on the
 * current tree is not evidence it works." Every rule therefore gets a sabotage
 * case, and the fixture is asserted clean first so a failure can only come from
 * the sabotage.
 *
 * Four cases are regression guards for over-reach found while building the gate,
 * and they matter as much as the sabotage cases — a gate that flags correct code
 * gets suppressed, and a suppressed gate enforces nothing:
 *   • `--color-blue-light`   a colour tail is a role, not a step (§ 3)
 *   • `--font-weight-bold`   `bold` is font-weight's CSS keyword, not a step
 *   • `--border-width-thin`  longest-match: a property slot, NOT the `border`
 *                            colour purpose — this one silently vanished from a
 *                            passing run mid-build
 *   • `--font-family-body`   `Poppins` vs `Poppins, sans-serif` is one type
 */

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GATE = path.join(HERE, '..', 'lint-naming-canon.mjs');
const REPO = path.join(HERE, '..', '..');

/**
 * A registry that is clean under all five rules. Deliberately includes the
 * shapes the gate must NOT flag, so an over-reach shows up as a fixture failure
 * rather than as a passing test with a quiet false positive.
 */
const CLEAN_TOKENS = `:root {
  /* Colour intent formula — the tail is a role, § 3 does not reach it. */
  --color-blue-500: #2f6fed;
  --color-blue-light: #9dbcf7;
  --color-blue-dark: #17408f;
  --background-brand-primary: var(--color-blue-500);
  --text-negative: #b3261e;
  --border-neutral: #d8d8d8;

  /* Property scales — numeric at Primitive. */
  --font-size-100: 16px;
  --space-400: 16px;
  --border-width-100: 1px;
  --border-width-md: 2px;
  --duration-200: 200ms;

  /* CSS keyword families — no numeric or t-shirt step, so § 3 does not reach
     them and \`bold\` / \`wide\` / \`normal\` stay legal. */
  --font-weight-bold: 700;
  --font-weight-thin: 100;
  --font-line-height-normal: 1.5;
  --letter-spacing-wide: 0.05em;
  --breakpoint-wide: 1440px;

  /* Semantic roles — t-shirt at Semantic, plus a reset. */
  --gap-none: 0;
  --gap-xs: var(--space-400);
  --gap-md: var(--space-400);
  --gap-2xl: var(--space-400);
  --icon-3xs: var(--font-size-100);
  --shadow-md: 0px 4px 12px rgba(0, 0, 0, 0.12);

  /* § Named exceptions — a shape constant, a role, a CSS keyword. */
  --border-radius-100: 4px;
  --border-radius-pill: 999px;
  --content-width-md: 800px;
  --content-width-full: 100%;
  --shadow-overlay: 0px 4px 32px rgba(0, 0, 0, 0.24);
  --iteration-infinite: infinite;
  --aspect-16-9: 16 / 9;
  --aspect-square: 1 / 1;

  /* One name, two spellings of ONE type — not a rule-2 collision. */
  --font-family-body: Poppins;
  --font-family-body: Poppins, sans-serif;
}
`;

const CLEAN_TSX = `export type BadgeTone = 'negative' | 'positive' | 'warning' | 'info' | 'neutral';
export type BadgeEmphasis = 'neutral' | 'brand' | 'accent';
export type BadgeAppearance = 'solid' | 'subtle' | 'muted';
export type BadgeDensity = 'comfortable' | 'compact';
// \`variant\` and \`status\` are per-component by § 2, so rule 5 must not reach them.
export type CardVariant = 'outlined' | 'elevated' | 'borderless';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
`;

const CLEAN_CSS = `.bds-badge--tone-negative { color: var(--text-negative); }
.bds-badge--tone-positive { color: var(--text-negative); }
.bds-badge--emphasis-brand { color: var(--text-negative); }
.bds-badge--appearance-solid { color: var(--text-negative); }
.bds-badge--density-compact { color: var(--text-negative); }
.bds-card--variant-outlined { color: var(--text-negative); }
.bds-card__body--gap-md { gap: var(--gap-md); }
.bds-card--disabled { opacity: 0.5; }
.bds-card--loading { opacity: 0.5; }
`;

/**
 * Rule 6 reads a separate tree (the CONSUMPTION side), so the fixture needs its
 * own. Clean means: canonical references, plus the two shapes the rule must not
 * flag — prose that names the retired family, which the ADR and the migration
 * notes both have to be able to do.
 */
const CLEAN_REFS = `/* The --*-status-* family was deleted in #1958; do not re-add one. */
.bds-badge--tone-negative { background: var(--background-negative); }
.bds-badge--tone-info { background: var(--surface-info); }
`;

/**
 * Run the gate over a fixture tree. `--no-baseline` by default so a case is
 * judged on its own, not against the repo's live baseline. `--refs` is always
 * pointed at the fixture too: left to its default it would scan the real
 * `components/`, `docs-site/`, … and every case would then depend on repo state.
 */
function run({ tokens = CLEAN_TOKENS, tsx = CLEAN_TSX, css = CLEAN_CSS, refs = CLEAN_REFS, refsDir, baseline, args = [] } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-canon-'));
  const tokensPath = path.join(dir, 'tokens.css');
  const componentsDir = path.join(dir, 'ui', 'Badge');
  fs.mkdirSync(componentsDir, { recursive: true });
  fs.writeFileSync(tokensPath, tokens);
  fs.writeFileSync(path.join(componentsDir, 'Badge.tsx'), tsx);
  fs.writeFileSync(path.join(componentsDir, 'Badge.css'), css);

  const refsPath = path.join(dir, 'refs');
  fs.mkdirSync(refsPath, { recursive: true });
  fs.writeFileSync(path.join(refsPath, 'consumer.css'), refs);

  const argv = [
    GATE, '--tokens', tokensPath, '--components', path.join(dir, 'ui'),
    '--refs', refsDir === undefined ? refsPath : refsDir, ...args,
  ];
  if (baseline === undefined) {
    argv.push('--no-baseline');
  } else {
    const bPath = path.join(dir, 'baseline.json');
    fs.writeFileSync(bPath, JSON.stringify(baseline));
    argv.push('--baseline', bPath);
  }
  // Findings go to stderr (stderr-for-progress, per brik-script-standards), so
  // stdout alone is empty on a passing run.
  const res = spawnSync('node', argv, { encoding: 'utf8', cwd: REPO });
  if (res.error) throw res.error;
  return { code: res.status, out: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

/** Append declarations inside the fixture's `:root` block. */
function withTokens(...decls) {
  return CLEAN_TOKENS.replace(/}\n$/, `${decls.map((d) => `  ${d}\n`).join('')}}\n`);
}

describe('lint-naming-canon — fixture', () => {
  it('the clean fixture passes all six rules', () => {
    const { code, out } = run();
    expect(out).toMatch(/clean — 0 live violation/);
    expect(code).toBe(0);
  });
});

describe('rule 1 — step vocabulary (ADR-033 § 3)', () => {
  it('fails on a retired step word, and names the migration target', () => {
    const { code, out } = run({ tokens: withTokens('--gap-tiny: 2px;') });
    expect(code).toBe(1);
    expect(out).toMatch(/--gap-tiny — step `tiny` is retired for --gap-\* → `2xs`/);
  });

  it('fails on a step word with no retirement entry — § 3 is default-deny', () => {
    const { code, out } = run({ tokens: withTokens('--gap-gigantic: 99px;') });
    expect(code).toBe(1);
    expect(out).toMatch(/--gap-gigantic — step `gigantic` is outside --gap-\*'s vocabulary/);
  });

  it('per-family migration target — `tiny` is 2xs for --gap-* but 3xs for --icon-*', () => {
    const out = run({ tokens: withTokens('--gap-tiny: 2px;', '--icon-tiny: 8px;') }).out;
    expect(out).toMatch(/--gap-tiny .*→ `2xs`/);
    expect(out).toMatch(/--icon-tiny .*→ `3xs`/);
  });

  it('a § Named exception is not a step violation', () => {
    // `--content-width-full` and `--border-radius-pill` are in the clean fixture
    // inside families that DO take steps, so only the exception list keeps them green.
    const { code, out } = run();
    expect(out).not.toMatch(/content-width-full/);
    expect(out).not.toMatch(/border-radius-pill/);
    expect(code).toBe(0);
  });

  it('does NOT flag a colour ramp rung — a colour tail is a role, not a step', () => {
    // Regression guard. Grouping by family puts `--color-blue-500` (numeric)
    // beside `--color-blue-light` (word), so without the colour carve-out 57 ramp
    // rungs read as step-word violations — a disposition ADR-033 never made.
    const { code, out } = run();
    expect(out).not.toMatch(/--color-blue-(light|dark)/);
    expect(code).toBe(0);
  });

  it('does NOT flag a CSS keyword in a family that takes no steps', () => {
    // `--font-weight-bold` / `--letter-spacing-wide` / `--font-line-height-normal`
    // use words § 3 retires as STEP words, but none of those families ships a
    // single numeric or t-shirt step, so § 3 does not reach them.
    const { code, out } = run();
    expect(out).not.toMatch(/font-weight-(bold|thin)/);
    expect(out).not.toMatch(/letter-spacing-wide|font-line-height-normal|breakpoint-wide/);
    expect(code).toBe(0);
  });

  it('longest slot wins — --border-width-thin is a property step, not a colour', () => {
    // Regression guard for the sharpest failure found while building this gate.
    // Keying the colour carve-out on the FIRST segment lets the `border` colour
    // purpose swallow `--border-width-*`, and the four violations ADR-033 § 3
    // names explicitly vanish from a green run.
    const { code, out } = run({ tokens: withTokens('--border-width-thin: 1px;') });
    expect(code).toBe(1);
    expect(out).toMatch(/--border-width-thin — step `thin` is retired/);
  });
});

describe('rule 2 — one name, two value types (ADR-033 § 5)', () => {
  it('fails on the --box-shadow-md class: a length and a shadow list', () => {
    const { code, out } = run({
      tokens: withTokens('--box-shadow-md: 8px;', '--box-shadow-md: var(--shadow-md);'),
    });
    expect(code).toBe(1);
    expect(out).toMatch(/--box-shadow-md — defined with 2 value types — length at :\d+, list at :\d+/);
  });

  it('resolves var() to classify — skipping the ref hides the collision entirely', () => {
    // `var(--shadow-md)` is a shadow LIST, not a reference. A gate that treats a
    // ref as its own type sees one type and reports clean, which is exactly why
    // lint-token-shadowing cannot substitute for this rule.
    const json = JSON.parse(run({
      tokens: withTokens('--box-shadow-md: 8px;', '--box-shadow-md: var(--shadow-md);'),
      args: ['--json'],
    }).out);
    const f = json.live.find((x) => x.rule === 2 && x.id === '--box-shadow-md');
    expect(f).toBeDefined();
    expect(f.detail).toContain('list');
  });

  it('a bds-lint-ignore does NOT rescue a type collision', () => {
    // This is the whole boundary against lint-token-shadowing, which accepts the
    // marker. A marked override of a VALUE is a decision; a marked override of a
    // TYPE is one name carrying two concepts, and the marker cannot license it.
    const { code, out } = run({
      tokens: withTokens(
        '--box-shadow-md: 8px;',
        '--box-shadow-md: var(--shadow-md); /* bds-lint-ignore — load-bearing override */',
      ),
    });
    expect(code).toBe(1);
    expect(out).toMatch(/--box-shadow-md — defined with 2 value types/);
  });

  it('same type twice is not a collision', () => {
    const { code } = run({ tokens: withTokens('--gap-md: 12px;') });
    expect(code).toBe(0);
  });

  it('does NOT manufacture a collision from a bare keyword', () => {
    // Regression guard: the clean fixture declares `--font-family-body` as
    // `Poppins` and as `Poppins, sans-serif`. One font stack, one with a
    // fallback — counting `keyword` as a distinct type made this a finding.
    const { code, out } = run();
    expect(out).not.toMatch(/font-family-body/);
    expect(code).toBe(0);
  });
});

describe('rule 3 — a union carries one axis (ADR-033 § 2)', () => {
  it('fails on a retired valence word, and names the canonical one', () => {
    const { code, out } = run({
      tsx: `${CLEAN_TSX}export type ToastVariant = 'success' | 'error' | 'info';\n`,
    });
    expect(code).toBe(1);
    expect(out).toMatch(/ToastVariant — retired valence word\(s\).*`error` → `negative`/);
    expect(out).toMatch(/`success` → `positive`/);
  });

  it('fails on a union mixing two closed axes', () => {
    // Badge's real shape: valence members plus a `brand` that belongs to emphasis.
    const { code, out } = run({
      tsx: `${CLEAN_TSX}export type BadgeStatus = 'positive' | 'warning' | 'brand';\n`,
    });
    expect(code).toBe(1);
    expect(out).toMatch(/BadgeStatus#mixed — mixes 2 axes \(emphasis \+ tone\)/);
  });

  it('fails on a retired axis value, and names the axis it moves to', () => {
    const { code, out } = run({
      tsx: `${CLEAN_TSX}export type SocialIconTone = 'grayscale' | 'brand';\n`,
    });
    expect(code).toBe(1);
    expect(out).toMatch(/retired axis value\(s\) `grayscale` → emphasis="neutral"/);
  });

  it('a per-component variant or status union is not a mixed union', () => {
    // § 2 leaves `variant` (form) and `status` (presence/lifecycle) open
    // per-component, so neither rule 3 nor rule 5 may judge their members.
    const { code, out } = run();
    expect(out).not.toMatch(/CardVariant|AvatarStatus/);
    expect(code).toBe(0);
  });
});

describe('rule 4 — a BEM modifier carries its axis prefix (ADR-033 § 4)', () => {
  it('fails on a bare modifier', () => {
    const { code, out } = run({ css: `${CLEAN_CSS}.bds-badge--marketing { color: red; }\n` });
    expect(code).toBe(1);
    expect(out).toMatch(/--marketing — bare modifier — needs its axis prefix/);
  });

  it('names the axis when the bare value belongs to a closed list', () => {
    // `.bds-badge--positive` beside `.bds-banner--tone-negative` is the defect
    // ADR-033 § 4 exists to close: one concept, two class shapes.
    const { code, out } = run({ css: `${CLEAN_CSS}.bds-badge--positive { color: red; }\n` });
    expect(code).toBe(1);
    expect(out).toMatch(/--positive — bare modifier — `--tone-positive`, needs its axis prefix/);
  });

  it('fails on a retired word even when the prefix is present', () => {
    const { code, out } = run({ css: `${CLEAN_CSS}.bds-banner--tone-error { color: red; }\n` });
    expect(code).toBe(1);
    expect(out).toMatch(/--tone-error — retired valence word `error` → `negative`/);
  });

  it('a boolean state adjective is not an axis value — `collapsible`', () => {
    // Regression guard for #1961, which turned `main` red. Breadcrumb applies
    // `--collapsible` on a predicate (`isIntermediate && collapses`,
    // Breadcrumb.tsx:104) — a boolean state, ADR-008 § 3's territory, not a
    // choice along an axis. Baselining it would have recorded correct code as
    // debt. `collapsed` was already on the list; the adjective form was not.
    const { code, out } = run({ css: `${CLEAN_CSS}.bds-breadcrumb__item--collapsible { opacity: 0; }\n` });
    expect(out).not.toMatch(/--collapsible/);
    expect(code).toBe(0);
  });

  it('a boolean state modifier is not an axis value', () => {
    // `--disabled` is the presence of a state, not a choice along an axis, so
    // ADR-008 § 3 governs it and § 4 does not reach it. Both are in the fixture.
    const { code, out } = run();
    expect(out).not.toMatch(/--disabled|--loading/);
    expect(code).toBe(0);
  });
});

describe('rule 5 — default-deny (ADR-033 § 6)', () => {
  it('fails on a novel word in a governed union', () => {
    const { code, out } = run({
      tsx: `${CLEAN_TSX}export type AlertTone = 'negative' | 'catastrophic';\n`,
    });
    expect(code).toBe(1);
    expect(out).toMatch(/AlertTone\.catastrophic — `catastrophic` is on no closed list for the tone axis/);
    expect(out).toMatch(/needs a § 6 amendment/);
  });

  it('fails on a novel word behind a governed modifier prefix', () => {
    const { code, out } = run({ css: `${CLEAN_CSS}.bds-badge--tone-emergency { color: red; }\n` });
    expect(code).toBe(1);
    expect(out).toMatch(/--tone-emergency — `emergency` is on no closed list for the tone axis/);
  });

  it('does not double-report a word rule 3 already retired', () => {
    const json = JSON.parse(run({
      tsx: `${CLEAN_TSX}export type AlertTone = 'negative' | 'error';\n`,
      args: ['--json'],
    }).out);
    expect(json.live.filter((f) => f.rule === 3 && f.id === 'AlertTone')).toHaveLength(1);
    expect(json.live.filter((f) => f.rule === 5 && f.id.startsWith('AlertTone'))).toHaveLength(0);
  });

  it('every word on the closed list passes', () => {
    // The fixture's BadgeTone / BadgeEmphasis / BadgeAppearance / BadgeDensity
    // unions are exactly § 1 and § 2's lists.
    const { code } = run();
    expect(code).toBe(0);
  });
});

describe('rule 6 — the deleted --*-status-* family cannot come back (§ Token families)', () => {
  it('fails on a var() reference to a deleted name', () => {
    const { code, out } = run({ refs: '.x { background: var(--surface-status-warning); }' });
    expect(code).toBe(1);
    expect(out).toMatch(/Rule 6/);
    expect(out).toMatch(/--surface-status-warning/);
  });

  it('routes a retired valence word through § 1 — negative, never `error`', () => {
    const { out } = run({ refs: '.x { background: var(--background-status-error); }' });
    expect(out).toMatch(/→ `--background-negative`/);
    // The derived target is the dangerous one: dropping the `status-` segment
    // yields `--background-error`, which is not a token. #1982 is the same
    // failure one rule over — a gate printing a migration that breaks the build.
    expect(out).not.toMatch(/--background-error/);
  });

  it('fails on the docs-site cssVar form, which no var()-shaped grep finds', () => {
    const { code, out } = run({
      refs: "export const S = [{ name: 'p', cssVar: '--background-status-purple' }];",
    });
    expect(code).toBe(1);
    expect(out).toMatch(/reference is a cssVar/);
    expect(out).toMatch(/→ `--background-accent-purple`/);
  });

  it('does NOT flag prose that names the retired family — the ADR has to be writable', () => {
    const { code, out } = run({
      refs: `/* --background-status-error was deleted; use --background-negative. */
.x { background: var(--background-negative); }`,
    });
    expect(out).toMatch(/clean — 0 live violation/);
    expect(code).toBe(0);
  });

  it('a novel `status-` name gets no invented migration target', () => {
    const { code, out } = run({ refs: '.x { color: var(--text-status-catastrophic); }' });
    expect(code).toBe(1);
    expect(out).toMatch(/no migration target/);
  });

  it('a reference dir that does not exist is a SCAN FAILURE, not an empty scan', () => {
    const { code, out } = run({ refsDir: 'does-not-exist' });
    expect(out).toMatch(/SCAN FAILED/);
    expect(out).toMatch(/does-not-exist/);
    expect(code).toBe(2);
  });
});

describe('the baseline can only shrink', () => {
  const planted = { tokens: withTokens('--gap-tiny: 2px;') };

  it('a baselined violation is green', () => {
    const { code, out } = run({
      ...planted,
      baseline: { rules: { 1: { '--gap-tiny': 1923 } } },
    });
    expect(out).toMatch(/clean — 0 live violation\(s\), 1 baselined/);
    expect(code).toBe(0);
  });

  it('a STALE entry fails — an entry cannot outlive its fix', () => {
    // This is what makes the baseline a countdown rather than a carve-out. Drop
    // it and the file becomes a permanent suppression list with no owner.
    const { code, out } = run({
      baseline: { rules: { 1: { '--gap-tiny': 1923 } } },
    });
    expect(code).toBe(1);
    expect(out).toMatch(/1 STALE baseline entr\(ies\)/);
    expect(out).toMatch(/rule 1: --gap-tiny/);
  });

  it('an entry with no issue number is not a disposition', () => {
    const { code, out } = run({
      ...planted,
      baseline: { rules: { 1: { '--gap-tiny': true } } },
    });
    expect(code).toBe(1);
    expect(out).toMatch(/--gap-tiny — baseline entry is `true`, not an issue number/);
  });

  it('--census shows baselined findings with their issue', () => {
    const { out } = run({
      ...planted,
      baseline: { rules: { 1: { '--gap-tiny': 1923 } } },
      args: ['--census'],
    });
    expect(out).toMatch(/· --gap-tiny —.*\(baselined, #1923\)/);
  });
});

describe('the repo baseline', () => {
  it('is valid JSON and every entry carries an integer issue number', () => {
    const file = path.join(REPO, 'tokens', 'naming-canon-baseline.json');
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const entries = Object.entries(parsed.rules).flatMap(
      ([rule, ids]) => Object.entries(ids).map(([id, issue]) => ({ rule, id, issue }))
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      expect(Number.isInteger(e.issue), `${e.rule}:${e.id} → ${JSON.stringify(e.issue)}`).toBe(true);
    }
  });
});

describe('a broken scan never reads as clean', () => {
  it('exit 2 when a denominator is zero', () => {
    const { code, out } = run({ tokens: ':root {\n}\n' });
    expect(code).toBe(2);
    expect(out).toMatch(/A zero denominator is a broken scan/);
  });

  it('exit 2 when the registry file is missing', () => {
    const res = spawnSync('node', [GATE, '--tokens', path.join(os.tmpdir(), 'no-such.css')], {
      encoding: 'utf8', cwd: REPO,
    });
    expect(res.status).toBe(2);
    expect(`${res.stdout}${res.stderr}`).toMatch(/build:dist-tokens/);
  });

  it('exit 2 on a bad --rule', () => {
    const { code, out } = run({ args: ['--rule', '9'] });
    expect(code).toBe(2);
    expect(out).toMatch(/--rule must be 1-6/);
  });
});
