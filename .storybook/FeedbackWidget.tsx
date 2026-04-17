'use client';

/**
 * Storybook preview FeedbackWidget — thin wrapper around the canonical
 * DevFeedbackWidget in @brikdesigns/bds. Exists only to supply Storybook-
 * specific context (story ID from URL). All visual logic lives in BDS.
 *
 * Previously this file contained a full 300-line widget implementation that
 * drifted from the portal's copy. Consolidated on 2026-04-17.
 */

import { DevFeedbackWidget } from '../components/ui/DevFeedbackWidget';

function getStoryContext(): string {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') ?? window.location.pathname;
  } catch {
    return window.location.pathname;
  }
}

export function FeedbackWidget() {
  return (
    <DevFeedbackWidget
      endpoint="/api/feedback"
      contextLabel="Story"
      getContextValue={getStoryContext}
    />
  );
}
