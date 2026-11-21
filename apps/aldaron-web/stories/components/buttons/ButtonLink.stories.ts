import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ButtonLinkComponent from '@/components/buttons/ButtonLink';

const meta = {
  title: 'Components/ButtonLink',
  component: ButtonLinkComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['primary', 'brand', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
      control: { type: 'select' },
    },
    size: {
      options: ['sm', 'md', 'lg', 'icon'],
      control: { type: 'select' },
    },
  },
  args: {
    href: '/contact',
    variant: 'brand',
    size: 'lg',
    children: 'Request a firm quote',
    fullWidth: false,
  },
} satisfies Meta<typeof ButtonLinkComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {};

export const Outline: Story = { args: { variant: 'outline', children: 'See the offer and pricing' } };

export const External: Story = {
  args: { href: 'https://www.linkedin.com/', isExternal: true, variant: 'outline', children: 'LinkedIn' },
};
