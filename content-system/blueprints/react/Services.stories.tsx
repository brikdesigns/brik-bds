import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card, Frame, Grid, LinkButton, ServiceTag, Stack } from '../../../components';
import { Services } from './Services';

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof Services> = {
  title: 'Theming/Blueprints/services',
  component: Services,
  tags: ['surface-web', 'surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Section wrapper for the `bds-services` blueprint family (post-ADR-008 / brik-bds#580). Owns section-level heading, container, padding, and aria semantics; item layout is consumer-composed via children — typically `<Grid>` + `<Card>` for card grids, or a plain list for two-column title/description layouts. The legacy `Services3ColCardGrid` and `ServicesDetailTwoColumn` blueprints are now thin adapters that compose this primitive.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Services>;

/* ─── Stories ──────────────────────────────────────────────────── */

const cardItems = [
  { title: 'Service one', description: 'A two-line card description that sets the type rhythm without trying to tell the whole story.', href: '#', imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Service+One', category: 'information' as const },
  { title: 'Service two', description: 'A two-line card description that sets the type rhythm without trying to tell the whole story.', href: '#', imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Service+Two', category: 'information' as const },
  { title: 'Service three', description: 'A two-line card description that sets the type rhythm without trying to tell the whole story.', href: '#', imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Service+Three', category: 'information' as const },
];

const listItems = [
  { title: 'Service one', description: 'A one-line description of the first service offering.' },
  { title: 'Service two', description: 'A one-line description of the second service offering.' },
  { title: 'Service three', description: 'A one-line description of the third service offering.' },
  { title: 'Service four', description: 'A one-line description of the fourth service offering.' },
];

/**
 * @summary 3-column card grid — children-composition of Grid + Card + Frame + ServiceTag.
 *
 * The replacement composition for the legacy `Services3ColCardGrid`
 * adapter. Consumers compose primitives directly; no `layout` prop,
 * no per-card BlueprintSection data shape. Each card's structure is
 * fully under consumer control.
 */
export const ThreeColumnCardGrid: Story = {
  args: {
    sectionKey: 'services-3col',
    title: 'Featured services',
    subtitle: 'Acme',
    description: 'A one-line section subheading that frames the service catalog below.',
    children: (
      <Grid as="ul" columns={3} gap="lg" role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {cardItems.map((item) => (
          <li key={item.title} style={{ display: 'flex' }}>
            <Card variant="outlined" padding="none" style={{ overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column' }}>
              <Frame customRatio="3 / 2" fit="cover">
                <img src={item.imageUrl} alt="" loading="lazy" decoding="async" />
              </Frame>
              <Stack gap="md" style={{ padding: 'var(--padding-lg)', flex: '1 1 auto' }}>
                <ServiceTag category={item.category} variant="icon-text" size="sm" serviceName={item.title} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div style={{ marginTop: 'auto' }}>
                  <LinkButton href={item.href} variant="ghost" size="sm" iconAfter={<span aria-hidden="true">→</span>}>
                    Learn more
                  </LinkButton>
                </div>
              </Stack>
            </Card>
          </li>
        ))}
      </Grid>
    ),
  },
};

/**
 * @summary 2-column title/description list — Grid + Stack + plain list items.
 *
 * The replacement composition for the legacy `ServicesDetailTwoColumn`
 * adapter. Same `<Services>` wrapper, different children — proves the
 * "one block, structural composition pushed to layout primitives"
 * architecture from ADR-008.
 */
export const TwoColumnTitleDescription: Story = {
  args: {
    sectionKey: 'services-2col',
    title: 'What we do',
    subtitle: 'Services',
    description: 'A one-line section subheading that frames the service catalog below.',
    children: (
      <Grid as="ul" columns={2} gap="xl" role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {listItems.map((item) => (
          <li key={item.title}>
            <Stack gap="sm">
              <h3 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-md)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p style={{ margin: 0, fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-xl)', color: 'var(--text-primary)' }}>
                {item.description}
              </p>
            </Stack>
          </li>
        ))}
      </Grid>
    ),
  },
};

/**
 * @summary Minimal — title-only header + a single arbitrary child.
 *
 * Shows that `<Services>` is generic enough to wrap any items shape,
 * not just grids — the section wrapper has no opinion about what fills
 * its body slot.
 */
export const MinimalSingleChild: Story = {
  args: {
    sectionKey: 'services-minimal',
    title: 'Custom item shape',
    children: (
      <p>Any consumer-supplied content can fill the body slot — this story shows the section wrapper without item composition.</p>
    ),
  },
};
