import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ButtonComponent from '@/components/buttons/Button';

const meta = {
  title: 'Components/Button',
  component: ButtonComponent,
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
    variant: 'primary',
    size: 'md',
    children: 'Save',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
} satisfies Meta<typeof ButtonComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Brand: Story = {
  args: { variant: 'brand', size: 'lg', children: 'Request a quote' },
};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Outline: Story = { args: { variant: 'outline', children: 'Cancel' } };

export const Ghost: Story = { args: { variant: 'ghost', children: 'Cancel' } };

export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete' } };

export const Link: Story = { args: { variant: 'link', children: 'Read the article' } };

export const Small: Story = { args: { size: 'sm' } };

export const Loading: Story = { args: { loading: true, children: 'Saving…' } };

export const Disabled: Story = { args: { disabled: true } };

export const FullWidth: Story = { args: { fullWidth: true } };
