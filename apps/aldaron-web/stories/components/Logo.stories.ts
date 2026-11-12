import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LogoComponent from '@/components/Logo';

const meta = {
  title: 'Components/Logo',
  component: LogoComponent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { variant: 'horizontal' },
} satisfies Meta<typeof LogoComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const Symbol: Story = { args: { variant: 'symbol' } };
