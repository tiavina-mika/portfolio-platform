import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FooterContainerComponent from '@/components/footer/FooterContainer';

const meta = {
  title: 'Components/Footer',
  component: FooterContainerComponent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FooterContainerComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Footer: Story = {
  args: {
    links: [
      { label: 'Contact me', value: '/contact' },
      { label: 'My projects', value: '/projects' },
      { label: 'Site map', value: '/sitemap' },
    ],
    contacts: ['Antananarivo, Madagascar', 'hello@example.com'],
  },
};
