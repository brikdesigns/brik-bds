import type { NavigationIA } from '../../../content-system/schema';
import { docTable, docTh, docTd, docTdMono } from './docTableStyles';

interface Props {
  /** Label for the industry this IA belongs to (shown in the preview header). */
  industry: string;
  ia: NavigationIA;
}

/**
 * NavigationIASpec — Storybook renderer for a pack's `navigationIA` field.
 *
 * Three blocks:
 *   1. Visual preview — simplified mock of the rendered header bar.
 *   2. Primary data table — archetype, link count, scroll + mobile behavior.
 *   3. Mega-menu preview (if defined) — category grid with featured card.
 *
 * Designed as a shared doc component so all industry `.mdx` files render
 * IA consistently. When the BDS `<SiteHeader>` Astro blueprint component
 * ships, this preview should be replaced with a live render at realistic
 * dimensions; for now the static mock is adequate for scanning the IA
 * decisions at a glance.
 */
export function NavigationIASpec({ industry, ia }: Props) {
  return (
    <div style={{ marginBottom: 'var(--padding-xl, 40px)' }}>
      {/* ── Visual preview ──────────────────────────────────── */}
      <div
        style={{
          borderRadius: 'var(--border-radius-lg, 12px)',
          border: '1px solid var(--border-primary, #333)',
          overflow: 'hidden',
          marginBottom: 'var(--gap-lg, 16px)',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.04))',
        }}
      >
        {/* Mock header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-primary, #333)',
            background:
              ia.scrollBehavior === 'transparent-top-frosted-past-80'
                ? 'rgba(0,0,0,0.78)'
                : 'var(--background-primary, #fff)',
            color:
              ia.scrollBehavior === 'transparent-top-frosted-past-80'
                ? '#fff'
                : 'var(--text-primary, #000)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-family-heading)', fontWeight: 600 }}>
            {industry} Brand
          </span>
          <nav style={{ display: 'flex', gap: 20, flex: 1, fontSize: 13 }}>
            {ia.servicesMegaMenu && (
              <span style={{ opacity: 0.9 }}>{ia.servicesMegaMenu.triggerLabel} ▾</span>
            )}
            {ia.primaryLinks
              .filter((l) => l.label !== (ia.servicesMegaMenu?.triggerLabel ?? ''))
              .slice(0, ia.primaryLinkCount - (ia.servicesMegaMenu ? 1 : 0))
              .map((l) => (
                <span key={l.href} style={{ opacity: 0.8 }}>
                  {l.label}
                </span>
              ))}
          </nav>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
            {ia.utility.showPhone && <span style={{ opacity: 0.7 }}>(555) 000-0000</span>}
            <span
              style={{
                padding: '6px 14px',
                background:
                  ia.utility.primaryCTA.variant === 'solid' ? 'var(--background-brand-primary, #c49a2f)' : 'transparent',
                border:
                  ia.utility.primaryCTA.variant === 'ghost'
                    ? '1px solid var(--color-gold, #c49a2f)'
                    : 'none',
                color:
                  ia.utility.primaryCTA.variant === 'solid'
                    ? 'var(--color-black, #000)'
                    : 'var(--color-gold, #c49a2f)',
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

        {/* Caption */}
        <div
          style={{
            padding: '8px 20px',
            fontSize: 11,
            opacity: 0.55,
            fontFamily: 'var(--font-family-label)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Archetype: {ia.archetype}  ·  {ia.primaryLinkCount} primary  ·  {ia.scrollBehavior}
        </div>
      </div>

      {/* ── Data table ──────────────────────────────────── */}
      <table style={docTable}>
        <thead>
          <tr>
            <th style={docTh}>Field</th>
            <th style={docTh}>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={docTd}>Archetype</td>
            <td style={docTdMono}>{ia.archetype}</td>
          </tr>
          <tr>
            <td style={docTd}>Primary link count</td>
            <td style={docTdMono}>{ia.primaryLinkCount}</td>
          </tr>
          <tr>
            <td style={docTd}>Primary links</td>
            <td style={docTd}>
              {ia.primaryLinks.map((l) => l.label).join('  ·  ')}
            </td>
          </tr>
          <tr>
            <td style={docTd}>Services mega-menu</td>
            <td style={docTd}>
              {ia.servicesMegaMenu
                ? `Yes — ${ia.servicesMegaMenu.columns} columns, ${ia.servicesMegaMenu.categories.length} categories`
                : 'No'}
            </td>
          </tr>
          <tr>
            <td style={docTd}>Utility cluster</td>
            <td style={docTd}>
              {[
                ia.utility.showPhone ? 'phone' : null,
                `${ia.utility.primaryCTA.variant} CTA "${ia.utility.primaryCTA.label}"`,
                ia.utility.secondaryCTA ? `+ ${ia.utility.secondaryCTA.label}` : null,
              ]
                .filter(Boolean)
                .join('  ·  ')}
            </td>
          </tr>
          <tr>
            <td style={docTd}>Scroll behavior</td>
            <td style={docTdMono}>{ia.scrollBehavior}</td>
          </tr>
          <tr>
            <td style={docTd}>Mobile drawer</td>
            <td style={docTdMono}>{ia.mobileDrawer}</td>
          </tr>
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
              border: '1px solid var(--border-primary, #333)',
              borderRadius: 'var(--border-radius-md, 8px)',
              background: 'rgba(0,0,0,0.02)',
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
                    color: 'var(--color-gold, #c49a2f)',
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
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                      {item.note && (
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{item.note}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {ia.servicesMegaMenu.featured && (
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(196,154,47,0.08), transparent)',
                  border: '1px solid rgba(196,154,47,0.2)',
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
                    color: 'var(--color-gold, #c49a2f)',
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
                  }}
                >
                  {ia.servicesMegaMenu.featured.heading}
                </h5>
                <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12, lineHeight: 1.5 }}>
                  {ia.servicesMegaMenu.featured.body}
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-family-label)',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold, #c49a2f)',
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
