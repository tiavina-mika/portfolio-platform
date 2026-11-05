import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';

const meta = {
  title: 'Components/UI/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { id: 'terms', disabled: false },
  render: args => (
    <div className="flex items-center gap-2.5">
      <Checkbox {...args} />
      <Label htmlFor={args.id}>Accept the terms</Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };
