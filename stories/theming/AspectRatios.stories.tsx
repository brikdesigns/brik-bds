import type { Meta, StoryObj } from '@storybook/react-vite';
import { Frame } from '../../components/ui/Frame/Frame';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Foundation/Design Tokens/Aspect Ratios',
  tags: ['surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Canonical aspect-ratio vocabulary backed by the `--aspect-*` token family (BDS #486). Use these tokens (or the `Frame` `ratio` slug prop) instead of hand-typed `aspect-ratio` CSS or `customRatio` strings — same drift-prevention principle as the color/spacing token families.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/* ─── Helpers ─────────────────────────────────────────────────── */

const PRIMITIVES = [
  { slug: '1-1',  value: '1 / 1',  note: 'Square — avatars, thumbnails, service illustrations' },
  { slug: '3-2',  value: '3 / 2',  note: 'DSLR landscape — service card media, product shots' },
  { slug: '2-3',  value: '2 / 3',  note: 'DSLR portrait — vertical photography' },
  { slug: '4-3',  value: '4 / 3',  note: 'Legacy landscape (Frame default)' },
  { slug: '3-4',  value: '3 / 4',  note: 'Legacy portrait — profile cards, editorial' },
  { slug: '4-5',  value: '4 / 5',  note: 'Portrait — hero media, marketing/social imagery' },
  { slug: '16-9', value: '16 / 9', note: 'Video, hero banners, OG images' },
  { slug: '9-16', value: '9 / 16', note: 'Vertical video, mobile portrait' },
  { slug: '21-9', value: '21 / 9', note: 'Cinematic, full-bleed backgrounds' },
] as const;

const ALIASES = [
  { slug: 'square',           resolves: '1-1',  note: 'Alias for `1-1`' },
  { slug: 'photo-landscape',  resolves: '3-2',  note: 'Alias for `3-2` — role-named photo crop' },
  { slug: 'photo-portrait',   resolves: '2-3',  note: 'Alias for `2-3` — role-named photo crop' },
  { slug: 'cinema',           resolves: '16-9', note: 'Alias for `16-9` — role-named hero/video slot' },
] as const;

const DEPRECATED = [
  { slug: 'portrait',  use: '3-4' },
  { slug: 'landscape', use: '4-3' },
  { slug: 'wide',      use: '16-9 or cinema' },
  { slug: 'ultrawide', use: '21-9' },
] as const;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section
    style={{
      padding: 'var(--padding-xl)',
      borderBottom: '1px solid var(--border-secondary)',
    }}
  >
    <h2
      style={{
        margin: 0,
        marginBottom: 'var(--gap-lg)',
        fontFamily: 'var(--font-family-heading)',
        fontSize: 'var(--heading-lg)', // bds-lint-ignore
        color: 'var(--text-primary)',
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 'var(--gap-lg)',
    }}
  >
    {children}
  </div>
);

const Card = ({
  slug,
  token,
  meta,
}: {
  slug: string;
  token: string;
  meta: React.ReactNode;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-sm)',
    }}
  >
    <div
      style={{
        background: 'var(--surface-secondary)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--border-radius-md)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          aspectRatio: `var(${token})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--body-sm)', // bds-lint-ignore
          color: 'var(--text-secondary)',
          background:
            'repeating-linear-gradient(45deg, var(--surface-primary), var(--surface-primary) 8px, var(--surface-secondary) 8px, var(--surface-secondary) 16px)',
        }}
      >
        {slug}
      </div>
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-tiny)',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-sm)', // bds-lint-ignore
      }}
    >
      <code
        style={{
          fontFamily: 'var(--font-family-code, ui-monospace, monospace)',
          fontSize: 'var(--body-xs)', // bds-lint-ignore
          color: 'var(--text-primary)',
        }}
      >
        {token}
      </code>
      <div style={{ color: 'var(--text-secondary)' }}>{meta}</div>
    </div>
  </div>
);

/* ─── Catalog ─────────────────────────────────────────────────── */

/** @summary All canonical ratios, semantic aliases, and deprecated mode-words side by side. */
export const Catalog: Story = {
  render: () => (
    <div style={{ fontFamily: 'var(--font-family-body)' }}>
      <Section title="Primitives">
        <Grid>
          {PRIMITIVES.map(({ slug, value, note }) => (
            <Card
              key={slug}
              slug={slug}
              token={`--aspect-${slug}`}
              meta={
                <>
                  {value} — {note}
                </>
              }
            />
          ))}
        </Grid>
      </Section>

      <Section title="Semantic aliases">
        <Grid>
          {ALIASES.map(({ slug, resolves, note }) => (
            <Card
              key={slug}
              slug={slug}
              token={`--aspect-${slug}`}
              meta={
                <>
                  Resolves to <code>--aspect-{resolves}</code> — {note}
                </>
              }
            />
          ))}
        </Grid>
      </Section>

      <Section title="Deprecated mode-words">
        <p
          style={{
            margin: 0,
            marginBottom: 'var(--gap-md)',
            fontSize: 'var(--body-sm)', // bds-lint-ignore
            color: 'var(--text-secondary)',
          }}
        >
          Frame’s original ratio prop accepted mode-words. These still resolve to the correct
          ratios for one minor version — migrate to the primitive slugs above.
        </p>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--gap-sm)',
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-sm)', // bds-lint-ignore
            color: 'var(--text-secondary)',
          }}
        >
          {DEPRECATED.map(({ slug, use }) => (
            <li key={slug}>
              <code>{slug}</code> → use <code>{use}</code>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  ),
};

/* ─── Frame usage ─────────────────────────────────────────────── */

/** @summary `Frame` consuming the new slug vocabulary. */
export const FrameSlugs: Story = {
  render: () => (
    <Section title="Frame ratio prop — slug vocabulary">
      <Grid>
        {(['1-1', '3-2', '2-3', '4-3', '16-9', '9-16', '21-9', 'photo-landscape', 'cinema'] as const).map((slug) => (
          <div key={slug} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
            <Frame
              ratio={slug}
              style={{
                background:
                  'repeating-linear-gradient(45deg, var(--surface-primary), var(--surface-primary) 8px, var(--surface-secondary) 8px, var(--surface-secondary) 16px)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--border-radius-md)',
              }}
            />
            <code
              style={{
                fontFamily: 'var(--font-family-code, ui-monospace, monospace)',
                fontSize: 'var(--body-xs)', // bds-lint-ignore
                color: 'var(--text-primary)',
              }}
            >
              {`<Frame ratio="${slug}" />`}
            </code>
          </div>
        ))}
      </Grid>
    </Section>
  ),
};
