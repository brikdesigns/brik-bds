import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faPalette, faShieldHalved, faGears } from '@fortawesome/free-solid-svg-icons';
import { CardFeature } from './CardFeature';
import { TextLink } from '../TextLink';

const meta: Meta<typeof CardFeature> = {
  title: 'Displays/Card/card-feature',
  component: CardFeature,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    align: {
      control: 'select',
      options: ['left', 'center'],
    },
  },
} satisfies Meta<typeof CardFeature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <FontAwesomeIcon icon={faRocket} />,
    title: 'Fast Performance',
    description: 'Lightning-fast load times with optimized delivery across all devices.',
    align: 'left',
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

export const Centered: Story = {
  args: {
    icon: <FontAwesomeIcon icon={faPalette} />,
    title: 'Beautiful Design',
    description: 'Thoughtfully crafted interfaces that delight users and drive engagement.',
    align: 'center',
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

export const WithAction: Story = {
  args: {
    icon: <FontAwesomeIcon icon={faShieldHalved} />,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and compliance built into every layer.',
    action: <TextLink href="#">Learn more</TextLink>,
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

export const FeatureGrid: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--gap-lg)',
      maxWidth: 960,
    }}>
      <CardFeature
        icon={<FontAwesomeIcon icon={faRocket} />}
        title="Fast Performance"
        description="Lightning-fast load times with optimized delivery."
      />
      <CardFeature
        icon={<FontAwesomeIcon icon={faPalette} />}
        title="Beautiful Design"
        description="Thoughtfully crafted interfaces that delight users."
      />
      <CardFeature
        icon={<FontAwesomeIcon icon={faShieldHalved} />}
        title="Enterprise Security"
        description="Bank-grade encryption and compliance built in."
      />
      <CardFeature
        icon={<FontAwesomeIcon icon={faGears} />}
        title="Easy Integration"
        description="Connect with your existing tools in minutes."
      />
    </div>
  ),
};

export const NoIcon: Story = {
  args: {
    title: 'Simple Feature',
    description: 'Sometimes you just need a title and description without an icon.',
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};
