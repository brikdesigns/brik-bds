import {
  industryPacks,
  type IndustrySlug,
} from '@brikdesigns/bds/content-system';

/**
 * Server component. Renders an industry pack's `navigationIA` field as
 * a static spec — mock header bar at the top, structured data table
 * below, optional mega-menu preview if defined. Mirrors the Storybook
 * NavigationIASpec component but consumes the pack via slug instead of
 * taking the IA object directly, keeping the MDX surface tight.
 */

export interface NavigationIASpecProps {
  /**
   * Industry slug. Must exist in `industryPacks` from
   * `@brikdesigns/bds/content-system`.
   */
  industry: IndustrySlug;
  /**
   * Display name for the brand placeholder in the mock header.
   * Defaults to a title-cased version of the slug.
   */
  displayName?: string;
}

export function NavigationIASpec({
  industry,
  displayName,
}: NavigationIASpecProps) {
  const pack = industryPacks[industry];
  const ia = pack?.navigationIA;
  if (!ia) {
    return (
      <div
        style={{
          padding: 16,
          border: '1px dashed var(--border-muted)',
          borderRadius: 'var(--border-radius-md, 8px)',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        No navigationIA declared for industry pack <code>{industry}</code>.
      </div>
    );
  }

  const brandLabel = displayName ?? toTitleCase(industry);
  const isTransparentScroll =
    ia.scrollBehavior === 'transparent-top-frosted-past-80';

  return (
    <div style={{ marginBottom: 'var(--padding-xl, 40px)' }}>
      {/* ── Visual preview ──────────────────────────────────── */}
      <div
        style={{
          borderRadius: 'var(--border-radius-lg, 12px)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
          marginBottom: 'var(--gap-lg, 16px)',
          background: 'var(--surface-secondary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-primary)',
            background: isTransparentScroll
              ? 'var(--surface-inverse)'
              : 'var(--surface-primary)',
            color: isTransparentScroll
              ? 'var(--text-on-color-dark)'
              : 'var(--text-primary)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-family-heading)',
              fontWeight: 600,
            }}
          >
            {brandLabel} Brand
          </span>
          <nav
            style={{
              display: 'flex',
              gap: 20,
              flex: 1,
              fontSize: 13,
            }}
          >
            {ia.servicesMegaMenu && (
              <span style={{ opacity: 0.9 }}>
                {ia.servicesMegaMenu.triggerLabel} ▾
              </span>
            )}
            {ia.primaryLinks
              .filter((l) => l.label !== (ia.servicesMegaMenu?.triggerLabel ?? ''))
              .slice(
                0,
                ia.primaryLinkCount - (ia.servicesMegaMenu ? 1 : 0),
              )
              .map((l) => (
                <span key={l.href} style={{ opacity: 0.8 }}>
                  {l.label}
                </span>
              ))}
          </nav>
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              fontSize: 13,
            }}
          >
            {ia.utility.showPhone && (
              <span style={{ opacity: 0.7 }}>(555) 000-0000</span>
            )}
            <span
              style={{
                padding: '6px 14px',
                background:
                  ia.utility.primaryCTA.variant === 'solid'
                    ? 'var(--background-brand-primary)'
                    : 'transparent',
                border:
                  ia.utility.primaryCTA.variant === 'ghost'
                    ? '1px solid var(--border-brand-primary)'
                    : 'none',
                color:
                  ia.utility.primaryCTA.variant === 'solid'
                    ? 'var(--text-on-color-dark)'
                    : 'var(--text-brand-primary)',
                borderRadius: 'var(--border-radius-pill, 9999px)',
                fontFamily: 'var(--font-family-label)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {ia.utility.primaryCTA.label}
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '8px 20px',
            fontSize: 11,
            opacity: 0.55,
            fontFamily: 'var(--font-family-label)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}
        >
          Archetype: {ia.archetype} · {ia.primaryLinkCount} primary ·{' '}
          {ia.scrollBehavior}
        </div>
      </div>

      {/* ── Data table ──────────────────────────────────── */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
          marginBottom: 'var(--gap-lg, 16px)',
        }}
      >
        <tbody>
          <Row label="Archetype" mono>{ia.archetype}</Row>
          <Row label="Primary link count" mono>{ia.primaryLinkCount}</Row>
          <Row label="Primary links">
            {ia.primaryLinks.map((l) => l.label).join('  ·  ')}
          </Row>
          <Row label="Services mega-menu">
            {ia.servicesMegaMenu
              ? `Yes — ${ia.servicesMegaMenu.columns} columns, ${ia.servicesMegaMenu.categories.length} categories`
              : 'No'}
          </Row>
          <Row label="Utility cluster">
            {[
              ia.utility.showPhone ? 'phone' : null,
              `${ia.utility.primaryCTA.variant} CTA "${ia.utility.primaryCTA.label}"`,
              ia.utility.secondaryCTA
                ? `+ ${ia.utility.secondaryCTA.label}`
                : null,
            ]
              .filter(Boolean)
              .join('  ·  ')}
          </Row>
          <Row label="Scroll behavior" mono>{ia.scrollBehavior}</Row>
          <Row label="Mobile drawer" mono>{ia.mobileDrawer}</Row>
        </tbody>
      </table>

      {/* ── Mega-menu preview ──────────────────────────────────── */}
      {ia.servicesMegaMenu && (
        <div style={{ marginTop: 'var(--padding-lg, 24px)' }}>
          <h4
            style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: 'var(--heading-sm, 18px)',
              marginBottom: 'var(--gap-md, 12px)',
              color: 'var(--text-primary)',
            }}
          >
            {ia.servicesMegaMenu.triggerLabel} mega-menu
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${ia.servicesMegaMenu.columns}, 1fr)`,
              gap: 'var(--gap-lg, 16px)',
              padding: 'var(--padding-md, 20px)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--border-radius-md, 8px)',
              background: 'var(--surface-secondary)',
            }}
          >
            {ia.servicesMegaMenu.categories.map((cat) => (
              <div key={cat.heading}>
                <p
                  style={{
                    fontFamily: 'var(--font-family-label)',
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--text-brand-primary)',
                    marginBottom: 12,
                  }}
                >
                  {cat.heading}
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {cat.items.map((item) => (
                    <li key={item.href}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.label}
                      </div>
                      {item.note && (
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            marginTop: 2,
                          }}
                        >
                          {item.note}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {ia.servicesMegaMenu.featured && (
              <div
                style={{
                  background: 'var(--surface-brand-primary)',
                  border: '1px solid var(--border-brand-primary)',
                  borderRadius: 'var(--border-radius-md, 8px)',
                  padding: 'var(--padding-md, 16px)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-family-label)',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--text-brand-primary)',
                    marginBottom: 8,
                  }}
                >
                  {ia.servicesMegaMenu.featured.eyebrow}
                </p>
                <h5
                  style={{
                    fontFamily: 'var(--font-family-heading)',
                    fontSize: 16,
                    marginBottom: 8,
                    lineHeight: 1.3,
                    color: 'var(--text-primary)',
                  }}
                >
                  {ia.servicesMegaMenu.featured.heading}
                </h5>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    marginBottom: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {ia.servicesMegaMenu.featured.body}
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-family-label)',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--text-brand-primary)',
                  }}
                >
                  {ia.servicesMegaMenu.featured.ctaLabel} →
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  const cellStyle: React.CSSProperties = {
    padding: '8px 10px',
    borderBottom: '1px solid var(--border-muted)',
    verticalAlign: 'top',
  };
  return (
    <tr>
      <td style={{ ...cellStyle, fontWeight: 600 }}>{label}</td>
      <td
        style={{
          ...cellStyle,
          fontFamily: mono
            ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
            : 'inherit',
          fontSize: mono ? 12 : 'inherit',
        }}
      >
        {children}
      </td>
    </tr>
  );
}

function toTitleCase(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
