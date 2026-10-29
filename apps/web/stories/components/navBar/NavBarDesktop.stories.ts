import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NavBarComponent from '@/components/navBar/NavBarDesktop';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'App/NavBar/Desktop',
  component: NavBarComponent,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'xl', isRotated: false },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof NavBarComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const NavBarDesktop: Story = {
  args: {
    // menus for test
    menus: [
      {
        label: 'Home',
        value: '/',
      },
      {
        label: 'About',
        value: '/',
      },
      {
        label: 'Contact',
        value: '/contact',
      },
    ],
    locale: 'fr',
    isHome: true,
    buttonText: 'Download CV',
    searchPlaceholder: 'Search...',
    noResultMessage: 'No results found',
  },
};
