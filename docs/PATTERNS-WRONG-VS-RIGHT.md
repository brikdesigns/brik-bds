# Patterns — wrong vs right

The most commonly broken patterns across all Brik projects. Re-read before any component or token-touching work.

```tsx
// ❌ WRONG: Ghost variant on a primary action
<IconButton variant="ghost" icon={<Play />} label="Start" />
// ✅ RIGHT: Preserve the action's hierarchy — primary action = primary variant
<IconButton variant="primary" icon={<Play />} label="Start" />
// Rule: Converting Button → IconButton doesn't change the action's importance.
// ghost = low emphasis. primary = high emphasis. Match the original.

// ❌ WRONG: Raw var() string in style prop
style={{ color: 'var(--text-primary)', fontSize: '16px' }}
// ✅ RIGHT: Import from the token layer
import { color, font } from '@/lib/tokens';
style={{ color: color.text.primary, fontSize: font.size.body.md }}

// ❌ WRONG: Hardcoded hex color
style={{ backgroundColor: '#E35335' }}
// ✅ RIGHT: Always look up the semantic token — never assume
style={{ backgroundColor: color.brand.primary }}
// Note: grep globals.css first. Never assume what "primary" resolves to.

// ❌ WRONG: Mixing font family with wrong size scale
style={{ fontSize: font.size.body.md, fontFamily: font.family.heading }}
// ✅ RIGHT: Use composed style presets
import { text } from '@/lib/styles';
style={text.body}  // family + size + lineHeight, always matched correctly

// ❌ WRONG: Heading/title element using body font family
.bds-card__name { font-family: var(--font-family-body); }
// ✅ RIGHT: Semantic family matches element role
.bds-card__name { font-family: var(--font-family-heading); }
// Rule: Font family token MUST match the element's semantic role.
//   Heading/title/name elements     → --font-family-heading
//   Label/badge/tag/button/caption  → --font-family-label
//   Body copy/description/paragraph → --font-family-body
//
// WHY THIS MATTERS: BDS defaults all three tokens to Poppins, so misuse is
// invisible during BDS development. The violation surfaces only when a client
// theme assigns distinct typefaces per family (e.g. Century Schoolbook for
// heading, Avenir for body/label). Always validate component CSS with the
// ★ Client Sim theme in Storybook — it assigns Georgia/Verdana/Courier New
// to expose mismatches instantly before any client theme reveals them.
//
// HEADING SCALE STARTS AT 18px: --heading-tiny = font-size/200 = 18px.
// font-size/100 (16px) is body/label territory. Never use it on a heading element.

// ❌ WRONG: Editing the submodule directly
// brik-client-portal/brik-bds/components/ui/Button/Button.css ← NEVER
// ✅ RIGHT: Edit in standalone repo, sync to consumers
// ~/Documents/GitHub/brik/brik-bds/ ← ALWAYS
// Then: ./scripts/bds-sync.sh in each consuming project
```
