import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '@/components/ui/Badge';

const meta = {
  title: 'Components/UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'primary', 'brand', 'success', 'warning', 'destructive', 'info', 'outline'],
      control: { type: 'select' },
    },
    size: {
      options: ['md', 'sm'],
      control: { type: 'select' },
    },
  },
  args: {
    variant: 'default',
    size: 'md',
    hasDot: false,
    children: 'Draft',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Brand: Story = { args: { variant: 'brand', children: 'Included in the base' } };

export const Success: Story = { args: { variant: 'success', hasDot: true, children: 'Published' } };

export const Warning: Story = { args: { variant: 'warning', hasDot: true, children: 'Pending' } };

export const Destructive: Story = { args: { variant: 'destructive', hasDot: true, children: 'Rejected' } };

export const Info: Story = { args: { variant: 'info', hasDot: true, children: 'Scheduled' } };

export const Mono: Story = { args: { variant: 'outline', isMono: true, isSquare: true, children: 'V1.2.0' } };

export const Small: Story = { args: { size: 'sm' } };
