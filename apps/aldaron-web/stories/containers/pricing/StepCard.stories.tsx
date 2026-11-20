import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import StepCardComponent from '@/containers/pricing/StepCard';

const meta = {
  title: 'Containers/Pricing/StepCard',
  component: StepCardComponent,
  tags: ['autodocs'],
  args: {
    number: 1,
    title: 'Scoping',
    description: 'Free. We define the scope: platforms, screens, back office, complexity.',
  },
  decorators: [
    (Story) => (
      <div className="flex max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StepCardComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
