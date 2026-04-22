/**
 * WCAG 2.1 contrast ratio calculation — pure math, no DOM.
 * AA threshold: 4.5:1 for normal text, 3:1 for large text and UI components.
 */

export function isHex(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace('#', '');
  const expanded = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ];
}

function parseRgbString(value: string): [number, number, number] | null {
  const m = value.trim().match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

function toRgb(value: string): [number, number, number] | null {
  if (isHex(value)) return hexToRgb(value);
  return parseRgbString(value);
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const linear = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function contrastRatio(a: string, b: string): number {
  const rgbA = toRgb(a);
  const rgbB = toRgb(b);
  if (!rgbA || !rgbB) return 0;
  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (lighter + 0.05) / (darker + 0.05);
}
