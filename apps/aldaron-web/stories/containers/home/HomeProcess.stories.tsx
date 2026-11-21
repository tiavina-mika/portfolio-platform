import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HomeProcessComponent from '@/containers/home/process/HomeProcess';

const meta = {
  title: 'Containers/Home/HomeProcess',
  component: HomeProcessComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeProcessComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
