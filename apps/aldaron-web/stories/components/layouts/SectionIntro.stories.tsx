import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SectionIntroComponent from '@/components/layouts/SectionIntro';

const meta = {
  title: 'Components/SectionIntro',
  component: SectionIntroComponent,
  tags: ['autodocs'],
  args: {
    eyebrow: 'What we build',
    title: 'Four platforms, a price per screen.',
    description: 'A distinct view counts as one screen; its states and variants are included.',
    level: 2,
  },
} satisfies Meta<typeof SectionIntroComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Section: Story = {};

export const PageHead: Story = {
  args: { level: 1, title: 'Your product, at a fixed price, screen by screen.' },
};
