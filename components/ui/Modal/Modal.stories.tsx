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
 * Basic modal with title and content
 */
export const Basic: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
  <p>This is a basic modal with some content.</p>
</Modal>`,
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p>This is a basic modal with some content.</p>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Modal Title',
  },
};

/**
 * Modal with footer buttons
 */
export const WithFooter: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Confirm Action</Button>
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Delete"
  footer={
    <>
      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button onClick={handleDelete}>Delete</Button>
    </>
  }
>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
</Modal>`,
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Confirm Action</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Delete"
          footer={
            <div style={{ display: 'flex', gap: 'var(--_space---gap--md)' }}>
              <Button onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  alert('Deleted!');
                  setIsOpen(false);
                }}
              >
                Delete
              </Button>
            </div>
          }
        >
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </Modal>
      </>
    );
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
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Small Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Small Modal"
          size="sm"
        >
          <p>This is a small modal.</p>
        </Modal>
      </>
    );
  },
};

/**
 * Medium modal (default)
 */
export const Medium: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal isOpen={isOpen} onClose={onClose} title="Medium Modal" size="md">
  <p>This is a medium modal (default size).</p>
</Modal>`,
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Medium Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Medium Modal"
          size="md"
        >
          <p>This is a medium modal (default size).</p>
        </Modal>
      </>
    );
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
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Large Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Large Modal"
          size="lg"
        >
          <p>This is a large modal with more space for content.</p>
          <p>It can accommodate more information and longer forms.</p>
        </Modal>
      </>
    );
  },
};

/**
 * Extra large modal
 */
export const ExtraLarge: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal isOpen={isOpen} onClose={onClose} title="Extra Large Modal" size="xl">
  <p>This is an extra large modal for complex content.</p>
</Modal>`,
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open XL Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Extra Large Modal"
          size="xl"
        >
          <p>This is an extra large modal for complex content.</p>
        </Modal>
      </>
    );
  },
};

/**
 * Full width modal
 */
export const FullWidth: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal isOpen={isOpen} onClose={onClose} title="Full Width Modal" size="full">
  <p>This modal takes up most of the viewport width.</p>
</Modal>`,
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Full Width Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Full Width Modal"
          size="full"
        >
          <p>This modal takes up most of the viewport width.</p>
        </Modal>
      </>
    );
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
  <p>Paragraph 2...</p>
  {/* Modal body scrolls when content exceeds max height */}
</Modal>`,
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Scrolling Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Long Content"
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
};

/**
 * Modal without close button
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
  footer={<Button onClick={onClose}>Close</Button>}
>
  <p>This modal has no close button in the header.</p>
</Modal>`,
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="No Close Button"
          showCloseButton={false}
          footer={
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          }
        >
          <p>This modal has no close button in the header. You must use the button in the footer or press Escape.</p>
        </Modal>
      </>
    );
  },
};

/**
 * Modal that can't be dismissed by backdrop click
 */
export const NoBackdropClose: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal with No Backdrop Close"
  closeOnBackdrop={false}
  footer={<Button onClick={onClose}>Close</Button>}
>
  <p>This modal cannot be closed by clicking the backdrop.</p>
</Modal>`,
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal with No Backdrop Close"
          closeOnBackdrop={false}
          footer={
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          }
        >
          <p>This modal cannot be closed by clicking the backdrop. Use the close button or press Escape.</p>
        </Modal>
      </>
    );
  },
};

/**
 * Form in modal
 */
export const FormExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open Form</Button>
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Contact Form"
  size="md"
  footer={
    <>
      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button onClick={handleSubmit}>Submit</Button>
    </>
  }
>
  <Input label="Name" placeholder="Your name" fullWidth />
  <Input label="Email" type="email" placeholder="your@email.com" fullWidth />
  <textarea rows={4} placeholder="Your message" />
</Modal>`,
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Form</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Contact Form"
          size="md"
          footer={
            <div style={{ display: 'flex', gap: 'var(--_space---gap--md)' }}>
              <Button onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  alert('Form submitted!');
                  setIsOpen(false);
                }}
              >
                Submit
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
              <label style={{
                fontFamily: 'var(--_typography---font-family--label)',
                fontSize: 'var(--_typography---label--md-base)',
                fontWeight: 'var(--font-weight--semi-bold)',
              }}>
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                style={{
                  padding: 'var(--_space---input)',
                  border: '1px solid var(--_color---border--input)',
                  borderRadius: 'var(--_border-radius---input)',
                  fontFamily: 'var(--_typography---font-family--body)',
                  fontSize: 'var(--_typography---body--sm)',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
              <label style={{
                fontFamily: 'var(--_typography---font-family--label)',
                fontSize: 'var(--_typography---label--md-base)',
                fontWeight: 'var(--font-weight--semi-bold)',
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  padding: 'var(--_space---input)',
                  border: '1px solid var(--_color---border--input)',
                  borderRadius: 'var(--_border-radius---input)',
                  fontFamily: 'var(--_typography---font-family--body)',
                  fontSize: 'var(--_typography---body--sm)',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--sm)' }}>
              <label style={{
                fontFamily: 'var(--_typography---font-family--label)',
                fontSize: 'var(--_typography---label--md-base)',
                fontWeight: 'var(--font-weight--semi-bold)',
              }}>
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Your message"
                style={{
                  padding: 'var(--_space---input)',
                  border: '1px solid var(--_color---border--input)',
                  borderRadius: 'var(--_border-radius---input)',
                  fontFamily: 'var(--_typography---font-family--body)',
                  fontSize: 'var(--_typography---body--sm)',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </Modal>
      </>
    );
  },
};
