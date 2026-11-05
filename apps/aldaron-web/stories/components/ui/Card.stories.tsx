import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

const meta = {
  title: 'Components/UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'muted', 'inverted', 'elevated'],
      control: { type: 'select' },
    },
  },
  args: {
    variant: 'default',
    isInteractive: false,
    className: 'max-w-sm',
    children: (
      <>
        <CardHeader>
          <CardEyebrow>Base</CardEyebrow>
        </CardHeader>
        <CardContent>
          <CardTitle gutterBottom={false} level={3}>Authentication and roles</CardTitle>
          <CardDescription>Sign in, invitations and rights per screen are already in place.</CardDescription>
        </CardContent>
      </>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Muted: Story = { args: { variant: 'muted' } };

export const Inverted: Story = { args: { variant: 'inverted' } };

export const Elevated: Story = { args: { variant: 'elevated' } };

export const Interactive: Story = { args: { isInteractive: true } };
