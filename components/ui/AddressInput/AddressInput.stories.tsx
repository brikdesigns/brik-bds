import { useState, useCallback, type ChangeEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Icon } from '@iconify/react';
import { AddressInput, type AddressSuggestion } from './AddressInput';

/* ─── Sample data ─────────────────────────────────────────────── */

const mockSuggestions: AddressSuggestion[] = [
  { id: '1', label: '123 Main Street', description: 'Nashville, TN 37201', icon: <Icon icon="ph:house" /> },
  { id: '2', label: '456 Broadway Ave', description: 'Nashville, TN 37203', icon: <Icon icon="ph:buildings" /> },
  { id: '3', label: '789 Music Row', description: 'Nashville, TN 37212', icon: <Icon icon="ph:map-pin" /> },
  { id: '4', label: '321 West End Ave', description: 'Nashville, TN 37205' },
  { id: '5', label: '555 Demonbreun St', description: 'Nashville, TN 37203' },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof AddressInput> = {
  title: 'Components/address-input',
  component: AddressInput,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 360, width: 420 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size token (sm=32px, md=40px). AddressInput only supports two sizes today. Default `md`.',
    },
    label: {
      control: 'text',
      description: 'Optional label rendered above the field. Auto-wires `htmlFor`/`id`.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the field is empty.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch wrapper to its container width.',
    },
    suggestions: {
      control: false,
      description: 'Array of `AddressSuggestion` ({ id, label, description?, icon? }). Set in code — the Default story manages this via a hook in `render` to demonstrate the autocomplete flow.',
    },
    onSuggestionSelect: {
      action: 'suggestion-selected',
      description: 'Called when the user picks a suggestion from the dropdown. The component closes the dropdown automatically.',
    },
    onChange: {
      action: 'changed',
      description: 'Native change handler.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AddressInput>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. The render function manages the suggestion-filter
   hook internally because AddressInput's defining behavior (filter
   suggestions as the user types) requires a controlled value + a
   filtered suggestions array — args alone can't express it.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Location input with hook-driven autocomplete */
export const Default: Story = {
  args: {
    label: 'Delivery address',
    placeholder: 'Start typing an address...',
    size: 'md',
    fullWidth: true,
  },
  render: (args) => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setValue(query);
      setSuggestions(
        query.length > 0
          ? mockSuggestions.filter(
              (s) =>
                s.label.toLowerCase().includes(query.toLowerCase()) ||
                s.description?.toLowerCase().includes(query.toLowerCase()),
            )
          : [],
      );
    }, []);

    const handleSelect = useCallback((suggestion: AddressSuggestion) => {
      setValue(suggestion.label);
      setSuggestions([]);
    }, []);

    return (
      <AddressInput
        {...args}
        value={value}
        onChange={handleChange}
        suggestions={suggestions}
        onSuggestionSelect={handleSelect}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Delivery address') as HTMLInputElement;

    await expect(input).toBeVisible();

    // Type a partial query → suggestions filter live.
    await userEvent.click(input);
    await userEvent.type(input, 'Nash');
    await expect(canvas.getByText('123 Main Street')).toBeVisible();

    // Pick the first suggestion → input value updates, dropdown closes.
    await userEvent.click(canvas.getByText('123 Main Street'));
    await expect(input).toHaveValue('123 Main Street');

    // Blur so the post-play canvas shows the canonical idle state
    // (no focus ring, no open dropdown).
    input.blur();
  },
};
