import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';

const meta = {
  title: 'Components/UI/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { id: 'newsletter', disabled: false },
  render: args => (
    <div className="flex min-h-11 items-center gap-3">
      <Switch {...args} />
      <Label htmlFor={args.id}>Receive the newsletter</Label>
    </div>
  ),
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };
