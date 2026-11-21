import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CtaBandComponent from '@/components/layouts/CtaBand';

const meta = {
  title: 'Components/CtaBand',
  component: CtaBandComponent,
  tags: ['autodocs'],
  args: {
    variant: 'card',
    layout: 'row',
    title: 'Let\'s talk about your product.',
    description: 'Scoping is free. We come back to you with a firm quote.',
    cta: { label: 'Request a firm quote', href: '/contact' },
  },
} satisfies Meta<typeof CtaBandComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {};

export const Inverted: Story = {
  args: {
    variant: 'inverted',
    layout: 'stacked',
    eyebrow: 'Price simulator',
    title: 'Estimate the price of your product',
    cta: { label: 'Open the simulator', href: '/simulator' },
  },
};

export const Stacked: Story = { args: { layout: 'stacked' } };
