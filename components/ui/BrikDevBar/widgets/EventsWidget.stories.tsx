import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { BrikDevBar } from '../BrikDevBar';

/**
 * Brik DevBar — Events slot.
 *
 * Source: components/ui/BrikDevBar/widgets/events-widget.js (canonical).
 *
 * Subscribes to the `@brikdesigns/events` MemoryTransport buffer (window
 * global `__brikEventsMemory`) and renders a live-tail panel of recent
 * events. If the SDK isn't initialized on the page, the slot still
 * registers and shows a "no events yet" placeholder.
 *
 * Self-bootstrapping: no data-attrs required. Polls every 500ms for a
 * late-arriving MemoryTransport.
 *
 * The story below seeds a fake MemoryTransport on `window` so the panel
 * has something to display.
 */
const meta: Meta = {
  title: 'Tools/widgets/events',
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

interface FakeEvent {
  name: string;
  ts: number;
  payload?: Record<string, unknown>;
}

interface FakeMemoryTransport {
  buffer: FakeEvent[];
  push: (e: FakeEvent) => void;
  list: () => FakeEvent[];
}

declare global {
  interface Window {
    __brikEventsMemory?: FakeMemoryTransport;
    __brikEventsWidgetInitialized?: boolean;
  }
}

function loadEventsScript() {
  const MARKER = 'data-brik-events-loader';
  if (document.querySelector(`script[${MARKER}]`)) return;
  const s = document.createElement('script');
  s.src = '/brik-events-widget.js';
  s.async = false;
  s.setAttribute(MARKER, '');
  document.head.appendChild(s);
}

function EventsDemo({ seed }: { seed: boolean }) {
  useEffect(() => {
    if (seed && !window.__brikEventsMemory) {
      const buf: FakeEvent[] = [
        { name: 'page.viewed', ts: Date.now() - 4000, payload: { path: '/' } },
        { name: 'cta.clicked', ts: Date.now() - 2500, payload: { id: 'hero-primary' } },
        { name: 'form.submitted', ts: Date.now() - 1000, payload: { form: 'contact' } },
      ];
      window.__brikEventsMemory = {
        buffer: buf,
        push(e) {
          this.buffer.push(e);
        },
        list() {
          return this.buffer.slice();
        },
      };
    }
    loadEventsScript();
  }, [seed]);

  return (
    <>
      <BrikDevBar />
      <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', maxWidth: 720 }}>
        <h2 style={{ fontSize: 'var(--heading-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Events slot
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--gap-sm)' }}>
          Open the Events slot in the DevBar (bottom of the preview) to see the live event tail.
          {seed
            ? ' This story seeds a fake MemoryTransport with three events.'
            : ' This story does NOT seed events — you should see the empty-state placeholder.'}
        </p>
        {seed && (
          <button
            type="button"
            style={{
              marginTop: 'var(--gap-md)',
              padding: '8px 16px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border-secondary)',
              background: 'var(--surface-primary)',
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              cursor: 'pointer',
            }}
            onClick={() => {
              window.__brikEventsMemory?.push({
                name: 'demo.clicked',
                ts: Date.now(),
                payload: { source: 'storybook' },
              });
            }}
          >
            Push demo event
          </button>
        )}
      </div>
    </>
  );
}

/** @summary With seeded events */
export const WithSeededEvents: Story = {
  name: 'With seeded events',
  render: () => <EventsDemo seed={true} />,
};

/** @summary Empty state */
export const EmptyState: Story = {
  name: 'No SDK loaded → empty state',
  render: () => <EventsDemo seed={false} />,
};
