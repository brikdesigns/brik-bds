import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextLink } from '../TextLink';
import { StatusList, type StatusListItem } from './StatusList';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof StatusList> = {
  title: 'Components/status-list',
  component: StatusList,
  tags: ['surface-product'],
  parameters: { layout: 'padded', a11y: { test: 'error' } },
  argTypes: {
    items: {
      control: 'object',
      description:
        'Rows — each `{ id, title, description?, status, message? }`. `status` is `complete`, `in_progress`, `not_started` or `negative`.',
    },
    className: { control: 'text', description: 'Extra class on the wrapping `<ul>`.' },
  },
};

export default meta;
type Story = StoryObj<typeof StatusList>;

const ITEMS: StatusListItem[] = [
  {
    id: 'structure',
    title: 'Site Structure',
    description: 'Page inventory, navigation hierarchy and CMS collections.',
    status: 'complete',
  },
  {
    id: 'content',
    title: 'Page Content',
    description: 'Homepage and interior pages, synced to the CMS.',
    status: 'in_progress',
  },
  {
    id: 'cms',
    title: 'CMS Content',
    description: 'Collection schemas plus initial entries.',
    status: 'not_started',
  },
  {
    id: 'seo',
    title: 'SEO Metadata',
    description: 'Meta titles, descriptions and Open Graph tags.',
    status: 'negative',
    message: 'The agent run failed before it finished. Retry it from the Tasks tab.',
  },
  {
    id: 'legal',
    title: 'Legal Pages',
    description: (
      <>
        Privacy policy and terms of service.{' '}
        <TextLink href="#legal-pages" size="small">
          View the template
        </TextLink>
      </>
    ),
    status: 'not_started',
  },
];

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — all four states, including a negative row with a message
   and a row whose description holds a small TextLink.
   ═══════════════════════════════════════════════════════════════ */

/** @summary All four states, error message, and inline link */
export const Default: Story = {
  args: { items: ITEMS },
};
