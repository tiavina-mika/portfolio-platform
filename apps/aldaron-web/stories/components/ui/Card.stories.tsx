import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/buttons/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

const price = (
  <b className="font-display text-[28px] leading-none tracking-[-0.02em]">€5,000</b>
);

const heading = (
  <div>
    <CardEyebrow>Base</CardEyebrow>
    <CardTitle gutterBottom={false} level={3}>Your MVP</CardTitle>
    <CardDescription>Authentication, roles, CMS.</CardDescription>
  </div>
);

const meta = {
  title: 'Components/UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'muted', 'inverted', 'elevated'],
      control: { type: 'select' },
    },
    padding: {
      options: ['md', 'sm'],
      control: { type: 'select' },
    },
  },
  args: {
    variant: 'default',
    padding: 'md',
    isInteractive: false,
    className: 'max-w-sm',
    children: (
      <>
        <CardHeader>{heading}</CardHeader>
        <CardContent>{price}</CardContent>
        <CardFooter>
          <span className="text-sm">Included in the base</span>
        </CardFooter>
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

export const SmallPadding: Story = { args: { padding: 'sm' } };

export const WithAction: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          {heading}
          <Badge variant="brand">Included</Badge>
        </CardHeader>
        <CardContent>{price}</CardContent>
        <CardFooter>
          <Button size="sm">Request a quote</Button>
        </CardFooter>
      </>
    ),
  },
};
