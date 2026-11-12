/* eslint-disable @cspell/spellchecker */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TextComponent from '@/components/typography/Text';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Typography/Text',
  component: TextComponent,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullScreen',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    color: {
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'default'],
      control: { type: 'select' },
    },
    size: {
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: { type: 'select' },
    },
    as: {
      options: ['p', 'span', 'div', 'label'],
      control: { type: 'select' },
    },
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof TextComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Paragraph: Story = {
  args: {
    as: 'p',
    color: 'default',
    size: 'md',
    children: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,
    molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum
    numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium
    optio, eaque rerum! Provident similique accusantium nemo autem`,
  },
};

export const Text: Story = {
  args: {
    as: 'span',
    color: 'default',
    size: 'md',
    children: 'Lorem ipsum',
  },
};
