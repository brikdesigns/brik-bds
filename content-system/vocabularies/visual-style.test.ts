/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';

import { VISUAL_STYLE_VALUES, VISUAL_STYLE_PRESETS } from './visual-style';
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
