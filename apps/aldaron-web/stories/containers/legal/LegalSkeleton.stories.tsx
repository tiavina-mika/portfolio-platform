import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LegalSkeletonComponent from '@/containers/legal/LegalSkeleton';

const meta = {
  title: 'Containers/Legal/LegalSkeleton',
  component: LegalSkeletonComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { label: 'Loading' },
} satisfies Meta<typeof LegalSkeletonComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LegalSkeleton: Story = {};
