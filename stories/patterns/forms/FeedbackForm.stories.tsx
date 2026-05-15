import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Form } from '../../../components/ui/Form';
import { TextInput } from '../../../components/ui/TextInput';
import { TextArea } from '../../../components/ui/TextArea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

const meta: Meta = {
  title: 'Patterns/Forms/feedback-form',
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

/* ═══════════════════════════════════════════════════════════════
   Multi-primitive form composition: Form composer × (TextInput +
   Select + TextArea + Button) with interactive validation state.
   Lives in Patterns/Forms/ per ADR-010 amendment §1 (compositions
   combining multiple distinct primitives don't live on the
   primitive's story file).
   Relocated from Form.stories.tsx → Patterns in #618 Batch C.
   ═══════════════════════════════════════════════════════════════ */

function FeedbackForm({ onSubmit }: { onSubmit: (e: React.FormEvent) => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  return (
    <div style={{ width: 400 }}>
      <Form
        title="Feedback"
        description="Help us improve our product."
        error={error}
        success={submitted ? 'Thank you for your feedback!' : undefined}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          if (!data.get('name')) {
            setError('Name is required.');
            setSubmitted(false);
          } else {
            setError('');
            setSubmitted(true);
            onSubmit(e);
          }
        }}
        footer={
          <div style={{ display: 'flex', gap: 'var(--gap-md)' }}>
            <Button type="submit">Submit</Button>
            <Button
              variant="ghost"
              type="reset"
              onClick={() => {
                setError('');
                setSubmitted(false);
              }}
            >
              Reset
            </Button>
          </div>
        }
      >
        <TextInput label="Name" name="name" placeholder="Your name" fullWidth />
        <Select
          label="Rating"
          name="rating"
          options={[
            { label: 'Excellent', value: '5' },
            { label: 'Good', value: '4' },
            { label: 'Average', value: '3' },
            { label: 'Poor', value: '2' },
            { label: 'Terrible', value: '1' },
          ]}
          placeholder="Select a rating"
        />
        <TextArea label="Comments" name="comments" placeholder="Tell us more..." fullWidth />
      </Form>
    </div>
  );
}

/** @summary Feedback form — name + rating + comments with inline validation */
export const Default: Story = {
  args: { onSubmit: fn() },
  render: (args) => (
    <FeedbackForm
      onSubmit={(args as { onSubmit: (e: React.FormEvent) => void }).onSubmit}
    />
  ),
};
