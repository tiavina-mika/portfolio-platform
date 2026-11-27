import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NavBarComponent from '@/components/nav-bar/NavBar';
import CurrencySelect from '@/containers/currency/CurrencySelect';

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
    currencySelect: <CurrencySelect />,
    menus: [
      { id: 'pricing', label: 'Offer and pricing', value: '/pricing' },
      { id: 'simulator', label: 'Simulator', value: '/simulator' },
      { id: 'projects', label: 'Projects', value: '/projects' },
      { id: 'about', label: 'About', value: '/about' },
      { id: 'contact', label: 'Contact', value: '/contact' },
    ],
  },
};

export const Mobile: Story = {
  ...NavBar,
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
};
