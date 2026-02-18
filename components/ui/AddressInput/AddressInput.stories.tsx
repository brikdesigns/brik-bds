import type { Meta, StoryObj } from '@storybook/react';
import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHouse, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { AddressInput, type AddressSuggestion } from './AddressInput';

const meta: Meta<typeof AddressInput> = {
  title: 'Components/address-input',
  component: AddressInput,
  args: {
    placeholder: 'Enter location',
    size: 'md',
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
 * Default address input with no suggestions
 */
export const Default: Story = {};

/**
 * With an optional label above the input
 */
export const WithLabel: Story = {
  args: {
    label: 'Address',
  },
};

/**
 * Small size variant
 */
export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Enter location',
  },
};

/**
 * Full width input stretches to fill its container
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    label: 'Location',
  },
};

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
 * Interactive example with simulated autocomplete suggestions.
 * Type in the field to see suggestions appear.
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [value, setValue] = useState('');
const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

const handleChange = (e) => {
  const query = e.target.value;
  setValue(query);
  // Simulate filtering suggestions
  setSuggestions(
    query.length > 0
      ? allSuggestions.filter((s) =>
          s.label.toLowerCase().includes(query.toLowerCase())
        )
      : []
  );
};

<AddressInput
  value={value}
  onChange={handleChange}
  suggestions={suggestions}
  onSuggestionSelect={(s) => {
    setValue(s.label);
    setSuggestions([]);
  }}
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
      <div style={{ maxWidth: '432px' }}>
        <AddressInput
          label="Delivery address"
          value={value}
          onChange={handleChange}
          suggestions={suggestions}
          onSuggestionSelect={handleSelect}
          placeholder="Start typing an address..."
          fullWidth
        />
      </div>
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
  placeholder="Enter location"
  suggestions={[
    { id: '1', label: '123 Main Street', description: 'Nashville, TN 37201' },
    { id: '2', label: '456 Broadway Ave', description: 'Nashville, TN 37203' },
  ]}
  onSuggestionSelect={(s) => console.log(s)}
/>`,
      },
    },
  },
  render: function WithSuggestionsStory() {
    return (
      <div style={{ maxWidth: '432px' }}>
        <AddressInput
          label="Location"
          defaultValue="Nash"
          suggestions={mockSuggestions.slice(0, 3)}
          onSuggestionSelect={(s) => console.log('Selected:', s)}
          placeholder="Enter location"
          fullWidth
        />
      </div>
    );
  },
};
