import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sheet } from './Sheet';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { Field } from '../Field';

/**
 * Sheet — slide-in panel for detail views, settings, and contextual flows.
 * Supports `read`/`edit` modes (footer adapts), three sides (`right`/`left`/`bottom`),
 * `default`/`floating` variants, tabs, secondary actions, back navigation, and
 * a custom footer override.
 * @summary Slide-in panel with read/edit modes
 */
const meta: Meta<typeof Sheet> = {
  title: 'Components/Container/sheet',
  component: Sheet,
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

/* ─── Story helpers ──────────────────────────────────────────── */

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

const EditFormFields = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
    <TextInput label="Company" defaultValue="Brik Designs" />
    <TextInput label="Owner" defaultValue="Nick Stanerson" />
    <TextInput label="Industry" defaultValue="Design & Engineering" />
    <TextInput label="Status" defaultValue="Active" />
  </div>
);

/** Helper that wraps a Sheet in a controlled-open useState shell. */
function Demo({
  trigger = 'Open sheet',
  args,
  contentBuilder,
}: {
  trigger?: string;
  args: Partial<React.ComponentProps<typeof Sheet>>;
  contentBuilder?: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{trigger}</Button>
      <Sheet {...(args as React.ComponentProps<typeof Sheet>)} isOpen={open} onClose={close}>
        {contentBuilder ? contentBuilder(close) : <SampleContent />}
      </Sheet>
    </>
  );
}

/* ─── Sandbox ────────────────────────────────────────────────── */

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  render: (args) => {
    const Inner = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open sheet</Button>
          <Sheet {...args} isOpen={open} onClose={() => setOpen(false)}>
            <SampleContent />
          </Sheet>
        </>
      );
    };
    return <Inner />;
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

/* ─── Side axis ──────────────────────────────────────────────── */

/** Right side (default) — the most common shape.
 *  @summary Right-side sheet */
export const Right: Story = {
  render: () => <Demo trigger="Open right" args={{ title: 'Details', side: 'right' }} />,
};

/** Left side — used for navigation drawers.
 *  @summary Left-side sheet */
export const Left: Story = {
  render: () => <Demo trigger="Open left" args={{ title: 'Navigation', side: 'left', width: '320px' }} />,
};

/** Bottom side — mobile-style action sheet.
 *  @summary Bottom-side sheet */
export const Bottom: Story = {
  render: () => <Demo trigger="Open bottom" args={{ title: 'Actions', side: 'bottom' }} />,
};

/** Wide (600px) — for dense detail views.
 *  @summary Wide sheet */
export const Wide: Story = {
  render: () => <Demo trigger="Open wide" args={{ title: 'Report Details', width: '600px' }} />,
};

/** No title — minimal chrome, just content + close button.
 *  @summary Sheet without title */
export const NoTitle: Story = {
  render: () => <Demo trigger="Open minimal" args={{ showCloseButton: true }} />,
};

/* ─── Header shapes ──────────────────────────────────────────── */

/** Title only.
 *  @summary Title-only header */
export const TitleOnly: Story = {
  render: () => <Demo args={{ title: 'Company details' }} />,
};

/** Title + description — short status line below the title.
 *  @summary Title with description */
export const TitleWithDescription: Story = {
  render: () => <Demo args={{ title: 'Company details', description: 'Metadata for this company record' }} />,
};

/** Subtitle (eyebrow) + title — eyebrow above the title.
 *  @summary Subtitle eyebrow + title */
export const TitleWithEyebrow: Story = {
  render: () => <Demo args={{ subtitle: 'Company', title: 'Brik Designs' }} />,
};

/** Subtitle + title + description — full header.
 *  @summary Full header (eyebrow + title + description) */
export const FullHeader: Story = {
  render: () => (
    <Demo args={{
      subtitle: 'Company',
      title: 'Brik Designs',
      description: 'Active · Updated 2 days ago',
    }} />
  ),
};

/** With back button — for nested-flow drill-in. The `onBack` prop renders the
 *  back chevron in the header.
 *  @summary Sheet with back navigation */
export const WithBackButton: Story = {
  render: () => {
    const Inner = () => {
      const [open, setOpen] = useState(false);
      const close = () => setOpen(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open nested</Button>
          <Sheet
            isOpen={open}
            onClose={close}
            title="Contact"
            description="Opened from Company details"
            onBack={close}
          >
            <SampleContent />
          </Sheet>
        </>
      );
    };
    return <Inner />;
  },
};

/* ─── Mode patterns ──────────────────────────────────────────── */

/** Read mode — footer renders `[Close] [Edit]`. The canonical entity-detail shape.
 *  @summary Read mode with [Close] [Edit] footer */
export const ReadMode: Story = {
  render: () => {
    const Inner = () => {
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
    };
    return <Inner />;
  },
};

/** Read mode + floating variant — no backdrop, rounded, elevated.
 *  @summary Floating read-mode sheet */
export const ReadModeFloating: Story = {
  render: () => {
    const Inner = () => {
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
    };
    return <Inner />;
  },
};

/** Edit mode — footer renders `[Cancel] [Save]`. Save shows loading.
 *  @summary Edit mode with [Cancel] [Save] footer */
export const EditMode: Story = {
  render: () => {
    const Inner = () => {
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
    };
    return <Inner />;
  },
};

/** Read ↔ Edit toggle — the canonical entity-record pattern. Click "Open
 *  company", then "Edit", then "Save" to see the full lifecycle.
 *  @summary Read ↔ Edit lifecycle */
export const ReadEditToggle: Story = {
  render: () => {
    const Inner = () => {
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
    };
    return <Inner />;
  },
};

/** Read-only floating — popover-style, no footer.
 *  @summary Read-only floating popover */
export const ReadOnlyFloating: Story = {
  render: () => {
    const Inner = () => {
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
    };
    return <Inner />;
  },
};

/* ─── Tabs + secondary action ────────────────────────────────── */

/** Tabs (Details / Sources) — multi-tab content within a single sheet.
 *  @summary Sheet with tabs */
export const Tabs: Story = {
  render: () => {
    const Inner = () => {
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
    };
    return <Inner />;
  },
};

/** Secondary action — adds a `secondaryAction` button (e.g. "Refresh Brief")
 *  to the header.
 *  @summary Sheet with secondary action button */
export const SecondaryAction: Story = {
  render: () => {
    const Inner = () => {
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
    };
    return <Inner />;
  },
};

/** Tabs + secondary action + read/edit toggle — the most complex shape.
 *  @summary Tabs + secondary action + read/edit */
export const TabsWithSecondaryAction: Story = {
  render: () => {
    const Inner = () => {
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
    };
    return <Inner />;
  },
};
