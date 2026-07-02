import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sheet } from './Sheet';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { Field } from '../Field';

const meta: Meta<typeof Sheet> = {
  title: 'Containers/sheet',
  component: Sheet,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    side: { control: 'select', options: ['right', 'left', 'bottom'], description: 'Screen edge the sheet anchors to.' },
    variant: { control: 'select', options: ['default', 'floating'], description: '`floating` drops the backdrop and elevates + rounds the panel.' },
    mode: { control: 'select', options: [undefined, 'read', 'edit'], description: 'Drives the auto-footer — `read` → `[Close] [Edit]`, `edit` → `[Cancel] [Save]`.' },
    editTarget: { control: 'select', options: ['inline', 'page'], description: 'Semantic hint — `page` means `onEdit` navigates rather than flipping in place.' },
    title: { control: 'text', description: 'Header title.' },
    subtitle: { control: 'text', description: 'Eyebrow above the title.' },
    description: { control: 'text', description: 'Secondary line below the title.' },
    width: { control: 'text', description: 'Panel width (e.g. `400px`). Ignored for `side="bottom"`.' },
    closeOnBackdrop: { control: 'boolean', description: 'Dismiss on backdrop click.' },
    closeOnEscape: { control: 'boolean', description: 'Dismiss on Escape.' },
    showCloseButton: { control: 'boolean', description: 'Render the header close (×) button.' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ─── Story content helpers ──────────────────────────────────── */

const SampleContent = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-primary)', lineHeight: 'var(--font-line-height-normal)' }}>
    <p style={{ margin: 0 }}>This is the sheet panel content. Use it for detail views, settings panels, or contextual information.</p>
    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>The sheet slides in from the edge of the screen and overlays the main content with a backdrop.</p>
  </div>
);

const ReadOnlyFields = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
    <Field label="Company">Brik Designs</Field>
    <Field label="Owner">Nick Stanerson</Field>
    <Field label="Industry">Design & Engineering</Field>
    <Field label="Status">Active</Field>
  </div>
);

const EditFormFields = ({ onChange }: { onChange?: (k: string, v: string) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
    <TextInput label="Company" defaultValue="Brik Designs" onChange={(e) => onChange?.('company', e.target.value)} />
    <TextInput label="Owner" defaultValue="Nick Stanerson" onChange={(e) => onChange?.('owner', e.target.value)} />
    <TextInput label="Industry" defaultValue="Design & Engineering" onChange={(e) => onChange?.('industry', e.target.value)} />
    <TextInput label="Status" defaultValue="Active" onChange={(e) => onChange?.('status', e.target.value)} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * Canonical sheet behind a trigger button. Edit `title` / `description`,
 * switch `side` / `variant` / `mode`, and toggle the `closeOn*` /
 * `showCloseButton` behaviors via Controls. The `mode` Control drives the
 * auto-footer — see the mode stories for realistic read/edit content.
 *
 * @summary Sliding edge panel — side / variant / mode are Controls
 */
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open sheet</Button>
        <Sheet {...args} isOpen={open} onClose={() => setOpen(false)}>
          <SampleContent />
        </Sheet>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'Details',
    description: 'Metadata for this company record',
    side: 'right',
    width: '400px',
  },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — mode + variant semantic templates
   ═══════════════════════════════════════════════════════════════ */

/**
 * Read mode displays data with an auto-footer. When `onEdit` is supplied
 * the footer renders `[Close] [Edit]`.
 *
 * @summary Read mode — auto footer [Close] [Edit]
 */
export const ReadMode: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>View company</Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          subtitle="Company"
          title="Brik Designs"
          description="Active · Updated 2 days ago"
          mode="read"
          onEdit={() => alert('Switch to edit mode')}
        >
          <ReadOnlyFields />
        </Sheet>
      </>
    );
  },
};

/**
 * Edit mode is the active form state. The footer auto-renders
 * `[Cancel] [Save]`; pass `saveLoading` while the save promise is in
 * flight and `saveDisabled` when the form is invalid.
 *
 * @summary Edit mode — auto footer [Cancel] [Save]
 */
export const EditMode: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const handleSave = () => {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setOpen(false);
      }, 900);
    };
    return (
      <>
        <Button onClick={() => setOpen(true)}>Edit company</Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Edit company"
          description="Update record details"
          mode="edit"
          onSave={handleSave}
          saveLoading={saving}
        >
          <EditFormFields />
        </Sheet>
      </>
    );
  },
};

/**
 * `variant="floating"` — the panel sits on the page without a backdrop,
 * rounded and elevated. Use for inline drill-in from a table row or a
 * read-only popover. Shown here in read mode; omit `mode` for a
 * footer-less info popover.
 *
 * @summary Floating variant — no backdrop, elevated
 */
export const Floating: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>View company</Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          variant="floating"
          subtitle="Company"
          title="Brik Designs"
          description="Active · Updated 2 days ago"
          mode="read"
          onEdit={() => alert('Switch to edit mode')}
        >
          <ReadOnlyFields />
        </Sheet>
      </>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   PATTERNS — hook-driven + footer-composition canon
   ═══════════════════════════════════════════════════════════════ */

/**
 * The canonical pattern: open in `read`, click Edit to switch to `edit`,
 * Save / Cancel returns to `read`. Irreducible — the mode is a
 * hook-driven state machine args can't express.
 *
 * @summary Read ↔ edit toggle (canonical)
 */
export const ReadEditToggle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'read' | 'edit'>('read');
    const [saving, setSaving] = useState(false);

    const handleOpen = () => {
      setMode('read');
      setOpen(true);
    };
    const handleSave = () => {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setMode('read');
      }, 700);
    };

    return (
      <>
        <Button onClick={handleOpen}>Open company</Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          subtitle="Company"
          title="Brik Designs"
          description={mode === 'read' ? 'Active · Updated 2 days ago' : 'Editing record'}
          mode={mode}
          onEdit={() => setMode('edit')}
          onSave={handleSave}
          onCancel={() => setMode('read')}
          saveLoading={saving}
        >
          {mode === 'read' ? <ReadOnlyFields /> : <EditFormFields />}
        </Sheet>
      </>
    );
  },
};

/**
 * Sheet+page hybrid tables (services, offerings, service_lines,
 * industry_pages) surface three actions in the read-mode footer:
 * `[Close]` (ghost) · `[View details]` (secondary, navigates to the
 * full read page) · `[Edit]` (primary, navigates to the edit page).
 *
 * `editTarget="page"` is the semantic hint that `onEdit` navigates
 * to an edit page (vs. flipping the sheet to edit mode in place).
 *
 * @summary Read footer with [View details]
 */
export const WithViewDetails: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>View service</Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          subtitle="Service"
          title="Brand Identity Bundle"
          description="Marketing · Active · Updated 2 days ago"
          mode="read"
          editTarget="page"
          viewDetailsAction={{
            label: 'View details',
            onClick: () => alert('Navigate to /settings/services/brand-identity-bundle'),
          }}
          onEdit={() => alert('Navigate to /settings/services/brand-identity-bundle/edit')}
        >
          <ReadOnlyFields />
        </Sheet>
      </>
    );
  },
};

/**
 * For ancillary actions next to the primary Edit / Save — e.g. *Refresh*,
 * *Re-generate* — pass `secondaryAction` instead of composing a custom
 * `footer`. Renders left-aligned; mode-driven primary actions stay on the
 * right. Suppressed in edit mode.
 *
 * @summary Read footer with secondary action
 */
export const WithSecondaryAction: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const handleRefresh = () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 900);
    };
    return (
      <>
        <Button onClick={() => setOpen(true)}>View with secondary action</Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Strategic Brief"
          description="Last refreshed 2 days ago"
          mode="read"
          onEdit={() => alert('Switch to edit mode')}
          secondaryAction={{
            label: refreshing ? 'Refreshing…' : 'Refresh Brief',
            onClick: handleRefresh,
            loading: refreshing,
          }}
        >
          <ReadOnlyFields />
        </Sheet>
      </>
    );
  },
};

/**
 * Tabs render below the header. Each tab supplies its own body content —
 * `children` is ignored when `tabs` is supplied. Irreducible — `tabs` is
 * an array of `{ id, label, content }` objects a Control can't express.
 *
 * @summary Tabbed sheet body
 */
export const WithTabs: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    return (
      <>
        <Button onClick={() => setOpen(true)}>View with tabs</Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Brand Language"
          mode="read"
          onEdit={() => alert('Switch to edit mode')}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'details', label: 'Details', content: <ReadOnlyFields /> },
            {
              id: 'sources',
              label: 'Sources',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Provenance for this record — shows which upstream topics and enrichment runs wrote to these fields.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 'var(--padding-lg)' }}>
                    <li>Brand Strategy · 2 days ago</li>
                    <li>Manual Edit · 5 days ago</li>
                  </ul>
                </div>
              ),
            },
          ]}
        />
      </>
    );
  },
};

/**
 * The `footer` slot fully overrides the mode-driven auto-footer — use it
 * for bespoke action sets (e.g. a destructive `Archive` alongside
 * `Cancel` / `Save`) that the `read` / `edit` footers don't cover.
 *
 * @summary Custom footer override
 */
export const CustomFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>View details</Button>
        <Sheet
          isOpen={open}
          onClose={close}
          title="Company details"
          footer={(
            <>
              <Button variant="danger-ghost" onClick={close}>Archive</Button>
              <Button variant="ghost" onClick={close}>Cancel</Button>
              <Button variant="primary" onClick={close}>Save</Button>
            </>
          )}
        >
          <SampleContent />
        </Sheet>
      </>
    );
  },
};
