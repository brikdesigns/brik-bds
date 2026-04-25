import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sheet } from './Sheet';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { Field } from '../Field';

const meta: Meta<typeof Sheet> = {
  title: 'Displays/Sheet/sheet',
  component: Sheet,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    side: { control: 'select', options: ['right', 'left', 'bottom'] },
    variant: { control: 'select', options: ['default', 'floating'] },
    mode: { control: 'select', options: [undefined, 'read', 'edit'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    description: { control: 'text' },
    width: { control: 'text' },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%' }}>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap' }}>
    {children}
  </div>
);

const SampleContent = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-primary)', lineHeight: 'var(--font-line-height-normal)' }}>
    <p style={{ margin: 0 }}>This is the sheet panel content. Use it for detail views, settings panels, or contextual information.</p>
    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>The sheet slides in from the edge of the screen and overlays the main content with a backdrop.</p>
  </div>
);

/* ─── Read-only detail view (faux) ───────────────────────────── */

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

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
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

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => {
    const [openId, setOpenId] = useState<string | null>(null);
    const open = (id: string) => setOpenId(id);
    const close = () => setOpenId(null);

    return (
      <Stack>
        <SectionLabel>Right (default)</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('right')}>Open right</Button>
            <Sheet isOpen={openId === 'right'} onClose={close} title="Details" side="right">
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Left</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('left')}>Open left</Button>
            <Sheet isOpen={openId === 'left'} onClose={close} title="Navigation" side="left" width="320px">
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Bottom</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('bottom')}>Open bottom</Button>
            <Sheet isOpen={openId === 'bottom'} onClose={close} title="Actions" side="bottom">
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Wide (600px)</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('wide')}>Open wide</Button>
            <Sheet isOpen={openId === 'wide'} onClose={close} title="Report Details" width="600px">
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>No title</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('notitle')}>Open minimal</Button>
            <Sheet isOpen={openId === 'notitle'} onClose={close} showCloseButton>
              <SampleContent />
            </Sheet>
          </div>
        </Row>
      </Stack>
    );
  },
};

/* ─── Header (title, subtitle, back button) ──────────────────── */

export const Header: Story = {
  render: () => {
    const [openId, setOpenId] = useState<string | null>(null);
    const open = (id: string) => setOpenId(id);
    const close = () => setOpenId(null);

    return (
      <Stack>
        <SectionLabel>Title only</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('title')}>Open</Button>
            <Sheet isOpen={openId === 'title'} onClose={close} title="Company details">
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Title + description</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('description')}>Open</Button>
            <Sheet
              isOpen={openId === 'description'}
              onClose={close}
              title="Company details"
              description="Metadata for this company record"
            >
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Title + subtitle (eyebrow)</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('subtitle')}>Open</Button>
            <Sheet
              isOpen={openId === 'subtitle'}
              onClose={close}
              subtitle="Company"
              title="Brik Designs"
            >
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>Subtitle + Title + description</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('full')}>Open</Button>
            <Sheet
              isOpen={openId === 'full'}
              onClose={close}
              subtitle="Company"
              title="Brik Designs"
              description="Active · Updated 2 days ago"
            >
              <SampleContent />
            </Sheet>
          </div>
        </Row>

        <SectionLabel>With back button (nested flow)</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('back')}>Open nested</Button>
            <Sheet
              isOpen={openId === 'back'}
              onClose={close}
              title="Contact"
              description="Opened from Company details"
              onBack={close}
            >
              <SampleContent />
            </Sheet>
          </div>
        </Row>
      </Stack>
    );
  },
};

/* ─── Read mode — footer renders [Close] [Edit] ──────────────── */

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

/* ─── Read mode floating — no backdrop, rounded, elevated ────── */

export const ReadModeFloating: Story = {
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

/* ─── Edit mode — footer renders [Cancel] [Save] ─────────────── */

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

/* ─── Read ↔ Edit toggle — the canonical pattern ─────────────── */

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

/* ─── Read-only floating (popover, no footer) ────────────────── */

export const ReadOnlyFloating: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Show info</Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Quick info"
          description="Read-only — no CTA needed"
          variant="floating"
        >
          <SampleContent />
        </Sheet>
      </>
    );
  },
};

/* ─── Tabs (Details / Sources) ───────────────────────────────── */

export const Tabs: Story = {
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

/* ─── Secondary action (e.g. "Refresh Brief") ────────────────── */

export const SecondaryAction: Story = {
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

/* ─── Tabs + Secondary action + Read/Edit toggle ─────────────── */

export const TabsWithSecondaryAction: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'read' | 'edit'>('read');
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const handleOpen = () => { setMode('read'); setActiveTab('details'); setOpen(true); };
    const handleSave = () => {
      setSaving(true);
      setTimeout(() => { setSaving(false); setMode('read'); }, 700);
    };
    const handleRefresh = () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 900);
    };

    return (
      <>
        <Button onClick={handleOpen}>Open full sheet</Button>
        <Sheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Strategic Brief"
          description={mode === 'read' ? 'Active · Updated 2 days ago' : 'Editing brief'}
          mode={mode}
          onEdit={() => setMode('edit')}
          onSave={handleSave}
          onCancel={() => setMode('read')}
          saveLoading={saving}
          secondaryAction={{
            label: refreshing ? 'Refreshing…' : 'Refresh Brief',
            onClick: handleRefresh,
            loading: refreshing,
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={mode === 'read' ? [
            { id: 'details', label: 'Details', content: <ReadOnlyFields /> },
            {
              id: 'sources',
              label: 'Sources',
              content: (
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  Provenance timeline + linked records drill-in.
                </p>
              ),
            },
          ] : undefined}
        >
          {mode === 'edit' ? <EditFormFields /> : null}
        </Sheet>
      </>
    );
  },
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  render: () => {
    const [openId, setOpenId] = useState<string | null>(null);
    const open = (id: string) => setOpenId(id);
    const close = () => setOpenId(null);

    return (
      <Stack>
        <SectionLabel>Custom footer (overrides mode)</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('custom')}>View details</Button>
            <Sheet
              isOpen={openId === 'custom'}
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
          </div>
        </Row>

        <SectionLabel>Mobile bottom sheet</SectionLabel>
        <Row>
          <div>
            <Button onClick={() => open('mobile')}>Show filters</Button>
            <Sheet isOpen={openId === 'mobile'} onClose={close} title="Filters" side="bottom">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
                <SampleContent />
                <Button variant="primary" onClick={close}>Apply filters</Button>
              </div>
            </Sheet>
          </div>
        </Row>
      </Stack>
    );
  },
};
