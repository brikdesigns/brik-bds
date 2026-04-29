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

const REAL_ESTATE_AMENITIES_CATALOG: readonly CatalogEntry[] = [
  { slug: 'pool', displayName: 'Swimming Pool', aliases: ['pool'] },
  { slug: 'clubhouse', displayName: 'Clubhouse', aliases: ['community room'] },
  { slug: 'laundry', displayName: 'On-Site Laundry', aliases: ['laundromat'] },
  { slug: 'wifi', displayName: 'Community Wi-Fi', aliases: ['wi-fi', 'wifi'] },
  { slug: 'dog-park', displayName: 'Dog Park' },
];

// ── Shared layout helpers (per BDS story convention) ─────────────────────────

const Stack = ({
  children,
  gap = 'var(--gap-xl)',
}: {
  children: React.ReactNode;
  gap?: string;
}) => <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>;

const SectionLabel = ({ children }: { children: string }) => (
  <div
    style={{
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--label-xs)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: 'var(--gap-md)',
      color: 'var(--text-muted)',
    }}
  >
    {children}
  </div>
);

// ── Storybook meta ───────────────────────────────────────────────────────────

const meta: Meta<typeof CatalogPicker> = {
  title: 'Components/Form/catalog-picker',
  component: CatalogPicker,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    helperText: { control: 'text' },
    addLabel: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    descriptionPlaceholder: { control: 'text' },
    emptyLabel: { control: 'text' },
    emptyDescriptionLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    strict: { control: 'boolean' },
    maxItems: { control: 'number' },
    descriptionRows: { control: 'number' },
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
 */
export const Playground: Story = {
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
 * Empty state — no picked entries, form closed. User sees the Add button
 * and the empty label. First interaction target for new client onboarding.
 */
export const Empty: Story = {
  args: {
    ...Playground.args,
    value: [],
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Mixed sources — catalog picks rendered alongside a user-added custom
 * service. Demonstrates that source attribution is automatic and that
 * custom entries get a derived slug (no collision with catalog slugs).
 */
export const MixedSources: Story = {
  name: 'Mixed Catalog + Custom',
  args: {
    ...Playground.args,
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
 * Strict mode — only catalog entries accepted. Attempting to commit a
 * free-text name that doesn't match any catalog displayName or alias is
 * silently rejected. Use for locked vocabularies (insurance plans,
 * financing products) where custom entries aren't valid.
 */
export const StrictCatalogOnly: Story = {
  name: 'Strict (No Custom)',
  args: {
    ...Playground.args,
    label: 'Insurance Plans',
    catalog: [
      { slug: 'in-network-ppo', displayName: 'In-Network PPO' },
      { slug: 'out-of-network-ppo', displayName: 'Out-of-Network PPO' },
      { slug: 'medicaid', displayName: 'Medicaid' },
      { slug: 'hmo', displayName: 'HMO / DMO' },
      { slug: 'discount-plan', displayName: 'Discount Membership' },
    ],
    value: [],
    strict: true,
    addLabel: 'Add Plan',
    searchPlaceholder: 'Search plans…',
    descriptionPlaceholder: '(not used in strict mode)',
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Alternate catalog — real-estate amenities. Same component, different
 * vocabulary. Demonstrates that the picker is vocabulary-agnostic as long
 * as the catalog conforms to CatalogEntry shape.
 */
export const DifferentIndustry: Story = {
  name: 'Real-Estate Amenities',
  args: {
    ...Playground.args,
    label: 'Community Amenities',
    catalog: REAL_ESTATE_AMENITIES_CATALOG,
    value: [
      {
        slug: 'clubhouse',
        displayName: 'Clubhouse',
        description: 'Resident-only space with lounge and kitchen.',
        source: 'catalog',
      },
    ],
    addLabel: 'Add Amenity',
    searchPlaceholder: 'Search or add an amenity…',
    descriptionPlaceholder: 'What makes this amenity worth mentioning?',
    removeLabel: 'Remove amenity',
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * All three sizes side-by-side. ADR-006 axis-gallery exception. Same
 * catalog + same picks so the visual delta is pure typography/spacing.
 * @summary All sizes rendered together
 */
export const Sizes: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Size: sm</SectionLabel>
        <div style={{ width: 520 }}>
          <CatalogPicker
            label="Services Offered"
            catalog={DENTAL_SERVICES_CATALOG}
            value={[
              { slug: 'dental-implants', displayName: 'Dental Implants', source: 'catalog' },
            ]}
            onChange={fn()}
            size="sm"
            addLabel="Add Service"
          />
        </div>
      </div>

      <div>
        <SectionLabel>Size: md (default)</SectionLabel>
        <div style={{ width: 520 }}>
          <CatalogPicker
            label="Services Offered"
            catalog={DENTAL_SERVICES_CATALOG}
            value={[
              { slug: 'dental-implants', displayName: 'Dental Implants', source: 'catalog' },
            ]}
            onChange={fn()}
            size="md"
            addLabel="Add Service"
          />
        </div>
      </div>

      <div>
        <SectionLabel>Size: lg</SectionLabel>
        <div style={{ width: 520 }}>
          <CatalogPicker
            label="Services Offered"
            catalog={DENTAL_SERVICES_CATALOG}
            value={[
              { slug: 'dental-implants', displayName: 'Dental Implants', source: 'catalog' },
            ]}
            onChange={fn()}
            size="lg"
            addLabel="Add Service"
          />
        </div>
      </div>
    </Stack>
  ),
};

/**
 * Disabled — read-only render. Remove buttons and the Add button are
 * hidden. Used in the portal when a non-admin views intel sheets.
 */
export const Disabled: Story = {
  args: {
    ...Playground.args,
    disabled: true,
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Interaction — picks a catalog entry by typing an alias, types a
 * description, commits. Verifies the alias-match path (`source: 'catalog'`)
 * and that the commit clears the form for rapid entry.
 */
export const AliasMatchCommitsAsCatalog: Story = {
  name: 'Alias Match → source=catalog',
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
 * Interaction — types a free-text name that doesn't match any catalog
 * entry. Commits as `source: 'custom'` with a derived slug.
 */
export const FreeTextCommitsAsCustom: Story = {
  name: 'Free Text → source=custom',
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

