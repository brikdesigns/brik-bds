import { describe, it, expect } from 'vitest';

import {
  LINT_IGNORE_MARKER,
  hasLintIgnore,
  lintIgnoreReason,
  isBareLintIgnore,
  lintIgnoreCitesIssue,
} from '../lib/bds-lint-ignore.cjs';

// Guards the invariant behind brikdesigns/brik-bds#1469: a `bds-lint-ignore`
// suppression is valid ONLY when it carries a reason; a bare marker hard-fails.

describe('hasLintIgnore', () => {
  it('detects the marker whether bare or reasoned', () => {
    expect(hasLintIgnore('height: 8px; /* bds-lint-ignore */')).toBe(true);
    expect(hasLintIgnore('color: red; // bds-lint-ignore — runtime overlay')).toBe(true);
  });

  it('is false when no marker is present', () => {
    expect(hasLintIgnore('height: 8px;')).toBe(false);
  });
});

describe('lintIgnoreReason', () => {
  it('returns null when the marker is absent', () => {
    expect(lintIgnoreReason('height: 8px;')).toBeNull();
  });

  it('returns the empty string for a bare marker', () => {
    expect(lintIgnoreReason('height: 8px; /* bds-lint-ignore */')).toBe('');
    expect(lintIgnoreReason("fontSize: '13px', // bds-lint-ignore")).toBe('');
  });

  it('strips a leading em-dash / colon / hyphen separator', () => {
    expect(lintIgnoreReason('x; // bds-lint-ignore — runtime overlay')).toBe('runtime overlay');
    expect(lintIgnoreReason('x; /* bds-lint-ignore: legacy primitive */')).toBe('legacy primitive');
    expect(lintIgnoreReason('x; // bds-lint-ignore - fixed size')).toBe('fixed size');
  });

  it('treats a bare rule keyword as a reason', () => {
    expect(lintIgnoreReason('x; /* bds-lint-ignore token-family */')).toBe('token-family');
  });
});

describe('isBareLintIgnore — the gate predicate', () => {
  it('FAILS a bare marker (block and line comment)', () => {
    expect(isBareLintIgnore('height: 8px; /* bds-lint-ignore */')).toBe(true);
    expect(isBareLintIgnore("fontSize: '13px', // bds-lint-ignore")).toBe(true);
  });

  it('FAILS a marker with only a dangling separator', () => {
    expect(isBareLintIgnore('x; // bds-lint-ignore —')).toBe(true);
    expect(isBareLintIgnore('x; /* bds-lint-ignore */ ')).toBe(true);
  });

  it('FAILS a bare block marker with trailing code (reason ends at */)', () => {
    expect(isBareLintIgnore('.probe { width: 3px; /* bds-lint-ignore */ }')).toBe(true);
    expect(lintIgnoreReason('.probe { width: 3px; /* bds-lint-ignore */ }')).toBe('');
  });

  it('PASSES a reasoned block marker with trailing code', () => {
    expect(isBareLintIgnore('.probe { width: 3px; /* bds-lint-ignore — fixed probe */ }')).toBe(false);
  });

  it('PASSES a marker that carries a reason', () => {
    expect(isBareLintIgnore('x; // bds-lint-ignore — runtime overlay')).toBe(false);
    expect(isBareLintIgnore('x; /* bds-lint-ignore — Figma-driven badge size */')).toBe(false);
    expect(isBareLintIgnore('x; /* bds-lint-ignore token-family */')).toBe(false);
  });

  it('PASSES a line with no marker at all', () => {
    expect(isBareLintIgnore('height: 8px;')).toBe(false);
  });
});

describe('lintIgnoreCitesIssue', () => {
  it('accepts a bare, repo-qualified, or owner-qualified issue ref', () => {
    expect(lintIgnoreCitesIssue('x; /* bds-lint-ignore token-family — alias (#777) */')).toBe(true);
    expect(lintIgnoreCitesIssue('x; /* bds-lint-ignore token-family — see brik-bds#1754 */')).toBe(true);
    expect(lintIgnoreCitesIssue('x; /* bds-lint-ignore token-family — brikdesigns/brikdesigns#822 */')).toBe(true);
  });

  it('rejects a reason with prose only', () => {
    expect(lintIgnoreCitesIssue('x; /* bds-lint-ignore token-family */')).toBe(false);
    expect(lintIgnoreCitesIssue('x; /* bds-lint-ignore token-family — see docs/TOKEN-PR-CHECKLIST.md */')).toBe(false);
  });

  it('does not read a hex colour as an issue ref', () => {
    expect(lintIgnoreCitesIssue('x; /* bds-lint-ignore token-family — rest #4f4f4f, 7.32:1 */')).toBe(false);
  });

  it('reads only the waiver reason, not the code before the marker', () => {
    expect(lintIgnoreCitesIssue('content: "#12"; /* bds-lint-ignore token-family */')).toBe(false);
  });

  it('is false when no marker is present', () => {
    expect(lintIgnoreCitesIssue('x; /* #777 */')).toBe(false);
  });
});

describe('LINT_IGNORE_MARKER', () => {
  it('is the canonical marker string', () => {
    expect(LINT_IGNORE_MARKER).toBe('bds-lint-ignore');
  });
});
