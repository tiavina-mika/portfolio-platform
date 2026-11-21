import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProjectCardComponent from '@/containers/project/ProjectCard';

const meta = {
  title: 'Containers/Project/ProjectCard',
  component: ProjectCardComponent,
  tags: ['autodocs'],
  args: {
    name: 'Tsara Livraison',
    eyebrow: 'Delivery',
    summary: 'Meal delivery app for a startup, with a back office to follow orders and couriers.',
    screenshotLabel: 'Product screenshot',
    facts: [
      { label: 'Platforms', value: 'Mobile · Back office' },
      { label: 'Screens', value: '110 mobile · 20 back office' },
      { label: 'Lead time', value: '8 weeks' },
      { label: 'Price', value: '€3,500' },
    ],
  },
  decorators: [
    Story => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectCardComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectCard: Story = {};
