'use client';

/**
 * Storybook preview FeedbackWidget — thin wrapper around the canonical
 * DevFeedbackWidget in @brikdesigns/bds. Exists only to supply Storybook-
 * specific context (current story id + component). All visual logic lives in
 * BDS; this file must not restyle or reimplement the widget.
 *
 * Previously this wrapper passed only `getContextValue` (the story id string),
 * which the middleware ignores — so every Storybook-sourced Backlog item landed
 * in Notion with `URL = ?path=/story//iframe.html` (the widget's default
 * `page_url` is `window.location.pathname`, which is `/iframe.html` inside the
 * preview iframe) and an empty `Component`. That produced the un-triageable pile
 * decomposed in #1444. See #1451.
 *
 * Fix (no change to the shared component): read the live story from the synced
 * `?id=` param + the preview channel's `storyRendered` event, resolve its
 * title/component from Storybook's `/index.json`, and pass:
 *   - `page_url` (via extraPayload, spread last so it wins) = story id, so the
 *     middleware composes `?path=/story/<id>` into the Notion URL — a real link.
 *   - `component` / `componentTitle` = the story's leaf title + full path, so
 *     Notion's Component field is populated and triage-by-component works.
 */

import { useEffect, useState } from 'react';
import { addons } from 'storybook/preview-api';

import { DevFeedbackWidget } from '../components/ui/DevFeedbackWidget';

// Storybook core event name (stable public contract). Not re-exported from
// `storybook/preview-api`, and `storybook/internal/*` is not a browser-bundle
// friendly path — so the literal is the least-fragile source.
const STORY_RENDERED = 'storyRendered';

type StoryIndexEntry = { title?: string; name?: string };
type StoryCtx = { storyId: string; component?: string; componentTitle?: string };

// Storybook serves `/index.json` (id → { title, name, ... }); fetched once and
// cached. A missing/failed index degrades gracefully to id-only capture.
let indexCache: Record<string, StoryIndexEntry> | null = null;
async function loadIndex(): Promise<Record<string, StoryIndexEntry>> {
  if (indexCache) return indexCache;
  try {
    const res = await fetch('/index.json', { cache: 'no-cache' });
    if (res.ok) {
      const data = (await res.json()) as { entries?: Record<string, StoryIndexEntry> };
      indexCache = data.entries ?? {};
    }
  } catch {
    // Offline / static export without index — id-only capture still works.
  }
  return indexCache ?? {};
}

function currentStoryId(): string {
  if (typeof window === 'undefined') return '';
  try {
    return new URLSearchParams(window.location.search).get('id') ?? '';
  } catch {
    return '';
  }
}

function buildCtx(id: string, entries: Record<string, StoryIndexEntry>): StoryCtx {
  const entry = entries[id];
  const title = entry?.title; // e.g. "Displays/Card/Card"
  const component = title ? title.split('/').pop() : undefined; // "Card"
  const componentTitle = title
    ? entry?.name
      ? `${title} — ${entry.name}`
      : title
    : undefined;
  return { storyId: id, component, componentTitle };
}

export function FeedbackWidget() {
  const [ctx, setCtx] = useState<StoryCtx>({ storyId: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let active = true;
    const channel = addons.getChannel();

    const refresh = async (payload?: unknown) => {
      const fromEvent =
        typeof payload === 'string'
          ? payload
          : payload && typeof payload === 'object' && 'storyId' in payload
          ? String((payload as { storyId?: string }).storyId ?? '')
          : '';
      const id = fromEvent || currentStoryId();
      if (!id) return;
      const entries = await loadIndex();
      if (active) setCtx(buildCtx(id, entries));
    };

    channel.on(STORY_RENDERED, refresh);
    void refresh(); // seed from the currently-rendered story

    return () => {
      active = false;
      channel.off(STORY_RENDERED, refresh);
    };
  }, []);

  const storyId = ctx.storyId || currentStoryId();

  return (
    <DevFeedbackWidget
      endpoint="/api/feedback"
      contextLabel="Story"
      getContextValue={() => storyId}
      page={ctx.componentTitle ?? storyId}
      component={ctx.component}
      componentTitle={ctx.componentTitle}
      // `page_url` has no dedicated prop; the widget spreads extraPayload last,
      // so this overrides its `window.location.pathname` default. The middleware
      // wraps it as `?path=/story/<page_url>` for the Notion URL.
      extraPayload={{ page_url: storyId }}
    />
  );
}
