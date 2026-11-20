import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ScreenshotPlaceholderComponent from '@/components/ScreenshotPlaceholder';

const meta = {
  title: 'Components/ScreenshotPlaceholder',
  component: ScreenshotPlaceholderComponent,
  tags: ['autodocs'],
  args: { label: 'Product screenshot', className: 'max-w-md' },
} satisfies Meta<typeof ScreenshotPlaceholderComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScreenshotPlaceholder: Story = {};
