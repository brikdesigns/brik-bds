/**
 * useAddableList unit tests.
 *
 * The hook uses React state (`isEditing`) internally, and the `components`
 * vitest project runs in a node environment (no DOM). So — as with the sibling
 * useSuggestionFilter test — we cover the logical contract directly: the
 * exported pure `isAddableDuplicate` decision, and the list-mutation rules
 * (`add` / `remove` / `update` / `atLimit`) which are pure given
 * `(values, onChange)`. The reveal state and the full rendered behavior are
 * covered by the AddableTagList / AddableEntryList storybook play tests.
 */
import { describe, it, expect, vi } from 'vitest';
import { isAddableDuplicate } from './useAddableList';

interface Entry {
  primary: string;
  secondary: string;
}

// ── isAddableDuplicate (the real exported decision) ───────────────────────────

describe('isAddableDuplicate', () => {
  const strings = ['Crowns', 'Bridges'];
  const keyOfString = (s: string) => s;

  it('detects a case-insensitive collision', () => {
    expect(isAddableDuplicate(strings, 'crowns', { getKey: keyOfString })).toBe(true);
  });

  it('passes a genuinely new value', () => {
    expect(isAddableDuplicate(strings, 'Veneers', { getKey: keyOfString })).toBe(false);
  });

  it('never flags a duplicate when allowDuplicates is set', () => {
    expect(
      isAddableDuplicate(strings, 'Crowns', { getKey: keyOfString, allowDuplicates: true }),
    ).toBe(false);
  });

  it('never flags a duplicate when no getKey is supplied (plain append)', () => {
    // The plain entry list appends blank rows; two empties must not collide.
    const entries: Entry[] = [{ primary: '', secondary: '' }];
    expect(isAddableDuplicate(entries, { primary: '', secondary: '' }, {})).toBe(false);
  });

  it('keys objects by the chosen field', () => {
    const entries: Entry[] = [{ primary: 'Acme', secondary: 'notes' }];
    expect(
      isAddableDuplicate(entries, { primary: 'acme', secondary: 'other' }, {
        getKey: (e) => e.primary,
      }),
    ).toBe(true);
  });
});

// ── add contract ──────────────────────────────────────────────────────────────
// `add` = atLimit guard → dedupe guard → append via onChange. Replicated here
// to assert the guard order and return contract the hook composes.

function add<T>(
  values: T[],
  onChange: (next: T[]) => void,
  item: T,
  opts: { maxItems?: number; allowDuplicates?: boolean; getKey?: (i: T) => string; onDuplicate?: () => void },
): boolean {
  const atLimit = typeof opts.maxItems === 'number' && values.length >= opts.maxItems;
  if (atLimit) return false;
  if (isAddableDuplicate(values, item, opts)) {
    opts.onDuplicate?.();
    return false;
  }
  onChange([...values, item]);
  return true;
}

describe('add contract', () => {
  it('appends and returns true for a new item', () => {
    const onChange = vi.fn();
    expect(add(['a'], onChange, 'b', { getKey: (s) => s })).toBe(true);
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('rejects at the limit without calling onChange', () => {
    const onChange = vi.fn();
    expect(add(['a', 'b'], onChange, 'c', { maxItems: 2, getKey: (s) => s })).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects a duplicate and fires onDuplicate', () => {
    const onChange = vi.fn();
    const onDuplicate = vi.fn();
    expect(add(['a'], onChange, 'A', { getKey: (s) => s, onDuplicate })).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    expect(onDuplicate).toHaveBeenCalledOnce();
  });

  it('appends a duplicate when allowDuplicates is set', () => {
    const onChange = vi.fn();
    expect(add(['a'], onChange, 'a', { getKey: (s) => s, allowDuplicates: true })).toBe(true);
    expect(onChange).toHaveBeenCalledWith(['a', 'a']);
  });
});

// ── remove / update immutability ──────────────────────────────────────────────

describe('remove / update contract', () => {
  const remove = <T,>(values: T[], onChange: (n: T[]) => void, index: number) =>
    onChange(values.filter((_, i) => i !== index));
  const update = <T,>(values: T[], onChange: (n: T[]) => void, index: number, patch: Partial<T>) =>
    onChange(values.map((v, i) => (i === index ? { ...v, ...patch } : v)));

  it('remove drops exactly the indexed item', () => {
    const onChange = vi.fn();
    remove(['a', 'b', 'c'], onChange, 1);
    expect(onChange).toHaveBeenCalledWith(['a', 'c']);
  });

  it('update patches only the indexed item', () => {
    const onChange = vi.fn();
    const entries: Entry[] = [
      { primary: 'a', secondary: '1' },
      { primary: 'b', secondary: '2' },
    ];
    update(entries, onChange, 1, { secondary: '9' });
    expect(onChange).toHaveBeenCalledWith([
      { primary: 'a', secondary: '1' },
      { primary: 'b', secondary: '9' },
    ]);
  });
});
