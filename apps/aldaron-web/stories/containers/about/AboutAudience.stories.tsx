import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AboutAudienceComponent from '@/containers/about/AboutAudience';

const meta = {
  title: 'Containers/About/AboutAudience',
  component: AboutAudienceComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutAudienceComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AboutAudience: Story = {};
