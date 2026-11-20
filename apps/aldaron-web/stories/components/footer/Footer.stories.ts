import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FooterComponent from '@/components/footer/Footer';

const meta = {
  title: 'Components/Footer',
  component: FooterComponent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FooterComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Footer: Story = {
  args: {
    menus: [
      { id: 'pricing', label: 'Offer and pricing', value: '/pricing' },
      { id: 'simulator', label: 'Simulator', value: '/simulator' },
      { id: 'projects', label: 'Projects', value: '/projects' },
      { id: 'about', label: 'About', value: '/about' },
      { id: 'contact', label: 'Contact', value: '/contact' },
    ],
  },
};
