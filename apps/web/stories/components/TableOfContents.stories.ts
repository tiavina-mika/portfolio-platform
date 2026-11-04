import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TableOfContentsComponent from '@/components/TableOfContents';

const meta = {
  title: 'Components/TableOfContents',
  component: TableOfContentsComponent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    label: 'Contents',
    items: [
      { id: 'toc-my-strengths', label: 'My strengths' },
      { id: 'toc-services', label: 'Services' },
      { id: 'toc-education', label: 'Education' },
      { id: 'toc-my-passions', label: 'My passions' },
    ],
  },
} satisfies Meta<typeof TableOfContentsComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TableOfContents: Story = {};

export const WithActiveItem: Story = {
  args: {
    activeId: 'toc-services',
  },
};
