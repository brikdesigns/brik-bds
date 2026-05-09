# Token rename history

When Figma reorganizes variable groups, token names change. Log every rename here so consuming-project CSS can be audited.

| Date | Change | Old CSS name → New CSS name |
|------|--------|-----------------------------|
| 2026-04-02 | `--font-family-subtitle` promoted from `overrides.css` gap-fill to first-class Figma variable. Global fallback (`var(--font-family-label)`) removed from `overrides.css`. Per-theme blocks retain explicit overrides. **Requires Figma sync to land in `figma-tokens.css`.** | No rename — CSS variable name unchanged. |
| 2026-04-02 | Removed `interaction/` group from `tokens-studio.json`; tokens now live in their semantic sub-groups. SD rebuild completed, `overrides.css` bridge aliases removed. | `--interaction-background-brand-primary-hover` → `--background-brand-primary-hover` |
| | | `--interaction-background-brand-primary-pressed` → `--background-brand-primary-pressed` |
| | | `--interaction-surface-secondary-hover` → `--surface-secondary-hover` |
| | | `--interaction-surface-secondary-pressed` → `--surface-secondary-pressed` |
| | | `--interaction-surface-subtle-hover` → `--surface-subtle-hover` |
| | | `--interaction-background-disabled` → `--background-disabled` |
| | | `--interaction-text-disabled` → `--text-disabled` |
| | | `--interaction-border-disabled` → `--border-disabled` |
| | Note: `--background-secondary-hover`, `--background-outline-hover` (and pressed variants) were dead aliases — never had backing tokens. Removed entirely. |

**After any Figma sync that renames tokens:** run `node scripts/lint-tokens.js` against all component CSS files to catch stale references before committing.
