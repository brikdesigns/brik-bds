import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHouse, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { AddressInput, type AddressSuggestion } from './AddressInput';

const meta: Meta<typeof AddressInput> = {
  title: 'Components/Input/address-input',
  component: AddressInput,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 360, maxWidth: 520, padding: 'var(--padding-lg)' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    placeholder: 'Enter address',
    size: 'md',
    fullWidth: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AddressInput>;

/**
 * Mock suggestions data
 */
const mockSuggestions: AddressSuggestion[] = [
  {
    id: '1',
    label: '123 Main Street',
    description: 'Nashville, TN 37201',
    icon: <FontAwesomeIcon icon={faHouse} />,
  },
  {
    id: '2',
    label: '456 Broadway Ave',
    description: 'Nashville, TN 37203',
    icon: <FontAwesomeIcon icon={faBuilding} />,
  },
  {
    id: '3',
    label: '789 Music Row',
    description: 'Nashville, TN 37212',
    icon: <FontAwesomeIcon icon={faLocationDot} />,
  },
  {
    id: '4',
    label: '321 West End Ave',
    description: 'Nashville, TN 37205',
  },
  {
    id: '5',
    label: '555 Demonbreun St',
    description: 'Nashville, TN 37203',
  },
];

/**
 * Default address input
 */
export const Default: Story = {
  args: {
    label: 'Address',
    placeholder: 'Enter address',
  },
};

/**
 * With label above the input
 */
export const WithLabel: Story = {
  args: {
    label: 'Delivery address',
    placeholder: 'Enter address',
  },
};

/**
 * Small size variant
 */
export const Small: Story = {
  args: {
    label: 'Address',
    size: 'sm',
    placeholder: 'Enter address',
  },
};

/**
 * Interactive example with simulated autocomplete suggestions.
 * Type in the field to see suggestions appear.
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AddressInput
  label="Delivery address"
  value={value}
  onChange={handleChange}
  suggestions={suggestions}
  onSuggestionSelect={(s) => setValue(s.label)}
  placeholder="Start typing an address..."
  fullWidth
/>`,
      },
    },
  },
  render: function InteractiveStory() {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
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
      },
      [],
    );

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
  },
};

/**
 * Shows the dropdown with static suggestions (always visible for demo)
 */
export const WithSuggestions: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AddressInput
  label="Location"
  placeholder="Enter address"
  suggestions={[
    { id: '1', label: '123 Main Street', description: 'Nashville, TN 37201' },
    { id: '2', label: '456 Broadway Ave', description: 'Nashville, TN 37203' },
    { id: '3', label: '789 Music Row', description: 'Nashville, TN 37212' },
  ]}
  onSuggestionSelect={(s) => console.log(s)}
  fullWidth
/>`,
      },
    },
  },
  render: function WithSuggestionsStory() {
    return (
      <AddressInput
        label="Location"
        defaultValue="Nash"
        suggestions={mockSuggestions.slice(0, 3)}
        onSuggestionSelect={(s) => console.log('Selected:', s)}
        placeholder="Enter address"
        fullWidth
      />
    );
  },
};
