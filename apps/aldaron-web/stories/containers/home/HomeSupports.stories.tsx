import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HomeSupportsComponent from '@/containers/home/supports/HomeSupports';

const meta = {
  title: 'Containers/Home/HomeSupports',
  component: HomeSupportsComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeSupportsComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
