import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  /* ── System / feedback ── */
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  faCircleInfo,
  faCircleXmark,
  faSpinner,
  faRotate,
  faXmark,

  /* ── Navigation ── */
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faArrowDown,
  faCaretDown,
  faCaretUp,
  faBars,
  faEllipsis,
  faEllipsisVertical,

  /* ── Actions ── */
  faPlus,
  faMinus,
  faPen,
  faTrash,
  faCheck,
  faCopy,
  faDownload,
  faUpload,
  faShareNodes,
  faMagnifyingGlass,
  faFilter,
  faSort,

  /* ── Objects / content ── */
  faUser,
  faUsers,
  faEnvelope,
  faPhone,
  faLocationDot,
  faCalendar,
  faClock,
  faFile,
  faFolder,
  faImage,
  faLink,
  faPaperclip,
  faComment,
  faBell,
  faGear,
  faHouse,
  faBuilding,
  faTag,
  faStar,
  faHeart,
  faBookmark,
  faLock,
  faUnlock,
  faEye,
  faEyeSlash,

  /* ── Branding / domain ── */
  faRocket,
  faPalette,
  faShieldHalved,
  faGears,
  faChartLine,
  faChartPie,
  faChartBar,
  faBriefcase,
  faGraduationCap,
  faStethoscope,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

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

const IconGrid = ({ icons }: { icons: { icon: IconDefinition; label: string }[] }) => (
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
        border: '1px solid var(--border-default)',
      }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: '20px', color: 'var(--text-primary)' }} />
        <span style={{
          fontFamily: 'var(--font-family-mono, monospace)',
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
   1. OVERVIEW — Package info, setup, style comparison
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
          Font Awesome 7 — Free Solid
        </h3>
        <p style={{ margin: '0 0 var(--gap-md)', color: 'var(--text-secondary)' }}>
          BDS uses <code>@fortawesome/free-solid-svg-icons</code> (v7.2+) with the React component
          wrapper <code>@fortawesome/react-fontawesome</code>. Icons render as inline SVGs — no
          icon font files, no CSS injection at runtime (<code>autoAddCss = false</code>).
        </p>
        <p style={{ margin: '0 0 var(--gap-md)', color: 'var(--text-secondary)' }}>
          Only <strong>solid</strong> (filled) style is currently installed. Regular (outline) icons
          would require adding <code>@fortawesome/free-regular-svg-icons</code>.
        </p>
      </div>

      <div>
        <SectionLabel>Usage</SectionLabel>
        <pre style={{
          fontFamily: 'var(--font-family-mono, monospace)',
          fontSize: '13px', // bds-lint-ignore
          background: 'var(--background-card)',
          padding: 'var(--padding-lg)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--border-default)',
          overflow: 'auto',
          margin: 0,
          color: 'var(--text-primary)',
        }}>
{`import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

<FontAwesomeIcon icon={faCheck} />
<FontAwesomeIcon icon={faCheck} size="lg" />
<FontAwesomeIcon icon={faCheck} fixedWidth />`}
        </pre>
      </div>

      <div>
        <SectionLabel>Solid (filled) — current</SectionLabel>
        <div style={{ display: 'flex', gap: 'var(--gap-xl)', alignItems: 'center' }}>
          {[faCheck, faXmark, faCircleInfo, faHouse, faGear].map((icon, i) => (
            <FontAwesomeIcon key={i} icon={icon} style={{ fontSize: '24px', color: 'var(--text-primary)' }} />
          ))}
        </div>
      </div>

      <div style={{
        padding: 'var(--padding-md)',
        background: 'var(--background-warning)',
        borderRadius: 'var(--border-radius-md)',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-sm)',
        color: 'var(--text-primary)',
      }}>
        <strong>Outline (regular) icons</strong> — not yet installed. To add:
        <code style={{ display: 'block', marginTop: 'var(--gap-xs)' }}>
          npm i @fortawesome/free-regular-svg-icons
        </code>
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
          { icon: faCircleCheck, label: 'circle-check' },
          { icon: faCircleExclamation, label: 'circle-exclamation' },
          { icon: faTriangleExclamation, label: 'triangle-exclamation' },
          { icon: faCircleInfo, label: 'circle-info' },
          { icon: faCircleXmark, label: 'circle-xmark' },
          { icon: faCheck, label: 'check' },
          { icon: faXmark, label: 'xmark' },
        ]} />
      </div>
      <div>
        <SectionLabel>Loading &amp; progress</SectionLabel>
        <IconGrid icons={[
          { icon: faSpinner, label: 'spinner' },
          { icon: faRotate, label: 'rotate' },
        ]} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. NAVIGATION — Arrows, chevrons, menus
   ═══════════════════════════════════════════════════════════════ */

export const Navigation: Story = {
  name: 'Navigation',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Chevrons</SectionLabel>
        <IconGrid icons={[
          { icon: faChevronLeft, label: 'chevron-left' },
          { icon: faChevronRight, label: 'chevron-right' },
          { icon: faChevronDown, label: 'chevron-down' },
          { icon: faChevronUp, label: 'chevron-up' },
          { icon: faCaretDown, label: 'caret-down' },
          { icon: faCaretUp, label: 'caret-up' },
        ]} />
      </div>
      <div>
        <SectionLabel>Arrows</SectionLabel>
        <IconGrid icons={[
          { icon: faArrowLeft, label: 'arrow-left' },
          { icon: faArrowRight, label: 'arrow-right' },
          { icon: faArrowUp, label: 'arrow-up' },
          { icon: faArrowDown, label: 'arrow-down' },
        ]} />
      </div>
      <div>
        <SectionLabel>Menus</SectionLabel>
        <IconGrid icons={[
          { icon: faBars, label: 'bars' },
          { icon: faEllipsis, label: 'ellipsis' },
          { icon: faEllipsisVertical, label: 'ellipsis-vertical' },
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
          { icon: faPlus, label: 'plus' },
          { icon: faMinus, label: 'minus' },
          { icon: faPen, label: 'pen' },
          { icon: faTrash, label: 'trash' },
          { icon: faCheck, label: 'check' },
          { icon: faCopy, label: 'copy' },
        ]} />
      </div>
      <div>
        <SectionLabel>File operations</SectionLabel>
        <IconGrid icons={[
          { icon: faDownload, label: 'download' },
          { icon: faUpload, label: 'upload' },
          { icon: faShareNodes, label: 'share-nodes' },
        ]} />
      </div>
      <div>
        <SectionLabel>Search &amp; filter</SectionLabel>
        <IconGrid icons={[
          { icon: faMagnifyingGlass, label: 'magnifying-glass' },
          { icon: faFilter, label: 'filter' },
          { icon: faSort, label: 'sort' },
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
          { icon: faUser, label: 'user' },
          { icon: faUsers, label: 'users' },
          { icon: faEnvelope, label: 'envelope' },
          { icon: faPhone, label: 'phone' },
          { icon: faComment, label: 'comment' },
          { icon: faBell, label: 'bell' },
        ]} />
      </div>
      <div>
        <SectionLabel>Location &amp; time</SectionLabel>
        <IconGrid icons={[
          { icon: faLocationDot, label: 'location-dot' },
          { icon: faBuilding, label: 'building' },
          { icon: faHouse, label: 'house' },
          { icon: faCalendar, label: 'calendar' },
          { icon: faClock, label: 'clock' },
        ]} />
      </div>
      <div>
        <SectionLabel>Content &amp; media</SectionLabel>
        <IconGrid icons={[
          { icon: faFile, label: 'file' },
          { icon: faFolder, label: 'folder' },
          { icon: faImage, label: 'image' },
          { icon: faLink, label: 'link' },
          { icon: faPaperclip, label: 'paperclip' },
        ]} />
      </div>
      <div>
        <SectionLabel>UI elements</SectionLabel>
        <IconGrid icons={[
          { icon: faGear, label: 'gear' },
          { icon: faTag, label: 'tag' },
          { icon: faStar, label: 'star' },
          { icon: faHeart, label: 'heart' },
          { icon: faBookmark, label: 'bookmark' },
          { icon: faLock, label: 'lock' },
          { icon: faUnlock, label: 'unlock' },
          { icon: faEye, label: 'eye' },
          { icon: faEyeSlash, label: 'eye-slash' },
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
          { icon: faRocket, label: 'rocket' },
          { icon: faPalette, label: 'palette' },
          { icon: faShieldHalved, label: 'shield-halved' },
          { icon: faGears, label: 'gears' },
        ]} />
      </div>
      <div>
        <SectionLabel>Data &amp; analytics</SectionLabel>
        <IconGrid icons={[
          { icon: faChartLine, label: 'chart-line' },
          { icon: faChartPie, label: 'chart-pie' },
          { icon: faChartBar, label: 'chart-bar' },
        ]} />
      </div>
      <div>
        <SectionLabel>Industry</SectionLabel>
        <IconGrid icons={[
          { icon: faBriefcase, label: 'briefcase' },
          { icon: faGraduationCap, label: 'graduation-cap' },
          { icon: faStethoscope, label: 'stethoscope' },
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
        <SectionLabel>Built-in size prop</SectionLabel>
        <div style={{ display: 'flex', gap: 'var(--gap-lg)', alignItems: 'end' }}>
          {(['xs', 'sm', 'lg', 'xl', '2xl'] as const).map((size) => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-xs)' }}>
              <FontAwesomeIcon icon={faStar} size={size} style={{ color: 'var(--text-primary)' }} />
              <span style={{
                fontFamily: 'var(--font-family-mono, monospace)',
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
        <SectionLabel>fixedWidth (equal-width column alignment)</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xs)' }}>
          {[faHouse, faUser, faEnvelope, faGear].map((icon, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--gap-sm)',
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-md)',
              color: 'var(--text-primary)',
            }}>
              <FontAwesomeIcon icon={icon} fixedWidth style={{ color: 'var(--text-secondary)' }} />
              <span>Menu item {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </Stack>
  ),
};
