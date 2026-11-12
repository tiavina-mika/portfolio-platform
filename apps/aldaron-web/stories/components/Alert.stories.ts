import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AlertComponent from '@/components/Alert';

const meta = {
  title: 'Components/Alert',
  component: AlertComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['neutral', 'info', 'success', 'warning', 'destructive'],
      control: { type: 'select' },
    },
  },
  args: {
    variant: 'neutral',
    title: 'Invitation sent',
    children: 'The new user receives an email with a link to set a password.',
  },
} satisfies Meta<typeof AlertComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Info: Story = { args: { variant: 'info' } };

export const Success: Story = { args: { variant: 'success' } };

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Scheduled maintenance',
    children: 'The site will be unavailable for a few minutes tonight.',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'The message could not be sent',
    children: 'Check your connection, then send it again.',
  },
};

export const MessageOnly: Story = { args: { title: undefined } };
