import { useState, useEffect, useCallback } from 'react';
import { contrastRatio, isHex } from './wcag-contrast';

// ─── Types ──────────────────────────────────────────────────────────

export interface ContrastResult {
  label: string;
  textToken: string;
  bgToken: string;
  textValue: string;
  bgValue: string;
  ratio: number;
  pass: boolean;
}

export interface ThemeResult {
  name: string;
  resolvedColors: Record<string, string>;
  contrastPairs: ContrastResult[];
  fonts: Record<string, string>;
  hasFailures: boolean;
}

// ─── Config ─────────────────────────────────────────────────────────

const CONTRAST_PAIRS = [
  { text: '--text-primary', bg: '--page-primary', label: 'Body on page' },
  { text: '--text-primary', bg: '--surface-primary', label: 'Body on surface' },
  { text: '--text-secondary', bg: '--page-primary', label: 'Secondary on page' },
  { text: '--text-inverse', bg: '--surface-brand-primary', label: 'Inverse on brand' },
  { text: '--text-primary', bg: '--background-primary', label: 'Body on background' },
];

const SEMANTIC_COLORS = [
  '--text-primary', '--text-secondary', '--text-muted', '--text-inverse',
  '--text-brand-primary', '--background-primary', '--background-secondary',
  '--surface-primary', '--surface-secondary', '--surface-brand-primary',
  '--border-primary', '--border-muted', '--page-primary',
];

const FONT_TOKENS = ['--font-family-heading', '--font-family-body', '--font-family-label'];

const THEME_CLASSES = [
  { name: 'Brik (default)', className: '' },
  { name: 'Theme 1', className: 'theme-1' },
  { name: 'Theme 2', className: 'theme-2' },
  { name: 'Theme 3', className: 'theme-3' },
  { name: 'Theme 4', className: 'theme-4' },
  { name: 'Theme 5', className: 'theme-5' },
  { name: 'Theme 6', className: 'theme-6' },
  { name: 'Theme 7', className: 'theme-7' },
  { name: 'Theme 8', className: 'theme-8' },
];

// ─── Hook ───────────────────────────────────────────────────────────

export function useThemeCompliance(): ThemeResult[] {
  const [results, setResults] = useState<ThemeResult[]>([]);

  const evaluate = useCallback(() => {
    const themeResults: ThemeResult[] = [];

    for (const theme of THEME_CLASSES) {
      // Create a hidden probe element with the theme class
      const probe = document.createElement('div');
      probe.className = `body ${theme.className}`.trim();
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      probe.style.pointerEvents = 'none';
      document.body.appendChild(probe);

      const style = getComputedStyle(probe);

      // Read all semantic colors
      const resolvedColors: Record<string, string> = {};
      for (const token of SEMANTIC_COLORS) {
        resolvedColors[token] = style.getPropertyValue(token).trim();
      }

      // Read font families
      const fonts: Record<string, string> = {};
      for (const token of FONT_TOKENS) {
        fonts[token] = style.getPropertyValue(token).trim();
      }

      // Check contrast pairs
      const contrastPairs: ContrastResult[] = [];
      for (const pair of CONTRAST_PAIRS) {
        const textValue = resolvedColors[pair.text] || '';
        const bgValue = resolvedColors[pair.bg] || '';

        if (isHex(textValue) && isHex(bgValue)) {
          const ratio = Math.round(contrastRatio(textValue, bgValue) * 100) / 100;
          contrastPairs.push({
            label: pair.label,
            textToken: pair.text,
            bgToken: pair.bg,
            textValue,
            bgValue,
            ratio,
            pass: ratio >= 4.5,
          });
        } else {
          contrastPairs.push({
            label: pair.label,
            textToken: pair.text,
            bgToken: pair.bg,
            textValue,
            bgValue,
            ratio: 0,
            pass: false,
          });
        }
      }

      document.body.removeChild(probe);

      themeResults.push({
        name: theme.name,
        resolvedColors,
        contrastPairs,
        fonts,
        hasFailures: contrastPairs.some(p => !p.pass),
      });
    }

    setResults(themeResults);
  }, []);

  useEffect(() => {
    evaluate();
  }, [evaluate]);

  return results;
}
