import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../Icon';
import * as Icons from '../../icons';
import {
  catalogGroup,
  isOffline,
  ungrouped,
  iconConstants,
  type CatalogEntry,
  type CatalogGroup,
} from './icon-catalog';

/* ─── Layout helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore — story-only inline demo style, not shipped component CSS
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const captionStyle = {
  fontFamily: 'var(--font-family-system, monospace)',
  fontSize: '10px', // bds-lint-ignore — caption size
  textAlign: 'center' as const,
  wordBreak: 'break-all' as const,
};

/**
 * One catalog cell: the glyph as the atom paints it, the constant name to
 * import, the raw `ph:*` name behind it, and whether it resolves offline.
 */
const IconCard = ({ entry }: { entry: CatalogEntry }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--gap-xs)',
    padding: 'var(--padding-md)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-muted)',
  }}>
    <Icon icon={entry.icon} style={{ fontSize: '20px', color: 'var(--text-primary)' }} /> {/* bds-lint-ignore — icon display size */}
    <span style={{ ...captionStyle, color: 'var(--text-secondary)' }}>{entry.name}</span>
    <span style={{ ...captionStyle, color: 'var(--text-muted)' }}>{entry.icon}</span>
    <span
      style={{ ...captionStyle, color: entry.offline ? 'var(--text-muted)' : 'var(--text-negative)' }}
      title={entry.offline
        ? 'Bundled in icons.generated.json — renders with the network blocked'
        : 'Not in the bundled subset — falls through to a runtime Iconify CDN fetch; run npm run gen:icons'}
    >
      {entry.offline ? 'offline' : 'CDN'}
    </span>
  </div>
);

const IconGrid = ({ entries }: { entries: CatalogEntry[] }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: 'var(--gap-md)',
  }}>
    {entries.map((entry) => <IconCard key={entry.name} entry={entry} />)}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/**
 * Render one whole group from `icons.ts` — sections and glyphs alike are
 * derived, so a constant added to the module appears here with no story edit.
 */
const Group = ({ group }: { group: CatalogGroup }) => (
  <Stack>
    {catalogGroup(group).map(({ section, entries }) => (
      <div key={section}>
        <SectionLabel>{section}</SectionLabel>
        <IconGrid entries={entries} />
      </div>
    ))}
  </Stack>
);

/* ─── Placeholder component for meta ─────────────────────────── */

const IconsReference = () => <div />;

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof IconsReference> = {
  title: 'Assets/icon-catalog',
  component: IconsReference,
  // Browsable catalog of `components/icons.ts`, NOT a component — `index.ts` is
  // `export {}`. Retitled off `Assets/icons` so it no longer reads as a second
  // Icon component next to `Assets/icon` (#2407). Derived from the module's own
  // exports and rendered through the BDS `<Icon>` atom, so it shows the weight a
  // consumer actually gets (#2628). Hidden from MCP discovery so consumer-repo
  // agents don't pick it as a primitive (#1314).
  tags: ['surface-shared', '!manifest'],
  parameters: {
    layout: 'padded',
    docs: { toc: true },
  },
};

export default meta;
type Story = StoryObj<typeof IconsReference>;

/* ═══════════════════════════════════════════════════════════════
   1. OVERVIEW — Package info, setup
   ═══════════════════════════════════════════════════════════════ */

/** @summary Setup and configuration overview */
export const Setup: Story = {
  name: 'Setup',
  render: () => (
    <Stack>
      <div style={{
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-md)',
        color: 'var(--text-primary)',
        lineHeight: 'var(--font-line-height-normal)',
        maxWidth: '640px',
      }}>
        <h3 style={{ fontFamily: 'var(--font-family-heading)', margin: '0 0 var(--gap-sm)' }}>
          Phosphor icons through the BDS atom
        </h3>
        <p style={{ margin: '0 0 var(--gap-md)', color: 'var(--text-secondary)' }}>
          BDS wraps Iconify with its own <code>&lt;Icon&gt;</code> atom, which
          resolves Phosphor (<code>ph:*</code>) glyphs from a subset bundled into the package — no
          runtime CDN request. Every glyph in this catalog renders through that atom, so it shows
          the default <code>outline-bold</code> weight a consumer actually gets.
        </p>
        <p style={{ margin: '0 0 var(--gap-md)', color: 'var(--text-secondary)' }}>
          The name constants in <code>components/icons.ts</code> are internal to BDS source.
          A consuming app passes the <code>ph:*</code> string, or imports the semantic{' '}
          <code>ACTION_ICONS</code> set.
        </p>
      </div>

      <div>
        <SectionLabel>Usage</SectionLabel>
        <pre style={{
          fontFamily: 'var(--font-family-system, monospace)',
          fontSize: '13px', // bds-lint-ignore — story-only demo label sizing, not shipped component CSS
          background: 'var(--surface-primary)',
          padding: 'var(--padding-lg)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--border-muted)',
          overflow: 'auto',
          margin: 0,
          color: 'var(--text-primary)',
        }}>
{`// Inside BDS source — import the constant
import { Icon } from '../Icon';
import { Check, X, Info } from '../../icons';

<Icon icon={Check} />
<Icon icon={X} style={{ fontSize: '24px' }} />

// In a consuming app — the name constants stay internal to BDS,
// so pass the \`ph:*\` string, or the semantic action set.
import { Icon, ACTION_ICONS } from '@brikdesigns/bds';

<Icon icon="ph:check" />
<Icon icon={ACTION_ICONS.edit} />`}
        </pre>
      </div>

      <div>
        <SectionLabel>Sample icons</SectionLabel>
        <div style={{ display: 'flex', gap: 'var(--gap-xl)', alignItems: 'center' }}>
          {[Icons.Check, Icons.X, Icons.Info, Icons.House, Icons.Gear].map((icon) => (
            <Icon key={icon} icon={icon} style={{ fontSize: '24px', color: 'var(--text-primary)' }} /> /* bds-lint-ignore — icon display size */
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Coverage</SectionLabel>
        <p style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-sm)',
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          {iconConstants().length} constants in <code>components/icons.ts</code>,{' '}
          {iconConstants().filter((e) => e.offline).length} of them bundled for offline use.
          Each card below names the constant, its <code>ph:*</code> string, and which of the two it is.
        </p>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   2–6. THE CATALOG — one story per intent group, all derived
   ═══════════════════════════════════════════════════════════════ */

/** @summary System */
export const System: Story = { name: 'System', render: () => <Group group="System" /> };

/** @summary Navigation */
export const Navigation: Story = { name: 'Navigation', render: () => <Group group="Navigation" /> };

/** @summary Actions */
export const Actions: Story = {
  name: 'Actions',
  render: () => (
    <Stack>
      <Group group="Actions" />
      <div>
        {/* Canonical CRUD + integration-lifecycle set (#1127) — semantic name → glyph.
            Public via `import { ACTION_ICONS } from '@brikdesigns/bds'`. */}
        <SectionLabel>Lifecycle actions (ACTION_ICONS)</SectionLabel>
        <IconGrid entries={Object.entries(Icons.ACTION_ICONS).map(([name, icon]) => ({
          name, icon, offline: isOffline(icon),
        }))} />
      </div>
    </Stack>
  ),
};

/** @summary Objects */
export const Objects: Story = { name: 'Objects', render: () => <Group group="Objects" /> };

/** @summary Domain */
export const Domain: Story = { name: 'Domain', render: () => <Group group="Domain" /> };

/* ═══════════════════════════════════════════════════════════════
   7. UNGROUPED — the drift bucket
   ═══════════════════════════════════════════════════════════════ */

/**
 * Constants `ICON_SECTIONS` does not file. Empty is the healthy state, and
 * `icon-catalog.test.ts` reds if it is not — this story is what makes a stray
 * visible in Storybook between adding a constant and CI saying so.
 * @summary Constants not filed into a group — empty is healthy
 */
export const Ungrouped: Story = {
  name: 'Ungrouped',
  render: () => {
    const strays = ungrouped();
    return strays.length === 0 ? (
      <p style={{
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-md)',
        color: 'var(--text-secondary)',
        margin: 0,
      }}>
        All {iconConstants().length} constants in <code>components/icons.ts</code> are filed into a
        group. A new constant shows up here until it is given a home in{' '}
        <code>ICON_SECTIONS</code>.
      </p>
    ) : (
      <div>
        <SectionLabel>Not filed in ICON_SECTIONS</SectionLabel>
        <IconGrid entries={strays} />
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   8. SIZING — Scale reference
   ═══════════════════════════════════════════════════════════════ */

/* `fontSize` sizing + the fixed-width alignment pattern live in Icons.mdx as
   docs-local demos (rule 5, #1489 / #1643). */
