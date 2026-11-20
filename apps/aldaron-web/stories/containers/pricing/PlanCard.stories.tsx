import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PlanCardComponent from '@/containers/pricing/PlanCard';

const meta = {
  title: 'Containers/Pricing/PlanCard',
  component: PlanCardComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'inverted'],
      control: { type: 'select' },
    },
  },
  args: {
    eyebrow: 'From',
    title: 'Website or web app',
    price: '€1,500',
    description: '€25 per screen for a static site, €18 for a simple web app, €30 for a rich interface.',
    variant: 'default',
  },
  decorators: [
    (Story) => (
      <div className="flex max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlanCardComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inverted: Story = {
  args: {
    eyebrow: 'From',
    title: 'Mobile',
    price: '€2,500',
    description: '€25 per screen, iOS and Android. Publication on the App Store and Google Play included.',
    variant: 'inverted',
  },
};
