import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LinkComponent from '@/components/typography/TextLink';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Typography/Link',
  component: LinkComponent,
  parameters: {},
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof LinkComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Link: Story = {
  args: {
    isExternal: false,
    children: 'Click here',
    href: '/',
  },
};
