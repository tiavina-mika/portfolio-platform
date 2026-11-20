import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Price from '@/containers/currency/Price';

const meta = {
  title: 'Containers/Currency/Price',
  component: Price,
  tags: ['autodocs'],
  args: { text: 'From €1,500, or 18 to €30 per screen' },
} satisfies Meta<typeof Price>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InText: Story = {};

export const Amount: Story = { args: { text: undefined, amount: 2500 } };
