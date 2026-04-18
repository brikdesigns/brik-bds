# Brik Design System (BDS)

React component library with Figma-synced design tokens and a parallel content system (BCS) for voice + industry vocabulary.

**Published to:** `@brikdesigns/bds` (GitHub Packages).
**Live docs:** [Storybook on Chromatic](https://69b8918cac3056b39424d5d3-jtcwcnhshz.chromatic.com/).
**Repo:** [brikdesigns/brik-bds](https://github.com/brikdesigns/brik-bds).

---

## What's inside

| Surface | What it is | npm import |
|---|---|---|
| **Components** | 60+ React UI components (Button, Card, DatePicker, Table, etc.) | `@brikdesigns/bds` |
| **Tokens** | CSS custom properties + TypeScript token maps, synced from Figma via Style Dictionary | `@brikdesigns/bds` (JS) / `@brikdesigns/bds/tokens.css` |
| **Styles** | Compiled component CSS | `@brikdesigns/bds/styles.css` |
| **Content System (BCS)** | Vocabularies (Personality, Voice, Visual Style), industry packs, voice patterns | `@brikdesigns/bds/content-system` |

## Architecture

BDS is a **design vocabulary**. BCS is a **content vocabulary**. Both live in this repo because consumers (portal, renew-pms, brikdesigns.com) depend on the same versioned surface for both.

```
brik-bds/
├── components/            React UI components
├── tokens/                CSS tokens + TS maps (Figma-synced)
├── design-tokens/         Style Dictionary inputs (Figma + Tokens Studio)
├── content-system/        BCS — content vocabulary (MDX + TS)
│   ├── vocabularies/      Locked enums (Personality × 11, Voice × 8, Visual Style × 11)
│   ├── schema/            IndustryPack + VoicePattern types
│   ├── industries/        Dental, RE-RV/MHC, Small Business (catch-all)
│   └── voices/            8 voice patterns with rules + examples
├── blueprints/            Section layout patterns (forthcoming)
├── stories/               Storybook foundation docs
├── .storybook/            Storybook config
└── scripts/               Build, sync, validation tooling
```

## Token pipeline

```
Figma Variables → Tokens Studio JSON → Style Dictionary → per-platform outputs
```

Two modes auto-generated: `tokens/figma-tokens.css` (light) and `tokens/figma-tokens-dark.css` (dark). Never hand-edit these — update Figma, then run `npm run build:sd-figma`.

Client theming is a 2-tier cascade: BDS base tokens → `theme-{client}.css` override. See [docs/CONSUMING-TOKENS.md](docs/CONSUMING-TOKENS.md).

## Content system cascade

Mirrors the token cascade: industry pack defaults → client-specific overrides in the portal.

```
industry-pack.ctaDefaults + .vocabulary + .pageArchetypes
   ↓
company_profile.cta_language, anti_messages, naming_conventions (override)
   ↓
Brik automations (brand-strategy-worker, mockup generator) consume the merged output
```

See [content-system/README.md](content-system/README.md) for authoring packs and the Storybook **Content System / Overview** page for the live docs.

## Getting started

**Consume in an app:**

```tsx
import { Button, Card } from '@brikdesigns/bds';
import { industryPacks, voicePatterns } from '@brikdesigns/bds/content-system';
import '@brikdesigns/bds/tokens.css';
import '@brikdesigns/bds/styles.css';
```

**Develop in BDS:**

```bash
git clone https://github.com/brikdesigns/brik-bds.git
cd brik-bds
npm install
npm run storybook    # http://localhost:6006
```

## Development workflows

| Task | Command |
|---|---|
| Local Storybook | `npm run storybook` |
| Pull latest Figma tokens | `npm run build:sd-figma` (after Figma MCP pull — see [CLAUDE.md](CLAUDE.md)) |
| Typecheck | `npm run typecheck` |
| Token lint | `npm run lint-tokens` |
| Full validation | `npm run validate:full` (pre-push gate) |
| Build library | `npm run build:lib` |
| Build content-system | `npm run build:content-system` |
| Visual review | `npm run chromatic` |

## Versioning

BDS follows SemVer. Version bumps ship as `chore(release): vX.Y.Z` commits on `main` (see `chore(release): v0.8.0` for the content-system public surface).

- Minor = new public surface or components
- Patch = bug fixes, token value updates
- Major = breaking API or token renames

## Related

- [CLAUDE.md](CLAUDE.md) — authoritative agent rules for BDS development
- [content-system/README.md](content-system/README.md) — BCS authoring guide
- [docs/CONSUMING-TOKENS.md](docs/CONSUMING-TOKENS.md) — token consumption in app projects
- [docs/TOKEN-REFERENCE.md](docs/TOKEN-REFERENCE.md) — full token reference
- [Chromatic dashboard](https://www.chromatic.com/builds?appId=69b8918cac3056b39424d5d3) — visual regression builds

## License

UNLICENSED — internal Brik use only.
