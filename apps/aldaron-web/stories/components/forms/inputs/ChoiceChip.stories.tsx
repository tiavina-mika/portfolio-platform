import { fn } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ChoiceChipComponent from '@/components/forms/inputs/ChoiceChip';

const meta = {
  title: 'Components/Forms/ChoiceChip',
  component: ChoiceChipComponent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    type: { options: ['checkbox', 'radio'], control: { type: 'select' } },
  },
  args: {
    type: 'checkbox',
    label: 'Web app',
    checked: false,
    disabled: false,
    onChange: fn(),
  },
} satisfies Meta<typeof ChoiceChipComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Checkbox: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Radio: Story = { args: { type: 'radio', label: 'A specification' } };

export const Disabled: Story = { args: { disabled: true } };
