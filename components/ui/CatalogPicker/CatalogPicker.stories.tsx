import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import {
  CatalogPicker,
  type CatalogEntry,
  type PickedCatalogEntry,
} from './CatalogPicker';

// ── Catalog fixtures ─────────────────────────────────────────────────────────
// Mirrors a subset of dental.servicesCatalog from
// @brikdesigns/bds/content-system/industries/dental.ts. Kept inline so the
// story has no runtime dependency on the content-system export graph.

const DENTAL_SERVICES_CATALOG: readonly CatalogEntry[] = [
  {
    slug: 'preventive-care',
    displayName: 'Preventive Care / Cleaning',
    aliases: ['cleaning', 'prophy', 'prophylaxis', 'preventive'],
  },
  {
    slug: 'fillings-and-crowns',
    displayName: 'Fillings & Crowns',
    aliases: ['filling', 'crown', 'composite', 'amalgam'],
  },
  {
    slug: 'root-canal',
    displayName: 'Root Canal Therapy',
    aliases: ['endo', 'endodontic', 'rct'],
  },
  {
    slug: 'teeth-whitening',
    displayName: 'Teeth Whitening',
    aliases: ['bleaching', 'whitening'],
  },
  {
    slug: 'porcelain-veneers',
    displayName: 'Porcelain Veneers',
    aliases: ['veneer', 'veneers'],
  },
  {
    slug: 'invisalign',
    displayName: 'Invisalign / Clear Aligners',
    aliases: ['invisalign', 'clear aligners', 'aligners'],
  },
  {
    slug: 'dental-implants',
    displayName: 'Dental Implants',
    aliases: ['implant', 'implants'],
  },
  {
    slug: 'sedation-dentistry',
    displayName: 'Sedation Dentistry',
    aliases: ['sedation', 'iv sedation', 'nitrous'],
  },
];

// ── Storybook meta ───────────────────────────────────────────────────────────

const meta: Meta<typeof CatalogPicker> = {
  title: 'Containers/catalog-picker',
  component: CatalogPicker,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    catalog: {
      control: false,
      description: 'Reference catalog entries: `{ slug, displayName, aliases? }[]`. Set in code.',
    },
    value: {
      control: false,
      description: 'Currently picked entries: `{ slug, displayName, description?, source }[]`. Set in code.',
    },
    onChange: {
      control: false,
      description: 'Called with the next picked list on add/remove.',
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    helperText: { control: 'text' },
    addLabel: { control: 'text' },
    removeLabel: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    descriptionPlaceholder: { control: 'text' },
    emptyLabel: { control: 'text' },
    emptyDescriptionLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    strict: { control: 'boolean' },
    maxItems: { control: 'number' },
    descriptionRows: { control: 'number' },
    className: {
      control: false,
      description: 'Optional className passthrough on the root.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CatalogPicker>;

// ── Controlled wrapper ───────────────────────────────────────────────────────

const Controlled = (args: React.ComponentProps<typeof CatalogPicker>) => {
  const [value, setValue] = useState<PickedCatalogEntry[]>([...args.value]);
  return (
    <div style={{ width: 520 }}>
      <CatalogPicker
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      />
    </div>
  );
};

// ── Stories ──────────────────────────────────────────────────────────────────

/**
 * Default — dental services catalog with two pre-picked catalog entries.
 * Demonstrates the canonical shape: every picked entry carries slug +
 * displayName + source. Matches what the portal billing sheet will render.
 *
 * @summary Interactive playground for prop tweaking
 */
export const Default: Story = {
  args: {
    label: 'Services Offered',
    catalog: DENTAL_SERVICES_CATALOG,
    value: [
      {
        slug: 'dental-implants',
        displayName: 'Dental Implants',
        description: 'Permanent tooth replacement — natural look and feel.',
        source: 'catalog',
      },
      {
        slug: 'teeth-whitening',
        displayName: 'Teeth Whitening',
        source: 'catalog',
      },
    ],
    searchPlaceholder: 'Search or add a service…',
    descriptionPlaceholder: 'Brief description of this service',
    addLabel: 'Add Service',
    removeLabel: 'Remove service',
    emptyLabel: 'No services added yet.',
    emptyDescriptionLabel: 'No description set',
    size: 'md',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Mixed sources — catalog picks rendered alongside a user-added custom
 * service. Demonstrates that source attribution is automatic and that
 * custom entries get a derived slug (no collision with catalog slugs).
 *
 * @summary Mixed sources
 */
export const MixedSources: Story = {
  name: 'Mixed Catalog + Custom',
  args: {
    ...Default.args,
    value: [
      {
        slug: 'invisalign',
        displayName: 'Invisalign / Clear Aligners',
        description: 'Provider-tier discount for in-network patients.',
        source: 'catalog',
      },
      {
        slug: 'tmj-bite-therapy',
        displayName: 'TMJ / Bite Therapy',
        description: 'Custom night guards and myofascial release.',
        source: 'custom',
      },
    ],
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Interaction test — picks a catalog entry by typing an alias, types a
 * description, commits. Verifies the alias-match path (`source: 'catalog'`)
 * and that the commit clears the form for rapid entry.
 *
 * @summary Alias match commits as catalog
 */
export const InteractionTestAliasMatchCommitsAsCatalog: Story = {
  tags: ['!manifest'],
  args: {
    label: 'Services Offered',
    catalog: DENTAL_SERVICES_CATALOG,
    value: [],
    searchPlaceholder: 'Search or add a service…',
    descriptionPlaceholder: 'Brief description',
    addLabel: 'Add Service',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));
    const search = await canvas.findByRole('combobox');
    // Type an alias ("veneer") — should resolve to the "Porcelain Veneers"
    // catalog entry by alias match on commit.
    await userEvent.type(search, 'veneer');
    await userEvent.click(canvas.getByRole('button', { name: /^add$/i }));

    await expect(args.onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        slug: 'porcelain-veneers',
        displayName: 'Porcelain Veneers',
        source: 'catalog',
      }),
    ]);
  },
};

/**
 * Interaction test — types a free-text name that doesn't match any catalog
 * entry. Commits as `source: 'custom'` with a derived slug.
 *
 * @summary Free text commits as custom
 */
export const InteractionTestFreeTextCommitsAsCustom: Story = {
  tags: ['!manifest'],
  args: {
    label: 'Services Offered',
    catalog: DENTAL_SERVICES_CATALOG,
    value: [],
    searchPlaceholder: 'Search or add a service…',
    descriptionPlaceholder: 'Brief description',
    addLabel: 'Add Service',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));
    const search = await canvas.findByRole('combobox');
    // Type a name that isn't in the dental catalog.
    await userEvent.type(search, 'Concierge Mobile Dentistry');
    await userEvent.click(canvas.getByRole('button', { name: /^add$/i }));

    await expect(args.onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        slug: 'concierge-mobile-dentistry',
        displayName: 'Concierge Mobile Dentistry',
        source: 'custom',
      }),
    ]);
  },
};
