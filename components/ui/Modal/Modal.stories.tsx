import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';

const meta = {
  title: 'Components/modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Open/closed state',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Size variant',
    },
    closeOnBackdrop: {
      control: 'boolean',
      description: 'Close on backdrop click',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close on escape key',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Standard modal with title, content, and footer actions.
 * Matches the Figma "Modal" component: header with close button,
 * divider, content area, and right-aligned footer buttons.
 */
export const Basic: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Title Goes Here"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </>
  }
>
  <p>Description goes here</p>
</Modal>`,
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert('Saved!');
                  setIsOpen(false);
                }}
              >
                Save
              </Button>
            </>
          }
        >
          <p>Description goes here</p>
        </Modal>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'Title Goes Here',
  },
};

/**
 * Confirmation dialog with destructive action
 */
export const ConfirmDelete: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Delete"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
</Modal>`,
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Confirm Action</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert('Deleted!');
                  setIsOpen(false);
                }}
              >
                Delete
              </Button>
            </>
          }
        >
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </Modal>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'Confirm Delete',
  },
};

/**
 * Small modal
 */
export const Small: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal isOpen={isOpen} onClose={onClose} title="Small Modal" size="sm">
  <p>This is a small modal.</p>
</Modal>`,
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Small Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <p>This is a small modal.</p>
        </Modal>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'Small Modal',
    size: 'sm',
  },
};

/**
 * Large modal
 */
export const Large: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal isOpen={isOpen} onClose={onClose} title="Large Modal" size="lg">
  <p>This is a large modal with more space for content.</p>
</Modal>`,
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Large Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <p>This is a large modal with more space for content.</p>
          <p>It can accommodate more information and longer forms.</p>
        </Modal>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'Large Modal',
    size: 'lg',
  },
};

/**
 * Modal with long scrolling content
 */
export const ScrollingContent: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal isOpen={isOpen} onClose={onClose} title="Long Content">
  <p>Paragraph 1...</p>
  {/* Modal body scrolls when content exceeds max height */}
</Modal>`,
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Scrolling Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>Done</Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--md)' }}>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i}>
                This is paragraph {i + 1}. The modal body will scroll if content exceeds the maximum height.
              </p>
            ))}
          </div>
        </Modal>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'Long Content',
  },
};

/**
 * Modal without close button — must use footer or Escape key
 */
export const NoCloseButton: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="No Close Button"
  showCloseButton={false}
  footer={<Button variant="primary" onClick={onClose}>Close</Button>}
>
  <p>This modal has no close button in the header.</p>
</Modal>`,
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          footer={
            <Button variant="primary" onClick={() => setIsOpen(false)}>Close</Button>
          }
        >
          <p>This modal has no close button in the header. You must use the button in the footer or press Escape.</p>
        </Modal>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'No Close Button',
    showCloseButton: false,
  },
};

/**
 * Form in modal with footer actions
 */
export const FormExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Contact Form"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit}>Submit</Button>
    </>
  }
>
  <form>...</form>
</Modal>`,
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    const inputStyle: React.CSSProperties = {
      padding: 'var(--_space---md)',
      border: 'var(--_border-width---sm) solid var(--_color---border--input)',
      borderRadius: 'var(--_border-radius---input)',
      fontFamily: 'var(--_typography---font-family--body)',
      fontSize: 'var(--_typography---body--md-base)',
      width: '100%',
      boxSizing: 'border-box',
    };

    const labelStyle: React.CSSProperties = {
      fontFamily: 'var(--_typography---font-family--label)',
      fontSize: 'var(--_typography---label--md-base)',
      fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Form</Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert('Form submitted!');
                  setIsOpen(false);
                }}
              >
                Submit
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
              <label style={labelStyle}>Name</label>
              <input type="text" placeholder="Your name" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="your@email.com" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
              <label style={labelStyle}>Message</label>
              <textarea
                rows={4}
                placeholder="Your message"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        </Modal>
      </>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
    title: 'Contact Form',
    size: 'md',
  },
};
