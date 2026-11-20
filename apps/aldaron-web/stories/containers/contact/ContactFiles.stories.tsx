import { fn } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContactFilesComponent from '@/containers/contact/ContactFiles';

const brief = new File(['x'.repeat(2048)], 'brief.pdf', { type: 'application/pdf' });
const mockup = new File(['x'.repeat(1_500_000)], 'mockup-home.png', { type: 'image/png' });

const meta = {
  title: 'Containers/Contact/ContactFiles',
  component: ContactFilesComponent,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    files: [],
    rejectedNames: [],
    disabled: false,
    onAdd: fn(),
    onRemove: fn(),
  },
} satisfies Meta<typeof ContactFilesComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithFiles: Story = { args: { files: [brief, mockup] } };

export const WithRejectedFiles: Story = {
  args: { files: [brief], rejectedNames: ['archive.zip', 'video.mov'] },
};

export const Disabled: Story = { args: { files: [brief], disabled: true } };
