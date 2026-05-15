import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Form } from '../../../components/ui/Form';
import { TextInput } from '../../../components/ui/TextInput';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

const meta: Meta = {
  title: 'Patterns/Forms/search-form',
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

/* ═══════════════════════════════════════════════════════════════
   Horizontal-layout Form composition: Form composer × (TextInput +
   Select + Button) inline. Demonstrates `layout="horizontal"` with
   a compact search bar pattern.
   Relocated from Form.stories.tsx Variants → Patterns in #618 Batch C.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Horizontal search form — query + category + submit, inline layout */
export const Default: Story = {
  args: { onSubmit: fn() },
  render: (args) => (
    <div style={{ width: 500 }}>
      <Form
        title="Quick Search"
        layout="horizontal"
        gap="sm"
        onSubmit={(e) => {
          e.preventDefault();
          (args as { onSubmit?: (e: React.FormEvent) => void }).onSubmit?.(e);
        }}
        footer={<Button type="submit" size="sm">Search</Button>}
      >
        <div style={{ flex: '1 1 200px' }}>
          <TextInput placeholder="Search..." fullWidth />
        </div>
        <div style={{ flex: '0 1 160px' }}>
          <Select
            options={[
              { label: 'All', value: 'all' },
              { label: 'Products', value: 'products' },
              { label: 'Services', value: 'services' },
            ]}
            placeholder="Category"
          />
        </div>
      </Form>
    </div>
  ),
};
