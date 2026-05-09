import type { Meta, StoryObj } from '@storybook/react-vite';

import { SiteHeader } from './SiteHeader';

const meta: Meta<typeof SiteHeader> = {
  title: 'Site Shell/SiteHeader',
  component: SiteHeader,
  tags: ['surface-web', 'surface-shared'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SiteHeader>;

const navItems = [
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/** @summary Editorial-transparent archetype with full props (logo, phone, CTA, nav). */
export const EditorialTransparent: Story = {
  args: {
    archetype: 'editorial-transparent',
    brandName: 'Brik Designs',
    logoUrl: null,
    phone: '+1-615-555-0100',
    navItems,
    primaryCta: { label: 'Start a project', href: '/contact' },
    currentPath: '/services',
  },
};

/** @summary Minimal — text brand only, no phone, no CTA. */
export const Minimal: Story = {
  args: {
    archetype: 'editorial-transparent',
    brandName: 'Brik Designs',
    navItems,
    currentPath: null,
  },
};

/** @summary Unimplemented archetype — emits data-unimplemented-archetype for CI grep. */
export const UnimplementedArchetype: Story = {
  args: {
    archetype: 'service-centric',
    brandName: 'Brik Designs',
    navItems,
    primaryCta: { label: 'Contact', href: '/contact' },
  },
};
