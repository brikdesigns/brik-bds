import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ComponentPreview } from '@/components/component-preview';
import { EmphasisLadder } from '@/components/mdx/emphasis-ladder';
import { ComparisonGrid } from '@/components/mdx/comparison-grid';
import { ComponentAnatomy } from '@/components/mdx/component-anatomy';
import { MetadataStrip } from '@/components/mdx/metadata-strip';
import { ColorGrid, PaletteGrid } from '@/components/mdx/foundation/color-grid';
import {
  SpacingScale,
  SemanticSpacing,
} from '@/components/mdx/foundation/spacing-scale';
import {
  TypographyScale,
  FontFamilyShowcase,
  SemanticTypographyTable,
  FontWeightShowcase,
} from '@/components/mdx/foundation/typography-scale';
import {
  BorderRadiusPreview,
  BorderWidthPreview,
  ShadowScale,
} from '@/components/mdx/foundation/radius-shadow';
import { TierBadge } from '@/components/mdx/motion/tier-badge';
import {
  EffectGrid,
  AnimationDemo,
  ClipRevealDemo,
  GrainDemo,
  GlassDemo,
  TextEffectDemo,
  HoverDemo,
  VideoDemo,
  SectionThemeDemo,
} from '@/components/mdx/motion/effect-demos';
import * as BDS from '@brikdesigns/bds';

/**
 * MDX component registry. Anything exposed here is callable from any .mdx file
 * without an explicit import — the lazy escape hatch for live demos.
 *
 * Pattern: BDS components are spread under `BDS.*` so authors write
 * `<BDS.Button>...` in MDX. This keeps the component namespace explicit and
 * avoids name collisions with HTML primitives (e.g. <Card>, <Tabs>).
 *
 * Visual building blocks live under `@/components/mdx/` and are registered
 * unprefixed so they read naturally in MDX prose.
 *
 * Foundation viz components (ColorGrid, SpacingScale, etc.) are ported from
 * the Storybook foundation/_components and used on Primitives pages.
 */
export function getMDXComponents(extra?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    EmphasisLadder,
    ComparisonGrid,
    ComponentAnatomy,
    MetadataStrip,
    ColorGrid,
    PaletteGrid,
    SpacingScale,
    SemanticSpacing,
    TypographyScale,
    FontFamilyShowcase,
    SemanticTypographyTable,
    FontWeightShowcase,
    BorderRadiusPreview,
    BorderWidthPreview,
    ShadowScale,
    TierBadge,
    EffectGrid,
    AnimationDemo,
    ClipRevealDemo,
    GrainDemo,
    GlassDemo,
    TextEffectDemo,
    HoverDemo,
    VideoDemo,
    SectionThemeDemo,
    // The BDS namespace export includes hooks (useTheme) alongside components.
    // MDX's component-map type rejects that mix; cast since MDX only ever calls
    // the JSX entries (`<BDS.Button>`), never the hooks.
    BDS: BDS as unknown as MDXComponents[string],
    ...extra,
  };
}
