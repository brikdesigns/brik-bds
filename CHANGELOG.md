# Changelog

Consumer-facing changes to `@brikdesigns/bds`, newest first.

This file is **not** the release record — the GitHub Release for each tag is,
and it is auto-generated from the PRs since the previous tag
([`docs/RELEASE.md`](docs/RELEASE.md) § Flow step 4). What lives here is the one
thing a generated note cannot carry: a **Breaking (consumer CSS)** mapping.

A consumer targets BDS class hooks from its own override CSS. When BDS renames
or removes one, the consumer's selector silently stops matching — no build
error, no type error, no lint ([#1186](https://github.com/brikdesigns/brik-bds/issues/1186)).
So a rename or removal of a public class hook gets an old → new table here, and
a consumer greps this file before bumping.

> `#1186` will add the manifest + CI check that *enforces* this section. Until
> it lands, the entry is a convention, not a gate.

## Unreleased

### Breaking (consumer CSS)

ADR-033 § 2 assigns `tone` to the valence axis and mints `emphasis` for the
hue-source axis, so the three components whose `tone` was the hue source rename
their prop, their exported union, and their BEM modifier
([#1925](https://github.com/brikdesigns/brik-bds/issues/1925)). Resolved colors
are unchanged — this is a vocabulary change, not a visual one.

| Old class hook | New class hook |
|---|---|
| `.bds-text-link--tone-neutral` | `.bds-text-link--emphasis-neutral` |
| `.bds-social-icon--grayscale` | `.bds-social-icon--emphasis-neutral` |
| `.bds-social-icon--brand` | `.bds-social-icon--emphasis-brand` |
| `.bds-social-icon--accent` | `.bds-social-icon--emphasis-accent` |
| `.bds-contact-icon--grayscale` | `.bds-contact-icon--emphasis-neutral` |
| `.bds-contact-icon--accent` | `.bds-contact-icon--emphasis-accent` |

`.bds-social-icon--badge` / `--glyph` and `.bds-contact-icon--badge` / `--glyph`
are the `type` axis and are **unchanged**.

### Deprecated — honoured for one minor, then removed

| Old | New |
|---|---|
| `<TextLink tone>` | `<TextLink emphasis>` |
| `<SocialIcon tone>` | `<SocialIcon emphasis>` |
| `<ContactIcon tone>` | `<ContactIcon emphasis>` |
| `SocialIcon` / `ContactIcon` value `"grayscale"` | `"neutral"` |
| type `TextLinkTone` | `TextLinkEmphasis` |
| type `SocialIconTone` | `SocialIconEmphasis` |
| type `ContactIconTone` | `ContactIconEmphasis` |

Passing the old prop or the old value still renders the new modifier and logs
one `console.warn` per component + prop + value. `emphasis` wins when both
props are passed.
