import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PageHeroComponent from '@/components/layouts/PageHero';

const meta = {
  title: 'Components/PageHero',
  component: PageHeroComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    eyebrow: 'About',
    title: 'A development company for startups.',
    description:
      'We design and build web and mobile products for startups, from pre-seed to Series A, at a fixed price.',
  },
} satisfies Meta<typeof PageHeroComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PageHero: Story = {};
