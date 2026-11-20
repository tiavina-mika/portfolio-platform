import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import RuleBlockComponent from '@/containers/pricing/RuleBlock';

const meta = {
  title: 'Containers/Pricing/RuleBlock',
  component: RuleBlockComponent,
  tags: ['autodocs'],
  args: {
    title: 'Fixed price',
    description: 'The price is fixed at signing, after scoping. It does not change during the project.',
  },
  decorators: [
    (Story) => (
      <div className="flex max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RuleBlockComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
