import { FC } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PageTitleComponent from '@/components/typography/PageTitle';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Typography/PageTitle',
  component: PageTitleComponent,
  parameters: {},
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // add a container for the component
  decorators: [
    // eslint-disable-next-line @typescript-eslint/naming-convention
    (Story: FC) => (
      <div className="md:w-1/3">
        <Story />
      </div>
    ),
  ],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof PageTitleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const PageTitle: Story = {
  args: {
    children: 'This is a super very very super extremely long Page Title to test responsiveness and line weights',
  },
};
