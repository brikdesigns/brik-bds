/**
 * Runtime half of the accessible-name requirement (brikdesigns/brik-bds#2699, #1940).
 *
 * The type-level half lives in accessibleName.type-test.tsx. This asserts the
 * `aria-label` / `aria-labelledby` a consumer passes actually lands on the
 * FOCUSABLE element, not just on a wrapper, so the type contract is true at
 * runtime. JSX is avoided (the `components` vitest project globs `*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DatePicker } from '../ui/DatePicker';
import { TimePicker } from '../ui/TimePicker';
import { Slider } from '../ui/Slider';
import { FileUploader } from '../ui/FileUploader';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { AddressInput } from '../ui/AddressInput';
import { MultiSelect } from '../ui/MultiSelect';

const html = (component: unknown, props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(component as ComponentType<Record<string, unknown>>, props));

/** The opening tag of the first element matching `tag` (optionally with a role). */
const openTag = (markup: string, tag: string, mustContain = '') => {
  const tags = markup.match(new RegExp(`<${tag}\\b[^>]*>`, 'g')) ?? [];
  return tags.find((t) => t.includes(mustContain)) ?? '';
};

const options = [{ label: 'One', value: '1' }];

describe('aria-label forwards to the focusable element', () => {
  const cases: [string, unknown, string, Record<string, unknown>, string][] = [
    ['DatePicker', DatePicker, 'button', {}, 'bds-date-picker__trigger'],
    ['TimePicker', TimePicker, 'button', {}, 'bds-time-picker__trigger'],
    ['Slider', Slider, 'input', {}, 'type="range"'],
    ['FileUploader', FileUploader, 'div', {}, 'role="button"'],
    ['TextInput', TextInput, 'input', {}, 'bds-text-input-field'],
    ['TextArea', TextArea, 'textarea', {}, 'bds-text-area-field'],
    ['Select', Select, 'select', { options }, 'bds-select'],
    ['ToggleSwitch', ToggleSwitch, 'input', {}, 'role="switch"'],
    ['AddressInput', AddressInput, 'input', {}, 'bds-address-input__input'],
    ['MultiSelect', MultiSelect, 'select', { options }, 'bds-select'],
  ];

  for (const [name, component, tag, extra, marker] of cases) {
    it(`${name}: aria-label`, () => {
      const t = openTag(html(component, { ...extra, 'aria-label': 'Purpose' }), tag, marker);
      expect(t).toContain('aria-label="Purpose"');
    });
    it(`${name}: aria-labelledby`, () => {
      const t = openTag(html(component, { ...extra, 'aria-labelledby': 'heading-id' }), tag, marker);
      expect(t).toContain('aria-labelledby="heading-id"');
    });
  }
});

describe('visible label still names the control', () => {
  it('Slider wires its label span to the range input via aria-labelledby', () => {
    const markup = html(Slider, { label: 'Volume' });
    const input = openTag(markup, 'input', 'type="range"');
    const id = /aria-labelledby="([^"]+)"/.exec(input)?.[1];
    expect(id).toBeTruthy();
    expect(markup).toContain(`<span id="${id}" class="bds-slider__label">Volume</span>`);
  });

  it('FileUploader names the dropzone from its label, not a fixed string', () => {
    const t = openTag(html(FileUploader, { label: 'Upload documents' }), 'div', 'role="button"');
    expect(t).toContain('aria-label="Upload documents"');
    expect(t).not.toContain('File upload dropzone');
  });

  it('FileUploader does not leak aria-label onto the non-interactive wrapper', () => {
    const wrapper = openTag(html(FileUploader, { 'aria-label': 'Upload' }), 'div', 'bds-file-uploader"');
    expect(wrapper).not.toContain('aria-label');
  });
});
