import { FC } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FormDemoComponent from './FormDemo';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Forms',
  component: FormDemoComponent,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  decorators: [

    (Story: FC) => {
      return (
        <div className="flex min-h-screen items-center">
          <div className="w-[480px]">
            <Story />
          </div>
        </div>
      );
    },
  ],
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof FormDemoComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const FormDemo: Story = {
  args: {},
};
