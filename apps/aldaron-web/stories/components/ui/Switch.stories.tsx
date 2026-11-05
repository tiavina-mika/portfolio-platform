import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Switch } from '@/components/ui/Switch';

const meta = {
  title: 'Components/UI/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    id: 'notifications',
    label: 'Email notifications',
    description: 'Invitations and publications',
    disabled: false,
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const LabelOnly: Story = { args: { description: undefined } };

export const Disabled: Story = { args: { disabled: true } };

export const TrackOnly: Story = {
  args: { label: undefined, description: undefined, 'aria-label': 'Notifications' },
};
