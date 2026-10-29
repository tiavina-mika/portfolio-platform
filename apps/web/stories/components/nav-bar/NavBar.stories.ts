import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NavBarComponent from '@/components/nav-bar/NavBar';

const meta = {
  title: 'Components/NavBar',
  component: NavBarComponent,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'xl', isRotated: false },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavBarComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NavBar: Story = {
  args: {
    menus: [
      { label: 'Home', value: '/' },
      { label: 'Projects', value: '/projects' },
      { label: 'Blog', value: '/blog' },
      { label: 'Contact', value: '/contact' },
    ],
    locale: 'en',
  },
};
