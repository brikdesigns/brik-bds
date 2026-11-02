import { describe, it, expect } from 'vitest';

import { resolveSectionProps } from './section-axes';

const defaults = { layout: 'split', align: 'left', blueprintKey: 'hero_split' } as const;

describe('resolveSectionProps', () => {
  it('section axes beat the registry default', () => {
    const out = resolveSectionProps(defaults, {
      align: 'center',
      columns: 4,
      media: { role: 'bg-video', ratio: '16-9', source: 'client' },
    });
    expect(out).toMatchObject({
      layout: 'split',
      blueprintKey: 'hero_split',
      align: 'center',
      columns: 4,
      media: 'bg-video',
      imageRatio: '16-9',
    });
  });

  it('keeps the registry default when the section leaves an axis unset', () => {
    const out = resolveSectionProps(defaults, {});
    expect(out).toEqual(defaults);
    expect('columns' in out).toBe(false);
    expect('media' in out).toBe(false);
  });

  it('does not clobber a default with an explicit undefined', () => {
    const out = resolveSectionProps(defaults, { align: undefined });
    expect(out.align).toBe('left');
  });

  it('media role none sets media without a ratio', () => {
    const out = resolveSectionProps(defaults, { media: { role: 'none' } });
    expect(out.media).toBe('none');
    expect('imageRatio' in out).toBe(false);
  });
});
