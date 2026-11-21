import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EyebrowComponent from '@/components/typography/Eyebrow';

const meta = {
  title: 'Components/Eyebrow',
  component: EyebrowComponent,
  tags: ['autodocs'],
  args: { children: 'What we build' },
} satisfies Meta<typeof EyebrowComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Eyebrow: Story = {};
