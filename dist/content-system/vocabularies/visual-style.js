/**
 * Visual Style — the 13 canonical style directions captured in the client portal.
 *
 * Drives theme token selection (palette density, typography, spacing),
 * imagery treatment, and blueprint shortlist trimming. Distinct from
 * Personality — a "Playful" personality can be expressed in a "Minimal"
 * visual style, and those tradeoffs are where craftwork lives.
 *
 * Clients pick up to 3. "Minimal" and "Playful" also appear in Personality;
 * "Luxurious" overlaps with Personality's "Luxury" (intentional — singular
 * adjective form in Personality, adverbial form here).
 *
 * Ordering mirrors the portal's onboarding picker so the eventual
 * `taxonomy.ts` → BCS import swap is a zero-reorder change.
 */
export const VISUAL_STYLE_VALUES = [
    'Minimal',
    'Bold',
    'Editorial',
    'Playful',
    'Luxurious',
    'Modern',
    'Classic',
    'Dark',
    'Light',
    'Colorful',
    'Monochrome',
    'Textural',
    'Brutalist',
];
export const isVisualStyle = (value) => VISUAL_STYLE_VALUES.includes(value);
/**
 * Image URLs resolve to `.storybook/public/visual-styles/*.png` hosted at
 * `https://storybook.brikdesigns.com/visual-styles/{file}`. Source artboards
 * live in Paper `bds-theming` (file 01KPH6ANXVEPBJ4PAVB7V380JH).
 *
 * Bold + Editorial have no Paper artboard yet — their slots ship empty
 * and get populated when those styles get dedicated hero references.
 *
 * See `.storybook/public/visual-styles/README.md` for the export drop-in
 * convention (filenames + source artboard IDs).
 */
const IMG_BASE = 'https://storybook.brikdesigns.com/visual-styles';
export const VISUAL_STYLE_EXAMPLES = [
    { primaryStyle: 'Minimal', modifierStyles: [], referenceImageUrl: `${IMG_BASE}/minimal.png`, referenceSiteUrl: 'https://leadify-template.webflow.io' },
    { primaryStyle: 'Bold', modifierStyles: [], referenceImageUrl: '' },
    { primaryStyle: 'Editorial', modifierStyles: [], referenceImageUrl: '' },
    { primaryStyle: 'Playful', modifierStyles: [], referenceImageUrl: `${IMG_BASE}/playful.png`, referenceSiteUrl: 'https://pizza-guy.webflow.io' },
    { primaryStyle: 'Luxurious', modifierStyles: [], referenceImageUrl: `${IMG_BASE}/luxurious.png`, referenceSiteUrl: 'https://villabliss-wbs.webflow.io' },
    { primaryStyle: 'Modern', modifierStyles: [], referenceImageUrl: `${IMG_BASE}/modern.png`, referenceSiteUrl: 'https://gradienttemplates.webflow.io' },
    { primaryStyle: 'Classic', modifierStyles: [], referenceImageUrl: `${IMG_BASE}/classic.png`, caption: 'Editorial masthead tradition' },
    { primaryStyle: 'Brutalist', modifierStyles: [], referenceImageUrl: `${IMG_BASE}/brutalist.png`, referenceSiteUrl: 'https://blacksmith-sbj.webflow.io' },
    // Modifier-demo compositions from Paper bds-theming
    { primaryStyle: 'Modern', modifierStyles: ['Dark'], referenceImageUrl: `${IMG_BASE}/modern-dark.png`, caption: 'Modern × Dark' },
    { primaryStyle: 'Brutalist', modifierStyles: ['Light'], referenceImageUrl: `${IMG_BASE}/brutalist-light.png`, caption: 'Brutalist × Light' },
    { primaryStyle: 'Minimal', modifierStyles: ['Colorful'], referenceImageUrl: `${IMG_BASE}/minimal-colorful.png`, caption: 'Minimal × Colorful' },
    { primaryStyle: 'Luxurious', modifierStyles: ['Monochrome'], referenceImageUrl: `${IMG_BASE}/luxurious-monochrome.png`, caption: 'Luxurious × Monochrome' },
    { primaryStyle: 'Classic', modifierStyles: ['Textural'], referenceImageUrl: `${IMG_BASE}/classic-textural.png`, caption: 'Classic × Textural' },
];
/**
 * All examples that feature `style` as the primary or as a modifier.
 * Used by Storybook per-style pages and the portal onboarding picker.
 */
export const getVisualStyleExamples = (style) => VISUAL_STYLE_EXAMPLES.filter((ex) => ex.primaryStyle === style || ex.modifierStyles.includes(style));
/**
 * The canonical "pure" example for a style — first entry where the style
 * is the primary and there are no modifiers. Returns undefined if the
 * style has no standalone example authored yet.
 */
export const getPrimaryVisualStyleExample = (style) => VISUAL_STYLE_EXAMPLES.find((ex) => ex.primaryStyle === style && ex.modifierStyles.length === 0);
//# sourceMappingURL=visual-style.js.map