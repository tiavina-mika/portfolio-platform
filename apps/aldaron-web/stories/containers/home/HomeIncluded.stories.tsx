import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HomeIncludedComponent from '@/containers/home/included/HomeIncluded';

const meta = {
  title: 'Containers/Home/HomeIncluded',
  component: HomeIncludedComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeIncludedComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
