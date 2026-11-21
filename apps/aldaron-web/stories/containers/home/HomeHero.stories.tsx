import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HomeHeroComponent from '@/containers/home/hero/HomeHero';

const meta = {
  title: 'Containers/Home/HomeHero',
  component: HomeHeroComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeHeroComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
