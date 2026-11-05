import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input as InputComponent } from '@/components/ui/Input';

const meta = {
  title: 'Components/Forms',
  component: InputComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      options: ['md', 'sm'],
      control: { type: 'select' },
    },
  },
} satisfies Meta<typeof InputComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter your name',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Search',
  },
};

export const WithUnit: Story = {
  args: {
    placeholder: '5000',
    trailing: '€',
  },
};

export const Invalid: Story = {
  args: {
    error: true,
    placeholder: '5000',
    trailing: '€',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Enter your name',
  },
};
