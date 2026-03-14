import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHouse, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { AddressInput, type AddressSuggestion } from './AddressInput';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Mock Data ───────────────────────────────────────────────── */

const mockSuggestions: AddressSuggestion[] = [
  { id: '1', label: '123 Main Street', description: 'Nashville, TN 37201', icon: <FontAwesomeIcon icon={faHouse} /> },
  { id: '2', label: '456 Broadway Ave', description: 'Nashville, TN 37203', icon: <FontAwesomeIcon icon={faBuilding} /> },
  { id: '3', label: '789 Music Row', description: 'Nashville, TN 37212', icon: <FontAwesomeIcon icon={faLocationDot} /> },
  { id: '4', label: '321 West End Ave', description: 'Nashville, TN 37205' },
  { id: '5', label: '555 Demonbreun St', description: 'Nashville, TN 37203' },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof AddressInput> = {
  title: 'Components/Input/address-input',
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

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Address',
    placeholder: 'Enter address',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, labels, static suggestions
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      {/* Sizes */}
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <AddressInput label="Medium (default)" placeholder="Enter address" fullWidth />
          <AddressInput label="Small" size="sm" placeholder="Enter address" fullWidth />
        </Stack>
      </div>

      {/* With suggestions visible */}
      <div>
        <SectionLabel>With suggestions dropdown</SectionLabel>
        <AddressInput
          label="Location"
          defaultValue="Nash"
          suggestions={mockSuggestions.slice(0, 3)}
          onSuggestionSelect={(s) => console.log('Selected:', s)}
          placeholder="Enter address"
          fullWidth
        />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Interactive autocomplete
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: function InteractivePattern() {
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
      <Stack>
        <div>
          <SectionLabel>Interactive autocomplete</SectionLabel>
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
      </Stack>
    );
  },
};
