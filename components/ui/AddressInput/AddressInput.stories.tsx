import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { AddressInput, type AddressSuggestion } from './AddressInput';

/**
 * AddressInput — text input with an optional suggestions dropdown for address
 * autocomplete. Pass `suggestions` to render the dropdown; wire `onSuggestionSelect`
 * to handle selection.
 * @summary Address input with autocomplete suggestions
 */
const meta: Meta<typeof AddressInput> = {
  title: 'Components/Form/address-input',
  component: AddressInput,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 360, maxWidth: 520, padding: 'var(--padding-lg)' }}>
        <Story />
      </div>
    ),
  ],
  args: { placeholder: 'Enter address', size: 'md', fullWidth: true },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof AddressInput>;

const mockSuggestions: AddressSuggestion[] = [
  { id: '1', label: '123 Main Street', description: 'Nashville, TN 37201', icon: <Icon icon="ph:house" /> },
  { id: '2', label: '456 Broadway Ave', description: 'Nashville, TN 37203', icon: <Icon icon="ph:buildings" /> },
  { id: '3', label: '789 Music Row', description: 'Nashville, TN 37212', icon: <Icon icon="ph:map-pin" /> },
  { id: '4', label: '321 West End Ave', description: 'Nashville, TN 37205' },
  { id: '5', label: '555 Demonbreun St', description: 'Nashville, TN 37203' },
];

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { label: 'Address', placeholder: 'Enter address' },
};

/** Default size (md).
 *  @summary Default size */
export const Default: Story = {
  args: { label: 'Address', placeholder: 'Enter address' },
};

/** Small size — used in compact form layouts.
 *  @summary Small size */
export const Small: Story = {
  args: { label: 'Address', size: 'sm', placeholder: 'Enter address' },
};

/** With suggestions visible — pass a non-empty `suggestions` array to render
 *  the dropdown. Use this story to inspect the dropdown styling and icon slot.
 *  @summary Suggestions dropdown open */
export const WithSuggestions: Story = {
  args: {
    label: 'Location',
    defaultValue: 'Nash',
    suggestions: mockSuggestions.slice(0, 3),
    onSuggestionSelect: (s) => console.log('Selected:', s),
    placeholder: 'Enter address',
  },
};

/** Interactive autocomplete — `useState` drives the value and filtered
 *  suggestions list. Render is required for the controlled-state demo.
 *  @summary Live autocomplete with filtering */
export const InteractiveAutocomplete: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState('');
      const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

      const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
          label="Delivery address"
          value={value}
          onChange={handleChange}
          suggestions={suggestions}
          onSuggestionSelect={handleSelect}
          placeholder="Start typing an address..."
          fullWidth
        />
      );
    };
    return <Demo />;
  },
};
