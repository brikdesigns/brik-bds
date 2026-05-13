import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge, Button, Card, Frame, Grid, ServiceTag, Stack } from '../../../components';
import { CardGrid } from './CardGrid';

const meta: Meta<typeof CardGrid> = {
  title: 'Theming/Blueprints/card_grid',
  component: CardGrid,
  tags: ['surface-web', 'surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Generic section wrapper for any "header + grid of cards" layout. Content-agnostic by design — serves services, blog posts, customer stories, property listings, team bios, support plans. Consumers compose `<Grid>` + `<Card preset="display">` (or any item shape) inside. Token pairs: subtitle uses `--font-family-subtitle` + `--subtitle-lg` + `--text-transform-subtitle`; title uses `--font-family-heading` + clamp heading scale; description uses `--font-family-body` + `--body-md`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CardGrid>;

/* ─── Stories ──────────────────────────────────────────────────── */

const serviceItems = [
  { title: 'Web Design', description: 'Custom websites that convert visitors into customers.', href: '#', imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Web', category: 'marketing' as const },
  { title: 'Brand Identity', description: 'Logo systems and brand guidelines that scale.', href: '#', imageUrl: 'https://placehold.co/480x320/fff4cc/5b4500?text=Brand', category: 'brand' as const, hasOptions: true },
  { title: 'Customer Journey Maps', description: 'Map the experience from first touch to repeat purchase.', href: '#', imageUrl: 'https://placehold.co/480x320/d6e4f5/1f3d70?text=Maps', category: 'information' as const },
];

const blogItems = [
  { title: 'Why your CTAs disappear in dark mode', description: 'A short read on token-pairing discipline.', href: '#', imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Post+1', tagLabel: 'Design system' },
  { title: 'How we ship 4 client sites a quarter', description: 'Process notes from the small Brik team.', href: '#', imageUrl: 'https://placehold.co/480x320/d6f1da/1f5b2e?text=Post+2', tagLabel: 'Operations' },
  { title: 'Brik content vocabulary at a glance', description: 'A field guide to BCS for new contributors.', href: '#', imageUrl: 'https://placehold.co/480x320/ead6f5/4a1f70?text=Post+3', tagLabel: 'BCS' },
];

/**
 * @summary Services — 3-col card grid using `Card preset="display"`.
 *
 * The canonical "service grid" composition. Validates the brikdesigns#100
 * consumer shape: image + ServiceTag + title + description + primary CTA.
 */
export const ServicesGrid: Story = {
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
              preset="display"
              title={item.title}
              description={item.description}
              image={
                <Frame customRatio="3 / 2" fit="cover">
                  <img src={item.imageUrl} alt="" loading="lazy" decoding="async" />
                </Frame>
              }
              tag={<ServiceTag category={item.category} variant="icon-text" size="sm" serviceName={item.title} />}
              badge={item.hasOptions ? <Badge status="positive" size="sm" appearance="solid">Has Options</Badge> : undefined}
              action={<Button variant="primary" size="sm">Learn more</Button>}
            />
          </li>
        ))}
      </Grid>
    ),
  },
};

/**
 * @summary Blog posts — same primitive, different content type.
 *
 * Proves content-agnosticism: identical `<CardGrid>` + `<Card preset="display">`
 * composition, only the child content shape differs (a `<Badge>` tag for
 * blog category instead of a `<ServiceTag>`). One primitive serves many
 * content types — the dogfood goal from brik-bds#580.
 */
export const BlogPostsGrid: Story = {
  args: {
    sectionKey: 'blog-grid',
    title: 'Latest from the Brik blog',
    subtitle: 'Field notes',
    description: 'Short reads on design systems, content vocabulary, and how Brik ships client sites.',
    children: (
      <Grid as="ul" columns={3} gap="lg" role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {blogItems.map((item) => (
          <li key={item.title} style={{ display: 'flex' }}>
            <Card
              preset="display"
              title={item.title}
              description={item.description}
              image={
                <Frame customRatio="3 / 2" fit="cover">
                  <img src={item.imageUrl} alt="" loading="lazy" decoding="async" />
                </Frame>
              }
              tag={<Badge>{item.tagLabel}</Badge>}
              action={<Button variant="primary" size="sm">Read post</Button>}
            />
          </li>
        ))}
      </Grid>
    ),
  },
};

/**
 * @summary Two-column title/description list — no card surface.
 *
 * `<CardGrid>` doesn't require `<Card>` inside — any content composition
 * works. This story matches the legacy `services_detail_two_column` shape:
 * 2-col layout, just title/description rows, no card chrome.
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
              <h3 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-md)', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--text-primary)', lineHeight: 'var(--font-line-height-tight)' }}>
                {item}
              </h3>
              <p style={{ margin: 0, fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', lineHeight: 'var(--font-line-height-normal)', color: 'var(--text-primary)' }}>
                A one-line description that pairs body family with body size — never reach across families for the size token.
              </p>
            </Stack>
          </li>
        ))}
      </Grid>
    ),
  },
};

/**
 * @summary Minimal — title only, no subtitle / description / cards.
 *
 * `<CardGrid>` works as a header-only section if that's what the
 * consumer needs — children are whatever fits.
 */
export const MinimalHeader: Story = {
  args: {
    sectionKey: 'minimal-grid',
    title: 'Generic content slot',
    children: (
      <p>Children can be any composition — this story shows the section wrapper without item content.</p>
    ),
  },
};
