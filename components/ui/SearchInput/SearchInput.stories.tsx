import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SearchInput, type SearchInputProps } from './SearchInput';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof SearchInput> = {
  title: 'Components/search-input',
  component: SearchInput,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token (sm=32px, md=40px, lg=48px). Matches TextInput scale. Default `md`.',
    },
    label: {
      control: 'text',
      description: 'Optional label rendered above the field. Auto-wires `htmlFor`/`id`.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the field is empty.',
    },
    helperText: {
      control: 'text',
      description: 'Hint text under the field. Hidden when `error` is present.',
    },
    error: {
      control: 'text',
      description: 'Error message. Triggers `aria-invalid` and replaces `helperText`.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill container width.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the field — non-interactive, muted appearance.',
    },
    onClear: {
      action: 'cleared',
      description:
        'Called when the clear button is clicked or Esc clears the field. In controlled mode, use this to reset `value`.',
    },
    debounceMs: {
      control: { type: 'number', min: 0, step: 50 },
      description:
        'Delay in ms before `onChange` fires after the last keystroke. Default `0` fires on every keystroke. Global search passes `250` (ADR-049 § 4). The field itself always updates immediately.',
    },
    onSearch: {
      action: 'searched',
      description: 'Called with the current value when Enter is pressed. Bypasses `debounceMs`.',
    },
    'aria-expanded': {
      control: 'boolean',
      description:
        'Set to `true` while a popup the field controls is open. Esc then leaves the field alone so the popup closes first; the next Esc clears it (ADR-049 § 3).',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, error, disabled, helper) is
   exposed via Controls. The clear button is internal to the component.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Search field with magnifying glass icon and clear button */
export const Default: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    size: 'md',
    fullWidth: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Search') as HTMLInputElement;

    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'search');

    // Clear button is hidden when the field is empty
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull();

    // Typing reveals the clear button
    await userEvent.type(input, 'React components');
    await expect(canvas.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();

    // Clicking clear empties the field and hides the button
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(input).toHaveValue('');
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull();

    // Blur to avoid stale focus styling in the post-play snapshot
    input.blur();
  },
};

/* ═══════════════════════════════════════════════════════════════
   DEBOUNCED — Global-search starting template (ADR-049 § 4: 250ms).
   Filter and Lookup keep the default `debounceMs={0}`.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Search field with onChange debounced 250ms */
export const Debounced: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search everything...',
    size: 'md',
    fullWidth: true,
    debounceMs: 250,
  },
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TESTS — play-only, out of MCP discovery and the sidebar
   (ADR-010 Q5). Each behaviour runs against an uncontrolled field and a
   controlled one, since the two take different code paths.
   ═══════════════════════════════════════════════════════════════ */

/** Controlled host: the parent owns `value`, as a consumer's filter state would. */
function ControlledSearch(props: SearchInputProps) {
  const [query, setQuery] = useState('');
  return (
    <SearchInput
      {...props}
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        props.onChange?.(e);
      }}
      onClear={() => {
        setQuery('');
        props.onClear?.();
      }}
    />
  );
}

const MODES = [
  ['uncontrolled', SearchInput],
  ['controlled', ControlledSearch],
] as const;

const DEBOUNCE = 150;

/** @summary Verifies debounceMs delays onChange and collapses typing */
export const InteractionTestDebounce: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { label: 'Search', debounceMs: DEBOUNCE, onChange: fn() },
  render: (args) => (
    <>
      {MODES.map(([mode, Field]) => (
        <div key={mode} data-mode={mode}>
          <Field {...args} label={`Search ${mode}`} />
        </div>
      ))}
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const [mode] of MODES) {
      // Both fields share args.onChange: reset the spy, drive one field at a time.
      (args.onChange as ReturnType<typeof fn>).mockClear();
      const input = canvas.getByLabelText(`Search ${mode}`) as HTMLInputElement;

      await userEvent.type(input, 'abc');
      // Field text is immediate; the callback is not.
      await expect(input).toHaveValue('abc');
      await expect(args.onChange).toHaveBeenCalledTimes(0);
      await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1), { timeout: 2000 });
      // Three keystrokes collapsed to one call, carrying the final value.
      await new Promise((r) => setTimeout(r, DEBOUNCE * 2));
      await expect(args.onChange).toHaveBeenCalledTimes(1);
      await expect((args.onChange as ReturnType<typeof fn>).mock.calls[0][0].target.value).toBe('abc');
    }
  },
};

/** @summary Verifies debounceMs 0 fires onChange per keystroke */
export const InteractionTestNoDebounce: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { label: 'Search', onChange: fn() },
  render: (args) => (
    <>
      {MODES.map(([mode, Field]) => (
        <div key={mode}>
          <Field {...args} label={`Search ${mode}`} />
        </div>
      ))}
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const [mode] of MODES) {
      (args.onChange as ReturnType<typeof fn>).mockClear();
      const input = canvas.getByLabelText(`Search ${mode}`) as HTMLInputElement;
      await userEvent.type(input, 'abc');
      await expect(args.onChange).toHaveBeenCalledTimes(3);
      await userEvent.clear(input);
    }
  },
};

/** @summary Verifies Enter fires onSearch at once, past the debounce */
export const InteractionTestEnterToSearch: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { label: 'Search', debounceMs: 1000, onSearch: fn() },
  render: (args) => (
    <>
      {MODES.map(([mode, Field]) => (
        <div key={mode}>
          <Field {...args} label={`Search ${mode}`} />
        </div>
      ))}
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const onSearch = args.onSearch as ReturnType<typeof fn>;
    for (const [mode] of MODES) {
      onSearch.mockClear();
      const input = canvas.getByLabelText(`Search ${mode}`) as HTMLInputElement;
      await userEvent.type(input, 'invoices');
      await expect(onSearch).toHaveBeenCalledTimes(0);
      await userEvent.keyboard('{Enter}');
      // Fired at once, well inside the 1000ms debounce, with the value typed.
      await expect(onSearch).toHaveBeenCalledTimes(1);
      await expect(onSearch).toHaveBeenCalledWith('invoices');
      await userEvent.clear(input);
    }
  },
};

/** @summary Verifies Esc clears a non-empty field and fires onClear */
export const InteractionTestEscape: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { label: 'Search', onClear: fn() },
  render: (args) => (
    <>
      {MODES.map(([mode, Field]) => (
        <div key={mode}>
          <Field {...args} label={`Search ${mode}`} />
        </div>
      ))}
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const onClear = args.onClear as ReturnType<typeof fn>;
    for (const [mode] of MODES) {
      onClear.mockClear();
      const input = canvas.getByLabelText(`Search ${mode}`) as HTMLInputElement;
      input.focus();

      // Empty field: nothing to clear, onClear silent, Esc is not consumed.
      const empty = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      input.dispatchEvent(empty);
      await expect(empty.defaultPrevented).toBe(false);
      await expect(onClear).toHaveBeenCalledTimes(0);

      // Text, no popup: Esc clears and fires onClear.
      await userEvent.type(input, 'acme');
      await userEvent.keyboard('{Escape}');
      await expect(input).toHaveValue('');
      await expect(onClear).toHaveBeenCalledTimes(1);
      await expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull();
    }
  },
};

/** Popup-owning host: Esc closes the popup (via onKeyDown); the field reports it open with aria-expanded. */
function PopupSearch(props: SearchInputProps) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <SearchInput
        {...props}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open ? <div role="listbox" aria-label="Results"><div role="option" aria-selected="false">Acme</div></div> : null}
    </>
  );
}

/** @summary Verifies Esc closes an open popup first, then clears */
export const InteractionTestEscapeClosesPopupFirst: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { label: 'Search', onClear: fn() },
  render: (args) => <PopupSearch {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const onClear = args.onClear as ReturnType<typeof fn>;
    onClear.mockClear();
    const input = canvas.getByLabelText('Search') as HTMLInputElement;

    await userEvent.type(input, 'acme');
    await expect(canvas.getByRole('listbox')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).toBeNull();
    await expect(input).toHaveValue('acme');
    await expect(onClear).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
    await expect(onClear).toHaveBeenCalledTimes(1);
  },
};

/** @summary Verifies the wrapper, not the field, is the one landmark */
export const InteractionTestLandmark: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { label: 'Search records' },
  render: (args) => (
    <div role="search" aria-label="Filter records">
      <SearchInput {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Exactly one landmark, and it is the wrapper — not the field.
    const landmarks = canvas.getAllByRole('search');
    await expect(landmarks).toHaveLength(1);
    await expect(landmarks[0]).toHaveAccessibleName('Filter records');
    const input = canvas.getByLabelText('Search records');
    await expect(input).not.toHaveAttribute('role');
    await expect(landmarks[0]).toContainElement(input);
  },
};

/** @summary Verifies sm, md and lg render at 32, 40 and 48px */
export const InteractionTestSizes: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: (args) => (
    <>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <SearchInput key={size} {...args} size={size} label={`Search ${size}`} />
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // TextInput scale: 32 / 40 / 48px field height, set by the size class on the wrapper.
    for (const [size, height] of [['sm', 32], ['md', 40], ['lg', 48]] as const) {
      const input = canvas.getByLabelText(`Search ${size}`);
      await expect(input.closest(`.bds-text-input--${size}`)).not.toBeNull();
      await expect(input.getBoundingClientRect().height).toBe(height);
    }
  },
};

/** @summary Verifies a disabled field takes no input, Esc or Enter */
export const InteractionTestDisabled: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { label: 'Search', disabled: true, defaultValue: 'locked', onClear: fn(), onSearch: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Search') as HTMLInputElement;
    await expect(input).toBeDisabled();
    await userEvent.type(input, 'x');
    await userEvent.keyboard('{Escape}{Enter}');
    await expect(input).toHaveValue('locked');
    await expect(args.onClear).toHaveBeenCalledTimes(0);
    await expect(args.onSearch).toHaveBeenCalledTimes(0);
  },
};
