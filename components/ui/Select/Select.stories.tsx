import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUser, faGlobe, faTag } from '@fortawesome/free-solid-svg-icons';
import { Select } from './Select';

const meta = {
  title: 'Components/select',
  component: Select,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Fill container width (default: true)',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicOptions = [
  { label: 'First choice', value: 'first' },
  { label: 'Second choice', value: 'second' },
  { label: 'Third choice', value: 'third' },
];

/**
 * Default select — fills its container by default.
 * Try resizing the browser to see it respond fluidly.
 */
export const Default: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
  },
};

/**
 * Select with a leading icon for visual context.
 */
export const WithIcon: Story = {
  args: {
    placeholder: 'Select company...',
    options: [
      { label: 'Acme Corp', value: 'acme' },
      { label: 'Globex Inc', value: 'globex' },
      { label: 'Initech', value: 'initech' },
    ],
    icon: <FontAwesomeIcon icon={faBuilding} />,
  },
};

/**
 * Small select with icon for compact layouts.
 */
export const SmallWithIcon: Story = {
  args: {
    placeholder: 'Select user...',
    options: [
      { label: 'Alice Johnson', value: 'alice' },
      { label: 'Bob Smith', value: 'bob' },
      { label: 'Carol White', value: 'carol' },
    ],
    size: 'sm',
    icon: <FontAwesomeIcon icon={faUser} />,
  },
};

/**
 * Combine label, icon, and full width for standard form fields.
 */
export const WithLabelAndIcon: Story = {
  args: {
    label: 'Company',
    placeholder: 'Select company...',
    options: [
      { label: 'Acme Corp', value: 'acme' },
      { label: 'Globex Inc', value: 'globex' },
      { label: 'Initech', value: 'initech' },
    ],
    icon: <FontAwesomeIcon icon={faBuilding} />,
  },
};

/**
 * Select with a pre-selected default value.
 */
export const WithDefaultValue: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
    defaultValue: 'second',
  },
};

/**
 * Disabled select — reduced opacity, no interaction.
 */
export const Disabled: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
    disabled: true,
  },
};

/**
 * Error state with validation message.
 * Focus ring shows red instead of brand color.
 */
export const WithError: Story = {
  args: {
    label: 'Region',
    placeholder: 'Select region...',
    options: [
      { label: 'North America', value: 'na' },
      { label: 'Europe', value: 'eu' },
      { label: 'Asia Pacific', value: 'apac' },
    ],
    error: 'Please select a region',
    icon: <FontAwesomeIcon icon={faGlobe} />,
  },
};

/**
 * Options grouped by category using `<optgroup>`.
 */
export const WithGroups: Story = {
  args: {
    label: 'Location',
    placeholder: 'Select a city...',
    options: [
      {
        label: 'United States',
        options: [
          { label: 'New York', value: 'ny' },
          { label: 'San Francisco', value: 'sf' },
          { label: 'Chicago', value: 'chi' },
        ],
      },
      {
        label: 'Europe',
        options: [
          { label: 'London', value: 'lon' },
          { label: 'Paris', value: 'par' },
          { label: 'Berlin', value: 'ber' },
        ],
      },
    ],
    icon: <FontAwesomeIcon icon={faGlobe} />,
  },
};

/**
 * All three sizes compared — height is driven by padding + line-height,
 * not hardcoded pixel values.
 */
export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Select size="sm" placeholder="Small" options={options} icon={<FontAwesomeIcon icon={faTag} />} />
<Select size="md" placeholder="Medium" options={options} icon={<FontAwesomeIcon icon={faTag} />} />
<Select size="lg" placeholder="Large" options={options} icon={<FontAwesomeIcon icon={faTag} />} />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--padding-lg)' }}>
      <Select size="sm" placeholder="Small" options={basicOptions} icon={<FontAwesomeIcon icon={faTag} />} />
      <Select size="md" placeholder="Medium" options={basicOptions} icon={<FontAwesomeIcon icon={faTag} />} />
      <Select size="lg" placeholder="Large" options={basicOptions} icon={<FontAwesomeIcon icon={faTag} />} />
    </div>
  ),
  args: {
    options: basicOptions,
  },
};

/**
 * Responsive width — the select fills its container at any size.
 * Resize the browser window to see the selects adapt fluidly.
 */
export const ResponsiveWidth: Story = {
  parameters: {
    docs: {
      source: {
        code: `{/* Full width (default) — fills container */}
<Select placeholder="Full width..." options={options} />

{/* Constrained by parent — still fills its container */}
<div style={{ maxWidth: '320px' }}>
  <Select placeholder="Max 320px container..." options={options} />
</div>

{/* Inline/compact — fullWidth=false */}
<Select placeholder="Compact..." options={options} fullWidth={false} />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--padding-xl)' }}>
      <div>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-md)',
        }}>
          Full width (default) — fills container
        </p>
        <Select placeholder="Full width..." options={basicOptions} />
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-md)',
        }}>
          Constrained by parent (max-width: 320px)
        </p>
        <div style={{ maxWidth: '320px' }}>
          <Select placeholder="Max 320px container..." options={basicOptions} />
        </div>
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-md)',
        }}>
          Compact (fullWidth=false) — shrinks to content
        </p>
        <Select placeholder="Compact..." options={basicOptions} fullWidth={false} />
      </div>
    </div>
  ),
  args: {
    options: basicOptions,
  },
};

/**
 * Multiple selects in a form layout — fills container side-by-side
 * or stacks on narrow viewports.
 */
export const FormExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Select label="Country" placeholder="Select country..." options={countries} icon={<FontAwesomeIcon icon={faGlobe} />} />
<Select label="Industry" placeholder="Select industry..." options={industries} icon={<FontAwesomeIcon icon={faBuilding} />} />`,
      },
    },
  },
  render: () => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--padding-lg)',
    }}>
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <Select
          label="Country"
          placeholder="Select country..."
          options={[
            { label: 'United States', value: 'us' },
            { label: 'Canada', value: 'ca' },
            { label: 'United Kingdom', value: 'uk' },
            { label: 'Australia', value: 'au' },
          ]}
          icon={<FontAwesomeIcon icon={faGlobe} />}
        />
      </div>
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <Select
          label="Industry"
          placeholder="Select industry..."
          options={[
            { label: 'Technology', value: 'tech' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'Finance', value: 'finance' },
            { label: 'Education', value: 'education' },
            { label: 'Other', value: 'other' },
          ]}
          icon={<FontAwesomeIcon icon={faBuilding} />}
        />
      </div>
    </div>
  ),
  args: {
    options: basicOptions,
  },
};
