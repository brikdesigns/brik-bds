import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge, Button, Card, CardDescription, Frame, Grid, ServiceTag, Stack } from '../../../components';
import { CardGrid } from './CardGrid';
import type { BlueprintProps } from '../astro/types';
import { baseClientFacts, baseTheme, placeholderImage } from './_fixtures';

const meta: Meta<typeof CardGrid> = {
  title: 'Blueprints/card_grid',
  component: CardGrid,
  tags: ['surface-web'],
  argTypes: {
    sectionKey: { control: 'text', description: 'Unique section key — drives element ids.' },
    subtitle: { control: 'text', description: 'Eyebrow above the title.' },
    title: { control: 'text', description: 'Section heading.' },
    description: { control: 'text', description: 'One-line section subheading.' },
    children: { control: false, description: 'Slotted grid content — any composition (Grid of Cards, list rows, header-only).' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Generic section wrapper for any "header + grid of cards" layout. Content-agnostic by design — serves services, blog posts, customer stories, property listings, team bios, support plans. Consumers compose `<Grid>` + `<Card layout="stack">` (or any item shape) inside. Token pairs: subtitle uses `--bds-font-family-subtitle` + `--bds-subtitle-lg` + `--bds-text-transform-subtitle`; title uses `--bds-font-family-heading` + clamp heading scale; description uses `--bds-font-family-body` + `--bds-body-md`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CardGrid>;

/* ─── Stories ──────────────────────────────────────────────────── */

const serviceItems = [
  { title: 'Web Design', description: 'Custom websites that convert visitors into customers.', href: '#', imageUrl: placeholderImage(480, 320, '#eaf1fb', '#1f3d70', 'Web'), category: 'marketing' as const },
  { title: 'Brand Identity', description: 'Logo systems and brand guidelines that scale.', href: '#', imageUrl: placeholderImage(480, 320, '#fff4cc', '#5b4500', 'Brand'), category: 'brand' as const, hasOptions: true },
  { title: 'Customer Journey Maps', description: 'Map the experience from first touch to repeat purchase.', href: '#', imageUrl: placeholderImage(480, 320, '#d6e4f5', '#1f3d70', 'Maps'), category: 'information' as const },
];

/**
 * The canonical "service grid" composition. Validates the brikdesigns#100
 * consumer shape: image + ServiceTag + title + description + primary CTA.
 *
 * @summary Services — 3-col card grid of Card layout="stack"
 */
export const Default: Story = {
  args: {
    sectionKey: 'services-grid',
    title: 'Featured services',
    subtitle: 'Acme',
    description: 'A one-line section subheading that frames the service catalog below.',
    children: (
      <Grid as="ul" columns={3} gap="lg" role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {serviceItems.map((item) => (
          <li key={item.title} style={{ display: 'flex' }}>
            <Card
              layout="stack"
              title={item.title}
              media={
                <Frame customRatio="3 / 2" fit="cover">
                  <img src={item.imageUrl} alt="" loading="lazy" decoding="async" />
                </Frame>
              }
              overline={<ServiceTag category={item.category} variant="icon-text" size="sm" serviceName={item.title} />}
              badge={item.hasOptions ? <Badge status="positive" size="sm" appearance="solid">Has Options</Badge> : undefined}
              action={<Button variant="primary" size="sm">Learn more</Button>}
            >
              <CardDescription>{item.description}</CardDescription>
            </Card>
          </li>
        ))}
      </Grid>
    ),
  },
};

/**
 * `<CardGrid>` doesn't require `<Card>` inside — any content composition
 * works. This story matches the legacy `two_column_detail` shape:
 * 2-col layout, just title/description rows, no card chrome.
 *
 * Kept deliberately (#1490): a blueprint story is AI-mockup grounding, not
 * just a visual sample, and this is the one that proves `children` is
 * unconstrained — a `card_grid` is a *section* contract (header + rhythm +
 * container), not a promise of card chrome. Removing it would leave the
 * family looking card-only to a generating agent.
 *
 * @summary Two-column title/description list, no card surface
 */
export const TwoColumnList: Story = {
  args: {
    sectionKey: 'list-grid',
    title: 'What we do',
    subtitle: 'Services',
    description: 'A one-line section subheading that frames the service catalog below.',
    children: (
      <Grid as="ul" columns={2} gap="xl" role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {['Web design', 'Brand identity', 'Content strategy', 'Customer journey maps'].map((item) => (
          <li key={item}>
            <Stack gap="sm">
              <h3 style={{ margin: 0, fontFamily: 'var(--bds-font-family-heading)', fontSize: 'var(--bds-heading-md)', fontWeight: 'var(--bds-font-weight-semibold)', color: 'var(--bds-text-primary)', lineHeight: 'var(--bds-font-line-height-tight)' }}>
                {item}
              </h3>
              <p style={{ margin: 0, fontFamily: 'var(--bds-font-family-body)', fontSize: 'var(--bds-body-md)', lineHeight: 'var(--bds-font-line-height-normal)', color: 'var(--bds-text-primary)' }}>
                A one-line description that pairs body family with body size — never reach across families for the size token.
              </p>
            </Stack>
          </li>
        ))}
      </Grid>
    ),
  },
};


/* ─── Dispatched (section-driven) ──────────────────────────────────
 *
 * The same block, driven by a `BlueprintSection` — the block renders
 * `section.items` itself for the chosen `layout`. This is what
 * `BlueprintDispatcher` renders for `card_grid` (`layout="card-grid"`) and
 * `two_column_detail` (`layout="two-column-list"`) (#2352).
 */

const cardDescription =
  'A two-line card description that sets the type rhythm without trying to tell the whole story.';

const servicesGridSection: BlueprintProps['section'] = {
  sectionKey: 'services-grid-default',
  sectionType: 'services',
  heading: 'Featured services',
  subheading: 'Acme',
  body: 'A one-line section subheading that frames the service catalog below.',
  cta: null,
  visualNotes: {
    blueprintKey: 'card_grid',
    moodKeywords: ['approachable', 'modern'],
    layoutBlueprint: 'card_grid',
    imageOpportunity: 'illustration per card',
    illustrationOpportunity: 'scene per service',
  },
  items: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((n, i) => ({
    title: `Service ${n.toLowerCase()}`,
    description: cardDescription,
    href: '#',
    imageUrl: placeholderImage(480, 320, '#eaf1fb', '#1f3d70', `Service ${n}`),
    category: 'information',
    // Two and five carry the "Has Options" pill.
    ...(i === 1 || i === 4 ? { hasOptions: true } : {}),
  })),
};

const twoColumnSection: BlueprintProps['section'] = {
  sectionKey: 'services-two-col-default',
  sectionType: 'services',
  heading: 'What we do',
  subheading: 'Services',
  body: 'A one-line section subheading that frames the service catalog below — short enough to scan, specific enough to set expectations.',
  cta: null,
  visualNotes: {
    blueprintKey: 'two_column_detail',
    moodKeywords: ['professional'],
    layoutBlueprint: 'two_column_detail',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'].map((ordinal, i) => ({
    title: `Service ${['one', 'two', 'three', 'four', 'five', 'six'][i]}`,
    description: `A one-line description of the ${ordinal} service offering.`,
  })),
};

/**
 * Six service cards — each composes a `Card layout="stack"` with a 3:2 image,
 * a `ServiceTag` overline, an optional "Has Options" `Badge` and a "Learn more"
 * button (the `card_grid` key).
 *
 * @summary Dispatched card-grid — six service cards from section data
 */
export const DispatchedCardGrid: Story = {
  args: {
    section: servicesGridSection,
    clientFacts: baseClientFacts,
    theme: baseTheme,
    layout: 'card-grid',
  },
};

/** @summary Dispatched two-column-list — six title/description rows */
export const DispatchedTwoColumnList: Story = {
  args: {
    section: twoColumnSection,
    clientFacts: baseClientFacts,
    theme: baseTheme,
    layout: 'two-column-list',
  },
};
