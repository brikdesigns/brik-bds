import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { BrikDevBar, useDevBarSlot, useDevBarApi } from './BrikDevBar';
import type { DevBarSlotDef } from './BrikDevBar';

const meta: Meta<typeof BrikDevBar> = {
  title: 'Dev Tools/BrikDevBar',
  component: BrikDevBar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BrikDevBar>;

// ── Icon helpers ────────────────────────────────────────────────────────────

const PERSONAS_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';

const THEME_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20" opacity=".4"/><path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" stroke="none"/></svg>';

const GRID_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';

// ── Story components ─────────────────────────────────────────────────────────

/**
 * Demonstrates BrikDevBar loading devbar.js + two registered slots.
 * The brik-devbar.js script is served from Storybook's /public directory.
 */
function DevBarWithSlots() {
  const [personasOpen, setPersonasOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const personasSlot: DevBarSlotDef = {
    id: 'personas',
    label: 'Personas',
    icon: PERSONAS_ICON,
    order: 20,
    onActivate: () => setPersonasOpen(true),
    onDeactivate: () => setPersonasOpen(false),
  };

  const themeSlot: DevBarSlotDef = {
    id: 'theme',
    label: 'Theme',
    icon: THEME_ICON,
    order: 30,
    onActivate: () => setThemeOpen(true),
    onDeactivate: () => setThemeOpen(false),
  };

  useDevBarSlot(personasSlot);
  useDevBarSlot(themeSlot);

  return (
    <>
      <BrikDevBar />
      <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)' }}>
        <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--gap-md)' }}>
          BrikDevBar has been mounted. The DevBar shell loads from{' '}
          <code>/brik-devbar.js</code> and two slots have been registered via{' '}
          <code>useDevBarSlot</code>: <strong>Personas</strong> and <strong>Theme</strong>.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--body-sm)' }}>
          If the DevBar shell is available (brik-devbar.js loaded), you should see the
          toolbar appear at the bottom of the preview. The slots below reflect local
          open/close state driven by <code>onActivate</code> / <code>onDeactivate</code>.
        </p>
        <div style={{ marginTop: 'var(--gap-lg)', display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap' }}>
          <SlotIndicator id="personas" open={personasOpen} label="Personas slot" />
          <SlotIndicator id="theme" open={themeOpen} label="Theme slot" />
        </div>
      </div>
    </>
  );
}

function SlotIndicator({ id, open, label }: { id: string; open: boolean; label: string }) {
  const BDS_POPPY = '#e35335';
  const BDS_GRAY = '#e0e0e0';
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        border: `2px solid ${open ? BDS_POPPY : BDS_GRAY}`,
        background: open ? '#fff5f3' : '#fafafa',
        fontFamily: 'var(--font-family-label)',
        fontSize: 'var(--label-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: 160,
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: open ? BDS_POPPY : BDS_GRAY,
          flexShrink: 0,
          transition: 'background 0.15s',
        }}
      />
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </div>
        <div
          style={{
            color: open ? BDS_POPPY : 'var(--text-muted)',
            fontSize: '11px',
            marginTop: 2,
          }}
        >
          {open ? 'active' : 'inactive'} · id: {id}
        </div>
      </div>
    </div>
  );
}

/**
 * Demonstrates useDevBarApi() returning the imperative API handle.
 */
function DevBarApiDemo() {
  const api = useDevBarApi();
  const [gridOpen, setGridOpen] = useState(false);
  const [registered, setRegistered] = useState(false);

  const gridSlot: DevBarSlotDef = {
    id: 'grid',
    label: 'Grid',
    icon: GRID_ICON,
    order: 40,
    onActivate: () => setGridOpen(true),
    onDeactivate: () => setGridOpen(false),
  };

  useDevBarSlot(gridSlot);

  // Demonstrate imperative setBadge when panel is open
  useEffect(() => {
    if (!api) return;
    api.setBadge('grid', gridOpen ? 'ON' : null);
    api.setActive('grid', gridOpen);
  }, [api, gridOpen]);

  // Check registration status
  useEffect(() => {
    if (!api) return;
    const iv = setInterval(() => {
      setRegistered(api.isRegistered('grid'));
    }, 200);
    return () => clearInterval(iv);
  }, [api]);

  return (
    <>
      <BrikDevBar />
      <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)' }}>
        <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--gap-md)' }}>
          Demonstrates <code>useDevBarApi()</code> — imperative access for setting
          badges and toggling active state from outside the hook lifecycle.
        </p>
        <div style={{ marginTop: 'var(--gap-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
          <ApiRow label="window.BrikDevBar present" value={api !== null} />
          <ApiRow label="grid slot registered" value={registered} />
          <ApiRow label="grid slot active" value={gridOpen} />
        </div>
      </div>
    </>
  );
}

function ApiRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--gap-md)',
        fontFamily: 'var(--font-family-label)',
        fontSize: 'var(--label-sm)',
        color: 'var(--text-primary)',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: value ? '#22c55e' : '#e0e0e0',
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  );
}

// ── Stories ──────────────────────────────────────────────────────────────────

export const WithSlots: Story = {
  name: 'With Registered Slots',
  render: () => <DevBarWithSlots />,
};

export const ImperativeApi: Story = {
  name: 'Imperative API (useDevBarApi)',
  render: () => <DevBarApiDemo />,
};
