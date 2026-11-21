import { expect, userEvent, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import OptionCardComponent from '@/components/forms/OptionCard';

const meta = {
  title: 'Components/Forms/OptionCard',
  component: OptionCardComponent,
  tags: ['autodocs'],
  args: {
    label: 'A requirements document',
    hint: 'A document describing the product',
    type: 'checkbox',
  },
  argTypes: {
    type: { options: ['radio', 'checkbox'], control: { type: 'select' } },
  },
} satisfies Meta<typeof OptionCardComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Checkbox: Story = {
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  },
};

export const Radio: Story = { args: { type: 'radio', name: 'bring' } };

export const WithoutHint: Story = { args: { hint: undefined, label: 'Mobile' } };

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };
