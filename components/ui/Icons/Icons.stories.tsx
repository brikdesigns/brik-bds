import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import * as Icons from '../../icons';

/* ─── Layout helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const IconGrid = ({ icons }: { icons: { icon: string; label: string }[] }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: 'var(--gap-md)',
  }}>
    {icons.map(({ icon, label }) => (
      <div key={label} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--gap-xs)',
        padding: 'var(--padding-md)',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--border-muted)',
      }}>
        <Icon icon={icon} style={{ fontSize: '20px', color: 'var(--text-primary)' }} /> {/* bds-lint-ignore — icon display size */}
        <span style={{
          fontFamily: 'var(--font-family-system, monospace)',
          fontSize: '10px', // bds-lint-ignore — caption size
          color: 'var(--text-secondary)',
          textAlign: 'center' as const,
          wordBreak: 'break-all' as const,
        }}>
          {label}
        </span>
      </div>
    ))}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Placeholder component for meta ─────────────────────────── */

const IconsReference = () => <div />;

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof IconsReference> = {
  title: 'Foundations/Assets/icons',
  component: IconsReference,
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
          Iconify — Phosphor Icons
        </h3>
        <p style={{ margin: '0 0 var(--gap-md)', color: 'var(--text-secondary)' }}>
          BDS uses <code>@iconify/react</code> with the <code>@iconify-json/ph</code> (Phosphor) icon
          set. Icons render as inline SVGs from a bundled JSON collection — no network requests at runtime.
        </p>
        <p style={{ margin: '0 0 var(--gap-md)', color: 'var(--text-secondary)' }}>
          Icon string constants are defined in <code>components/icons.ts</code>. Import from there
          rather than using raw Iconify strings in components.
        </p>
      </div>

      <div>
        <SectionLabel>Usage</SectionLabel>
        <pre style={{
          fontFamily: 'var(--font-family-system, monospace)',
          fontSize: '13px', // bds-lint-ignore
          background: 'var(--surface-primary)',
          padding: 'var(--padding-lg)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--border-muted)',
          overflow: 'auto',
          margin: 0,
          color: 'var(--text-primary)',
        }}>
{`import { Icon } from '@iconify/react';
import { Check, X, Info } from 'components/icons';

<Icon icon={Check} />
<Icon icon={X} style={{ fontSize: '24px' }} />
<Icon icon={Info} className="my-class" />`}
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
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   2. SYSTEM — Feedback, status, and alert icons
   ═══════════════════════════════════════════════════════════════ */

export const System: Story = {
  name: 'System',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Feedback &amp; status</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.CheckCircle, label: 'CheckCircle' },
          { icon: Icons.WarningCircle, label: 'WarningCircle' },
          { icon: Icons.Warning, label: 'Warning' },
          { icon: Icons.Info, label: 'Info' },
          { icon: Icons.CircleX, label: 'CircleX' },
          { icon: Icons.Check, label: 'Check' },
          { icon: Icons.X, label: 'X' },
        ]} />
      </div>
      <div>
        <SectionLabel>Loading &amp; progress</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.Spinner, label: 'Spinner' },
          { icon: Icons.Rotate, label: 'Rotate' },
        ]} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. NAVIGATION — Arrows, carets, menus
   ═══════════════════════════════════════════════════════════════ */

export const Navigation: Story = {
  name: 'Navigation',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Carets</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.CaretLeft, label: 'CaretLeft' },
          { icon: Icons.CaretRight, label: 'CaretRight' },
          { icon: Icons.CaretDown, label: 'CaretDown' },
          { icon: Icons.CaretUp, label: 'CaretUp' },
        ]} />
      </div>
      <div>
        <SectionLabel>Arrows</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.ArrowLeft, label: 'ArrowLeft' },
          { icon: Icons.ArrowRight, label: 'ArrowRight' },
          { icon: Icons.ArrowUp, label: 'ArrowUp' },
          { icon: Icons.ArrowDown, label: 'ArrowDown' },
        ]} />
      </div>
      <div>
        <SectionLabel>Menus</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.Bars, label: 'Bars' },
          { icon: Icons.Ellipsis, label: 'Ellipsis' },
          { icon: Icons.EllipsisVertical, label: 'EllipsisVertical' },
        ]} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   4. ACTIONS — CRUD, search, sort, share
   ═══════════════════════════════════════════════════════════════ */

export const Actions: Story = {
  name: 'Actions',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Core actions</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.Plus, label: 'Plus' },
          { icon: Icons.Minus, label: 'Minus' },
          { icon: Icons.Pen, label: 'Pen' },
          { icon: Icons.Trash, label: 'Trash' },
          { icon: Icons.Check, label: 'Check' },
          { icon: Icons.Copy, label: 'Copy' },
        ]} />
      </div>
      <div>
        <SectionLabel>File operations</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.Download, label: 'Download' },
          { icon: Icons.Upload, label: 'Upload' },
          { icon: Icons.ShareNodes, label: 'ShareNodes' },
          { icon: Icons.CloudArrowUp, label: 'CloudArrowUp' },
        ]} />
      </div>
      <div>
        <SectionLabel>Search &amp; filter</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.MagnifyingGlass, label: 'MagnifyingGlass' },
          { icon: Icons.Filter, label: 'Filter' },
          { icon: Icons.Sort, label: 'Sort' },
        ]} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   5. OBJECTS — People, places, content, data
   ═══════════════════════════════════════════════════════════════ */

export const Objects: Story = {
  name: 'Objects',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>People &amp; communication</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.User, label: 'User' },
          { icon: Icons.Users, label: 'Users' },
          { icon: Icons.Envelope, label: 'Envelope' },
          { icon: Icons.Phone, label: 'Phone' },
          { icon: Icons.Comment, label: 'Comment' },
          { icon: Icons.Bell, label: 'Bell' },
        ]} />
      </div>
      <div>
        <SectionLabel>Location &amp; time</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.MapPin, label: 'MapPin' },
          { icon: Icons.Building, label: 'Building' },
          { icon: Icons.House, label: 'House' },
          { icon: Icons.Calendar, label: 'Calendar' },
          { icon: Icons.Clock, label: 'Clock' },
        ]} />
      </div>
      <div>
        <SectionLabel>Content &amp; media</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.File, label: 'File' },
          { icon: Icons.Folder, label: 'Folder' },
          { icon: Icons.Image, label: 'Image' },
          { icon: Icons.Link, label: 'Link' },
          { icon: Icons.Paperclip, label: 'Paperclip' },
        ]} />
      </div>
      <div>
        <SectionLabel>UI elements</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.Gear, label: 'Gear' },
          { icon: Icons.Tag, label: 'Tag' },
          { icon: Icons.Star, label: 'Star' },
          { icon: Icons.Heart, label: 'Heart' },
          { icon: Icons.Bookmark, label: 'Bookmark' },
          { icon: Icons.Lock, label: 'Lock' },
          { icon: Icons.Unlock, label: 'Unlock' },
          { icon: Icons.Eye, label: 'Eye' },
          { icon: Icons.EyeSlash, label: 'EyeSlash' },
        ]} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   6. DOMAIN — Industry, feature, and branding icons
   ═══════════════════════════════════════════════════════════════ */

export const Domain: Story = {
  name: 'Domain',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Feature / marketing</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.Rocket, label: 'Rocket' },
          { icon: Icons.Palette, label: 'Palette' },
          { icon: Icons.Shield, label: 'Shield' },
          { icon: Icons.Gears, label: 'Gears' },
        ]} />
      </div>
      <div>
        <SectionLabel>Data &amp; analytics</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.ChartLine, label: 'ChartLine' },
          { icon: Icons.ChartPie, label: 'ChartPie' },
          { icon: Icons.ChartBar, label: 'ChartBar' },
        ]} />
      </div>
      <div>
        <SectionLabel>Industry</SectionLabel>
        <IconGrid icons={[
          { icon: Icons.Briefcase, label: 'Briefcase' },
          { icon: Icons.GraduationCap, label: 'GraduationCap' },
          { icon: Icons.Stethoscope, label: 'Stethoscope' },
        ]} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   7. SIZING — Scale reference
   ═══════════════════════════════════════════════════════════════ */

export const Sizing: Story = {
  name: 'Sizing',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>fontSize scale</SectionLabel>
        <div style={{ display: 'flex', gap: 'var(--gap-lg)', alignItems: 'end' }}>
          {(['12px', '16px', '20px', '24px', '32px'] as const).map((size) => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-xs)' }}>
              <Icon icon={Icons.Star} style={{ fontSize: size, color: 'var(--text-primary)' }} />
              <span style={{
                fontFamily: 'var(--font-family-system, monospace)',
                fontSize: '10px', // bds-lint-ignore
                color: 'var(--text-secondary)',
              }}>
                {size}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Fixed-width column alignment</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xs)' }}>
          {[Icons.House, Icons.User, Icons.Envelope, Icons.Gear].map((icon, i) => (
            <div key={icon} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--gap-sm)',
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-md)',
              color: 'var(--text-primary)',
            }}>
              <Icon icon={icon} width={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span>Menu item {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </Stack>
  ),
};
