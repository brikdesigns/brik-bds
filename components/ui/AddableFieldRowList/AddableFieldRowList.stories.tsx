import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddableFieldRowList } from './AddableFieldRowList';
import { TextInput } from '../TextInput';
import { TextArea } from '../TextArea';
import { Select } from '../Select';
import { Checkbox } from '../Checkbox';

const meta: Meta<typeof AddableFieldRowList> = {
  title: 'Displays/Form/addable-field-row-list',
  component: AddableFieldRowList,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ─── Story 1: Phone System (3-text + Select) ─────────────────
 * Mirrors onboarding-software-sheet.tsx — Name + Purpose + Category Select.
 * Demonstrates the typical multi-field row use case.
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

export const PhoneSystem: Story = {
  name: 'Phone System (3 fields)',
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

/* ─── Story 2: Holiday hours (cross-field disabling) ──────────
 * Mirrors onboarding-listing-sheet.tsx — open + close TextInput
 * (disabled when closed) + Closed Checkbox. Demonstrates that the
 * render-prop API supports cross-field interactions naturally.
 */

interface Holiday {
  open: string;
  close: string;
  closed: boolean;
}

export const HolidayHours: Story = {
  name: 'Holiday hours (cross-field disabling)',
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

/* ─── Story 3: Competitive Positioning (3 TextAreas) ──────────
 * Mirrors onboarding-competitors-sheet.tsx — Competitor + Gap +
 * Copy implication. Demonstrates wider rows with TextArea fields
 * and the same 3-column grid working for taller content.
 */

interface CompetitiveFrame {
  competitor: string;
  gap: string;
  copyImplication: string;
}

export const CompetitiveFrames: Story = {
  name: 'Competitive Positioning (3 textareas)',
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

/* ─── Story 4: Empty state + maxItems gating ──────────────────
 * Demonstrates the empty state and maxItems behavior — Add button
 * disappears once the cap is reached.
 */

interface SimpleNote {
  text: string;
}

export const EmptyAndMaxItems: Story = {
  name: 'Empty state + maxItems',
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
