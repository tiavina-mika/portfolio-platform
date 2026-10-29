import { FC } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TitleComponent from '@/components/typography/Title';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Typography/Title',
  component: TitleComponent,
  parameters: {},
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // add a container for the component
  decorators: [

    (Story: FC) => (
      <div className="w-1/2">
        <Story />
      </div>
    ),
  ],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof TitleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const H1: Story = {
  args: {
    level: 1,
    children: 'This is a super long Title H1',
  },
};

export const H2: Story = {
  args: {
    level: 2,
    children: 'This is a super long Title H2',
  },
};

export const H3: Story = {
  args: {
    level: 3,
    children: 'This is a super long Title H3',
  },
};

export const H4: Story = {
  args: {
    level: 4,
    children: 'This is a super long Title H4',
  },
};

export const H5: Story = {
  args: {
    level: 5,
    children: 'This is a super long Title H5',
  },
};

export const H6: Story = {
  args: {
    level: 6,
    children: 'This is a super long for testing the Title H6',
  },
};
