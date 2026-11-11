/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';

import { VISUAL_STYLE_VALUES, VISUAL_STYLE_PRESETS, VISUAL_STYLE_EVIDENCE } from './visual-style';
import { ATMOSPHERE_VALUES, DEPRECATED_ATMOSPHERES } from './atmosphere';

describe('VISUAL_STYLE_PRESETS', () => {
  it.each(VISUAL_STYLE_VALUES)('%s has a preset that decides at least one axis', (style) => {
    const preset = VISUAL_STYLE_PRESETS[style];
    expect(preset, `${style} has no preset`).toBeDefined();
    expect(Object.keys(preset).length, `${style} decides no axis`).toBeGreaterThan(0);
  });

  it('has no entry for a value outside VISUAL_STYLE_VALUES', () => {
    expect(Object.keys(VISUAL_STYLE_PRESETS).sort()).toEqual([...VISUAL_STYLE_VALUES].sort());
  });

  it('never names a deprecated atmosphere', () => {
    for (const [style, preset] of Object.entries(VISUAL_STYLE_PRESETS)) {
      if (preset.atmosphere === undefined) continue;
      expect(ATMOSPHERE_VALUES).toContain(preset.atmosphere);
      expect(preset.atmosphere in DEPRECATED_ATMOSPHERES, `${style} uses a deprecated atmosphere`).toBe(false);
    }
  });
});

describe('VISUAL_STYLE_EVIDENCE', () => {
  it('files only real styles, carries no image, and dates every row', () => {
    expect(VISUAL_STYLE_EVIDENCE.length).toBeGreaterThan(0);
    for (const row of VISUAL_STYLE_EVIDENCE) {
      expect(VISUAL_STYLE_VALUES).toContain(row.primaryStyle);
      for (const m of row.modifiers) expect(VISUAL_STYLE_VALUES).toContain(m);
      expect(row).not.toHaveProperty('referenceImageUrl');
      expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.observation.length).toBeGreaterThan(0);
    }
  });
});
