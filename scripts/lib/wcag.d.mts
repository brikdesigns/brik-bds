export function hexToRgb(hex: string): [number, number, number];
export function srgbToLinear(c: number): number;
export function luminance(rgb: [number, number, number]): number;
export function parseRgb(value: string): [number, number, number] | null;
export function toRgb(value: string): [number, number, number] | null;
export function contrastRatio(a: string, b: string): number;
export function isHex(value: string): boolean;
