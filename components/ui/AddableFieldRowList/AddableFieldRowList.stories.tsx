import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddableFieldRowList } from './AddableFieldRowList';
import { TextInput } from '../TextInput';
import { TextArea } from '../TextArea';
import { Select } from '../Select';
import { Checkbox } from '../Checkbox';

const meta: Meta<typeof AddableFieldRowList> = {
  title: 'Containers/addable-field-row-list',
  component: AddableFieldRowList,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    values: { control: false, description: 'Current list of rows.' },
    onChange: { control: false, description: 'Called with the next rows on add / update / remove.' },
    newRow: { control: false, description: 'Factory for a new empty row, called once per "Add" click.' },
    children: {
      control: false,
      description: 'Render-prop for the row field markup — receives `{ row, index, update }`.',
    },
    columns: {
      control: 'text',
      description: 'CSS `grid-template-columns` for the row fields; the primitive appends an `auto` track for the remove button.',
    },
    label: { control: 'text' },
    helperText: { control: 'text' },
    emptyLabel: { control: 'text' },
    addLabel: { control: 'text' },
    removeLabel: { control: 'text' },
    maxItems: { control: 'number' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ─── Default: simple two-text-field row ───────────────────────
 * Minimal shape — 2 text columns, no Select, no cross-field logic. The
 * render-prop `children` and generic row shape are hook-driven and can't
 * be expressed as args (Q4) — every story here wires its own local state.
 */

interface Item {
  label: string;
  value: string;
}

/** @summary Minimal two-field row — the "kick the tires" entry point */
export const Default: Story = {
  render: () => {
    const [items, setItems] = useState<Item[]>([
      { label: 'Phone', value: '(615) 555-0100' },
      { label: 'Email', value: 'hello@example.com' },
    ]);

    return (
      <div style={{ width: 560 }}>
        <AddableFieldRowList<Item>
          label="Contact methods"
          values={items}
          onChange={setItems}
          newRow={() => ({ label: '', value: '' })}
          columns="1fr 1fr"
          addLabel="Add contact"
          removeLabel="Remove contact"
          emptyLabel="No contact methods yet."
        >
          {({ row, update }) => (
            <>
              <TextInput
                value={row.label}
                onChange={(e) => update({ label: e.target.value })}
                placeholder="e.g. Phone"
                fullWidth
              />
              <TextInput
                value={row.value}
                onChange={(e) => update({ value: e.target.value })}
                placeholder="e.g. (615) 555-0100"
                fullWidth
              />
            </>
          )}
        </AddableFieldRowList>
      </div>
    );
  },
};

/* ─── SoftwareInventory: phone-system-style 3-field row ────────
 * Mirrors onboarding-software-sheet.tsx — Name + Purpose + Category Select.
 * The canonical multi-field row pattern across the portal.
 */

interface Tool {
  name: string;
  purpose: string;
  category: 'phone' | 'crm' | 'other';
}

const CATEGORY_OPTIONS = [
  { value: 'phone', label: 'Phone System' },
  { value: 'crm', label: 'CRM' },
  { value: 'other', label: 'Other Tools' },
];

/** @summary Three-field row — text + text + Select */
export const SoftwareInventory: Story = {
  render: () => {
    const [tools, setTools] = useState<Tool[]>([
      { name: 'HubSpot', purpose: 'CRM and pipeline tracking', category: 'crm' },
      { name: 'Office 365', purpose: 'email platform', category: 'other' },
    ]);

    return (
      <div style={{ width: 720 }}>
        <AddableFieldRowList<Tool>
          label="Software stack"
          values={tools}
          onChange={setTools}
          newRow={() => ({ name: '', purpose: '', category: 'other' })}
          columns="1fr 1fr 160px"
          addLabel="Add tool"
          removeLabel="Remove tool"
          emptyLabel="No tools added yet."
        >
          {({ row, update }) => (
            <>
              <TextInput
                value={row.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="e.g. HubSpot"
                fullWidth
              />
              <TextInput
                value={row.purpose}
                onChange={(e) => update({ purpose: e.target.value })}
                placeholder="What this tool is used for"
                fullWidth
              />
              <Select
                options={CATEGORY_OPTIONS}
                value={row.category}
                onChange={(e) => update({ category: e.target.value as Tool['category'] })}
              />
            </>
          )}
        </AddableFieldRowList>
      </div>
    );
  },
};

/* ─── HolidayHours: cross-field disabling ──────────────────────
 * Mirrors onboarding-listing-sheet.tsx — open + close TextInput
 * (disabled when closed) + Closed Checkbox. Demonstrates that the
 * render-prop API supports cross-field interactions naturally.
 */

interface Holiday {
  open: string;
  close: string;
  closed: boolean;
}

/** @summary Cross-field disabling — Closed checkbox disables open/close */
export const HolidayHours: Story = {
  render: () => {
    const [holidays, setHolidays] = useState<Holiday[]>([
      { open: '09:00', close: '17:00', closed: false },
      { open: '', close: '', closed: true },
    ]);

    return (
      <div style={{ width: 640 }}>
        <AddableFieldRowList<Holiday>
          label="Holiday hours"
          values={holidays}
          onChange={setHolidays}
          newRow={() => ({ open: '', close: '', closed: false })}
          columns="1fr 1fr 100px"
          addLabel="Add holiday"
          removeLabel="Remove holiday"
          emptyLabel="No holidays configured."
          helperText="Mark Closed to disable open/close times for that day."
        >
          {({ row, update }) => (
            <>
              <TextInput
                type="time"
                value={row.open}
                onChange={(e) => update({ open: e.target.value })}
                disabled={row.closed}
                fullWidth
              />
              <TextInput
                type="time"
                value={row.close}
                onChange={(e) => update({ close: e.target.value })}
                disabled={row.closed}
                fullWidth
              />
              <Checkbox
                label="Closed"
                checked={row.closed}
                onChange={(e) => update({ closed: e.target.checked })}
              />
            </>
          )}
        </AddableFieldRowList>
      </div>
    );
  },
};

/* ─── CompetitiveFrames: three TextAreas ────────────────────────
 * Mirrors onboarding-competitors-sheet.tsx — Competitor + Gap +
 * Copy implication. Demonstrates wider rows with TextArea fields
 * and the same 3-column grid working for taller content.
 */

interface CompetitiveFrame {
  competitor: string;
  gap: string;
  copyImplication: string;
}

/** @summary Three-textarea row for wider composed content */
export const CompetitiveFrames: Story = {
  render: () => {
    const [frames, setFrames] = useState<CompetitiveFrame[]>([
      {
        competitor: 'DSO-affiliated practices',
        gap: 'Patient experience feels transactional and rushed.',
        copyImplication: 'Lead with longer appointment times and named-clinician continuity.',
      },
    ]);

    return (
      <div style={{ width: 880 }}>
        <AddableFieldRowList<CompetitiveFrame>
          label="Competitive Positioning"
          values={frames}
          onChange={setFrames}
          newRow={() => ({ competitor: '', gap: '', copyImplication: '' })}
          columns="1fr 1fr 1fr"
          addLabel="Add frame"
          removeLabel="Remove frame"
          emptyLabel="No frames. Click Add frame to create one."
        >
          {({ row, update }) => (
            <>
              <TextArea
                value={row.competitor}
                onChange={(e) => update({ competitor: e.target.value })}
                placeholder="Name or archetype"
                rows={3}
                fullWidth
              />
              <TextArea
                value={row.gap}
                onChange={(e) => update({ gap: e.target.value })}
                placeholder="What they lack that this client can claim"
                rows={3}
                fullWidth
              />
              <TextArea
                value={row.copyImplication}
                onChange={(e) => update({ copyImplication: e.target.value })}
                placeholder="How this should shape on-site copy"
                rows={3}
                fullWidth
              />
            </>
          )}
        </AddableFieldRowList>
      </div>
    );
  },
};

/* ─── MaxItemsCap: empty state + maxItems gating ────────────────
 * Demonstrates the empty state and maxItems behavior — Add button
 * disappears once the cap is reached.
 */

interface SimpleNote {
  text: string;
}

/** @summary Empty starting state, capped at maxItems */
export const MaxItemsCap: Story = {
  render: () => {
    const [notes, setNotes] = useState<SimpleNote[]>([]);

    return (
      <div style={{ width: 480, display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        <AddableFieldRowList<SimpleNote>
          label="Quick notes (max 3)"
          values={notes}
          onChange={setNotes}
          newRow={() => ({ text: '' })}
          columns="1fr"
          addLabel="Add note"
          removeLabel="Remove note"
          emptyLabel="No notes yet — click Add note to start."
          maxItems={3}
          helperText="Add up to 3 quick notes. The Add button disappears at the cap."
        >
          {({ row, update }) => (
            <TextInput
              value={row.text}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Type a quick note…"
              fullWidth
            />
          )}
        </AddableFieldRowList>
      </div>
    );
  },
};
