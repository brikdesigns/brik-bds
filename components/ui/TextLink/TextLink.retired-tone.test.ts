/**
 * ADR-033 § 2's hue-source rename, at the render boundary (#1925).
 *
 * `resolveRetiredProp` is unit-tested on its own; this asserts the wiring for
 * the three components whose `tone` prop was the *emphasis* axis, not the
 * valence one — so a consumer still passing `tone` keeps rendering the same
 * pixels for one minor.
 *
 * All three are the pure `tone` → `emphasis` prop rename, covered together so one
 * does not stand in for the set.
 *
 * JSX is avoided to keep this a `.test.ts` file (the `components` vitest
 * project's include glob is `**\/*.test.ts`), matching Badge.retired-tone.test.ts.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TextLink } from './TextLink';
import { SocialIcon } from '../SocialIcon/SocialIcon';
import { ContactIcon } from '../ContactIcon/ContactIcon';

const link = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(TextLink, props as never, 'Label'));
const social = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(SocialIcon, { platform: 'youtube', ...props } as never));
const contact = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(ContactIcon, { platform: 'email', ...props } as never));

describe('TextLink retired `tone` prop', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the emphasis modifier for a canonical `emphasis`', () => {
    expect(link({ emphasis: 'neutral' })).toContain('bds-text-link--emphasis-neutral');
  });

  it('honours the deprecated `tone` prop', () => {
    const html = link({ tone: 'neutral' });
    expect(html).toContain('bds-text-link--emphasis-neutral');
    expect(html).not.toContain('bds-text-link--tone-neutral');
  });

  it('lets `emphasis` win when both props are passed', () => {
    expect(link({ emphasis: 'brand', tone: 'neutral' })).not.toContain('--emphasis-neutral');
  });

  it('defaults to `brand` — no emphasis modifier — when neither is passed', () => {
    expect(link({})).not.toContain('--emphasis-');
  });
});

describe('SocialIcon retired `tone` prop', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the emphasis modifier for a canonical `emphasis`', () => {
    expect(social({ emphasis: 'brand' })).toContain('bds-social-icon--emphasis-brand');
  });

  it('honours the deprecated `tone` prop', () => {
    expect(social({ tone: 'neutral' })).toContain('bds-social-icon--emphasis-neutral');
    expect(social({ tone: 'accent' })).toContain('bds-social-icon--emphasis-accent');
  });

  it('lets `emphasis` win when both props are passed', () => {
    expect(social({ emphasis: 'accent', tone: 'brand' })).toContain('bds-social-icon--emphasis-accent');
  });

  it('defaults to `neutral` when neither prop is passed', () => {
    expect(social({})).toContain('bds-social-icon--emphasis-neutral');
  });
});

/*
 * The warning TEXT is asserted in components/utils/retiredValue.test.ts, not
 * here: `resolveRetiredProp` de-dupes per component + prop pair in a
 * module-level Set that outlives an individual `it`, so the first case above to
 * pass `tone` consumes the one warning and every later one is silent by design.
 */

describe('ContactIcon retired `tone` prop', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the emphasis modifier for a canonical `emphasis`', () => {
    expect(contact({ emphasis: 'accent' })).toContain('bds-contact-icon--emphasis-accent');
  });

  it('honours the deprecated `tone` prop', () => {
    expect(contact({ tone: 'neutral' })).toContain('bds-contact-icon--emphasis-neutral');
  });

  it('defaults to `neutral` when neither prop is passed', () => {
    expect(contact({})).toContain('bds-contact-icon--emphasis-neutral');
  });
});
