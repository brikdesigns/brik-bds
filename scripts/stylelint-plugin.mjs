/**
 * stylelint-plugin — editor-time wrapper over BDS's consumer token checks (#3210).
 *
 * `canonical-check` and `cascade-contract-check` run from CLI / CI / pre-commit, so an
 * invented or redefined token shows up after the commit. This plugin runs the SAME scan
 * functions under Stylelint so a consumer's editor underlines the violation while typing.
 * It adds no detection logic: allowlist, exemptions and rules come from the two checks.
 *
 *   bds/canonical-token-name   → canonical-check.mjs         (invented `--surface-paper`)
 *   bds/no-token-redefinition  → cascade-contract-check.mjs  (redefined scale / brandable token)
 *
 * Usage in a consumer's stylelint config:
 *   plugins: ['@brikdesigns/bds/stylelint-plugin'],
 *   rules: { 'bds/canonical-token-name': true, 'bds/no-token-redefinition': true }
 *
 * Secondary option on both rules: `{ exemptTokens: ['--legacy-name', /^--vendor-/] }`, the same
 * burn-down allowlist the CLI checks take. The CLI checks stay the CI gate.
 */
import stylelint from 'stylelint';
import {
  DEFAULT_EXEMPT_PATTERNS,
  DEFAULT_PREFIXES,
  extractTokenReferences,
  parseAllowlistFromFile,
  resolveDefaultAllowlistPath,
} from './canonical-check.mjs';
import { scanCascadeContract } from './cascade-contract-check.mjs';

const { createPlugin, utils } = stylelint;

export const CANONICAL_RULE = 'bds/canonical-token-name';
export const REDEFINITION_RULE = 'bds/no-token-redefinition';

const canonicalMessages = utils.ruleMessages(CANONICAL_RULE, {
  rejected: (token) => `"${token}" is not a canonical BDS token name (not declared in dist/tokens.css)`,
});
const redefinitionMessages = utils.ruleMessages(REDEFINITION_RULE, {
  rejected: (message) => message,
});

const secondaryOptionsSchema = {
  exemptTokens: [(v) => typeof v === 'string' || v instanceof RegExp],
  optional: true,
};

/** Allowlist per resolved tokens.css path — parsed once per Stylelint process, not per file. */
const allowlistCache = new Map();
function allowlistFor(cwd) {
  const path = resolveDefaultAllowlistPath(cwd);
  if (!allowlistCache.has(path)) allowlistCache.set(path, parseAllowlistFromFile(path));
  return allowlistCache.get(path);
}

const isExempt = (token, patterns) =>
  patterns.some((p) => (typeof p === 'string' ? p === token : p.test(token)));

const canonicalRule = (primary, secondary) => (root, result) => {
  if (!utils.validateOptions(result, CANONICAL_RULE, { actual: primary }, { actual: secondary, possible: secondaryOptionsSchema, optional: true })) return;
  if (!primary) return;

  const allowlist = allowlistFor(result.opts?.cwd ?? process.cwd());
  const exempt = [...DEFAULT_EXEMPT_PATTERNS, ...(secondary?.exemptTokens ?? [])];

  root.walkDecls((decl) => {
    for (const token of extractTokenReferences(`${decl.prop}: ${decl.value}`, DEFAULT_PREFIXES)) {
      if (allowlist.has(token) || isExempt(token, exempt)) continue;
      utils.report({ ruleName: CANONICAL_RULE, result, node: decl, word: token, message: canonicalMessages.rejected(token) });
    }
  });
};

/** First node starting on `line`, so a cascade violation underlines its own declaration. */
function nodeAtLine(root, line) {
  let found = null;
  root.walk((node) => {
    if (!found && node.source?.start?.line === line && node.type !== 'root') found = node;
  });
  return found ?? root;
}

const redefinitionRule = (primary, secondary) => (root, result) => {
  if (!utils.validateOptions(result, REDEFINITION_RULE, { actual: primary }, { actual: secondary, possible: secondaryOptionsSchema, optional: true })) return;
  if (!primary) return;

  const { violations } = scanCascadeContract({
    css: root.toString(),
    file: root.source?.input?.file ?? '<input>',
    exemptTokens: secondary?.exemptTokens ?? [],
  });
  for (const v of violations) {
    utils.report({ ruleName: REDEFINITION_RULE, result, node: nodeAtLine(root, v.line), message: redefinitionMessages.rejected(v.message) });
  }
};

canonicalRule.ruleName = CANONICAL_RULE;
canonicalRule.messages = canonicalMessages;
redefinitionRule.ruleName = REDEFINITION_RULE;
redefinitionRule.messages = redefinitionMessages;

export default [createPlugin(CANONICAL_RULE, canonicalRule), createPlugin(REDEFINITION_RULE, redefinitionRule)];
