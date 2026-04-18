# Content System (BCS)

The content vocabulary that pairs with BDS's visual vocabulary.

Browse the full docs in Storybook under **Content System / Overview**. This README is for contributors authoring packs.

## Structure

```
content-system/
├── vocabularies/    Locked enums — portal imports these directly
├── schema/          TypeScript types for pack authoring
├── industries/      Industry packs ({slug}.ts + {slug}.mdx pairs)
└── voices/          Voice patterns (8 traits — rules, examples, pairings)
```

## Locked enums

The three portal axes are defined once, here, and imported everywhere:

- `vocabularies/personality.ts` — 11 Brand Personality traits
- `vocabularies/voice.ts` — 8 Brand Voice traits
- `vocabularies/visual-style.ts` — 11 Visual Style directions
- `vocabularies/industry.ts` — canonical industry slug registry

**Do not drift these.** The portal's `company_profiles.brand_personality[]`, `voice_tone[]`, `style_preferences[]`, and `industry_slug` columns are validated against these exports. Adding values requires a coordinated change across BDS + portal.

## Adding an industry pack

1. **Add the slug** to `vocabularies/industry.ts` in the `INDUSTRY_SLUGS` array.
2. **Create the data file** `industries/{slug}.ts`:
   - Export a const satisfying `IndustryPack` (see `schema/industry-pack.ts`).
   - Use `dental.ts` as a structural reference — it's the most complete pack.
3. **Create the narrative** `industries/{slug}.mdx`:
   - Include `<Meta title="Content System/Industries/{DisplayName}" />`.
   - Import the data file and reference structured values inline for a single source of truth.
   - Use `dental.mdx` as a reference.
4. **Register the pack** in `industries/index.ts`.
5. **Set metadata:**
   - `version: '1.0.0'` for a new pack.
   - `lastReviewed: 'YYYY-MM-DD'` to today's date.
   - `reviewCadence: 'quarterly'` unless there's reason to deviate.

## Editing an existing pack

1. Bump `version` (semver — minor for additions, major for schema breaks).
2. Update `lastReviewed` when you've confirmed the content is still accurate (even without changes).
3. Keep `.ts` and `.mdx` in sync — if you change structured values, update the narrative, and vice versa.
4. If you rename or remove a value that consumers depend on (e.g. a service slug), treat it as a major version bump and coordinate with the portal team.

## Promotion — graduating a vertical out of `small-business`

`small-business` is the catch-all. Graduate to a dedicated pack when **any** of:

1. Brik has **3+ active clients** in the vertical, OR
2. Seasonality, regulation, or terminology diverges meaningfully from the catch-all, OR
3. Strategy docs for that vertical repeat **60%+ of the time**.

Promotion steps are in `industries/small-business.mdx` §9.

## Type safety

`industries/index.ts` exports a `Record<IndustrySlug, IndustryPack>`. When you add a new slug to `INDUSTRY_SLUGS` but forget to add the pack to the registry, TypeScript will flag it. Run `tsc --noEmit` in CI to catch drift.

## Consumers

- **Brik Client Portal** — imports `industryPacks`, `DEFAULT_INDUSTRY_SLUG`, and the three axis enums for the resolver. See portal `src/lib/profiles/resolve-brand-language.ts` (not yet built).
- **brand-strategy-worker** — seeds generated CTAs and naming conventions from the active pack before client-specific synthesis.
- **Mockup generator (Claude Design in Paper)** — reads page archetypes and blueprint defaults to scaffold section layouts.

## Related

- `../tokens/` — BDS design tokens (visual vocabulary)
- `../blueprints/` — blueprint library (page/section layout patterns — to be populated)
- Portal: `company_profiles` schema at `supabase/migrations/` and types at `src/lib/profiles/types.ts`
