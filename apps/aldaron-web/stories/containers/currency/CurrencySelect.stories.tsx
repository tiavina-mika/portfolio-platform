import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CurrencySelect from '@/containers/currency/CurrencySelect';

const meta = {
  title: 'Containers/Currency/CurrencySelect',
  component: CurrencySelect,
  tags: ['autodocs'],
} satisfies Meta<typeof CurrencySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
