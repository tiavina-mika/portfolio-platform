import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AboutPrinciplesComponent from '@/containers/about/AboutPrinciples';

const meta = {
  title: 'Containers/About/AboutPrinciples',
  component: AboutPrinciplesComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutPrinciplesComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AboutPrinciples: Story = {};
