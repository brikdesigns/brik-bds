import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  extractStories,
  summaryTextFrom,
  axisReviewReason,
  axisGalleryNotices,
  bareLintIgnoreViolations,
} = require('../lint-story-shape.js');

/**
 * The `bds-lint-ignore` review marker on `axis-gallery-shape` notices (#1502).
 *
 * The notice tier is deliberately never-gating, so the only thing keeping it
 * useful is that a reviewed story stops reporting. These cases pin that: a
 * reasoned marker clears the notice, a bare one is a hard violation (#1469),
 * and an unmarked gallery still reports.
 */

/** A story file with one gallery-shaped export carrying `jsdoc` above it. */
const fileWith = (jsdoc) => `
import type { Meta, StoryObj } from '@storybook/react-vite';
const meta: Meta<typeof Thing> = { title: 'x' };
export default meta;
type Story = StoryObj<typeof Thing>;

${jsdoc}
export const Palette: Story = {
  render: () => (
    <div>
      {(['a', 'b', 'c'] as const).map((v) => (
        <Thing key={v} tone={v} />
      ))}
    </div>
  ),
};
`;

const noticesFor = (jsdoc) => axisGalleryNotices(extractStories(fileWith(jsdoc)), 'Thing');

describe('axisReviewReason', () => {
  it('returns null when the story carries no marker', () => {
    const [story] = extractStories(fileWith('/** @summary Tone palette */'));
    expect(axisReviewReason(story)).toBeNull();
  });

  it('returns the reason when the marker carries one', () => {
    const [story] = extractStories(
      fileWith('/**\n * bds-lint-ignore — real Q4 composition\n * @summary Tone palette\n */'),
    );
    expect(axisReviewReason(story)).toBe('real Q4 composition');
  });

  it('returns an empty string for a bare marker', () => {
    const [story] = extractStories(fileWith('/**\n * bds-lint-ignore\n * @summary Tone palette\n */'));
    expect(axisReviewReason(story)).toBe('');
  });

  it('does not read the marker off a JSDoc that does not abut the export', () => {
    const detached = `
/** bds-lint-ignore — belongs to something else */
const helper = 1;

/** @summary Tone palette */
export const Palette: Story = { render: () => <Thing /> };
`;
    const [story] = extractStories(detached);
    expect(axisReviewReason(story)).toBeNull();
  });
});

describe('axis-gallery-shape notice suppression', () => {
  it('reports an unmarked gallery-shaped story', () => {
    expect(noticesFor('/** @summary Tone palette */')).toHaveLength(1);
  });

  it('suppresses the notice once a reasoned marker is present', () => {
    expect(
      noticesFor('/**\n * bds-lint-ignore — tones are a token contract\n * @summary Tone palette\n */'),
    ).toHaveLength(0);
  });

  it('still reports when the marker is bare — a bare marker is not a review', () => {
    expect(noticesFor('/**\n * bds-lint-ignore\n * @summary Tone palette\n */')).toHaveLength(1);
  });
});

describe('bareLintIgnoreViolations', () => {
  it('flags a bare marker as a hard violation (#1469)', () => {
    const stories = extractStories(fileWith('/**\n * bds-lint-ignore\n * @summary Tone palette\n */'));
    const out = bareLintIgnoreViolations(stories);
    expect(out).toHaveLength(1);
    expect(out[0].rule).toBe('bare-lint-ignore');
  });

  it('accepts a reasoned marker', () => {
    const stories = extractStories(
      fileWith('/**\n * bds-lint-ignore — stated reason\n * @summary Tone palette\n */'),
    );
    expect(bareLintIgnoreViolations(stories)).toHaveLength(0);
  });

  it('ignores stories with no marker at all', () => {
    expect(bareLintIgnoreViolations(extractStories(fileWith('/** @summary Tone palette */')))).toHaveLength(0);
  });
});

describe('summaryTextFrom stops at a marker line', () => {
  // Regression: the marker is not an `@tag`, so before #1502 a marker written
  // BELOW @summary was swallowed into the summary and surfaced as a baffling
  // `summary-too-long` violation instead of suppressing the notice.
  it('does not swallow a marker that follows @summary', () => {
    const jsdoc = '/**\n * @summary Tone palette\n * bds-lint-ignore — a reason long enough to blow the 60-char summary cap easily\n */';
    expect(summaryTextFrom(jsdoc)).toBe('Tone palette');
  });

  it('reads the summary normally when the marker precedes it', () => {
    const jsdoc = '/**\n * bds-lint-ignore — a reason\n * @summary Tone palette\n */';
    expect(summaryTextFrom(jsdoc)).toBe('Tone palette');
  });
});
