import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HomeProjectsComponent from '@/containers/home/projects/HomeProjects';

const meta = {
  title: 'Containers/Home/HomeProjects',
  component: HomeProjectsComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeProjectsComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
