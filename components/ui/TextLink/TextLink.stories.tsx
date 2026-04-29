import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextLink } from './TextLink';

/**
 * TextLink — inline anchor styled with the BDS link tokens. Use for navigation
 * inside body copy and for "learn more" / "view details" affordances.
 * @summary Inline styled anchor
 */
const meta: Meta<typeof TextLink> = {
  title: 'Components/Action/text-link',
  component: TextLink,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['default', 'small'] },
    href: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TextLink>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { href: '#', children: 'Learn more' },
};

/** Default size — body-text-aligned link.
 *  @summary Default size */
export const Default: Story = {
  args: { href: '#', children: 'Learn more' },
};

/** Small size — for dense rows and compact lists.
 *  @summary Small size */
export const Small: Story = {
  args: { href: '#', size: 'small', children: 'View details' },
};

/** External link — typically pairs with `target="_blank"` + `rel="noopener noreferrer"`.
 *  @summary External link with target=_blank */
export const External: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    children: 'Visit website',
  },
};

/** TextLink inline in body copy — confirms the link inherits paragraph
 *  line-height and aligns with surrounding text.
 *  @summary Inline link in a paragraph */
export const InParagraph: Story = {
  render: () => (
    <p
      style={{
        fontFamily: 'var(--font-family-body)',
        color: 'var(--text-primary)',
        maxWidth: '400px',
        lineHeight: '1.6',
      }}
    >
      Our team specializes in web design and development.{' '}
      <TextLink href="#">Learn more about our services</TextLink> or{' '}
      <TextLink href="#">contact us</TextLink> to get started.
    </p>
  ),
};
