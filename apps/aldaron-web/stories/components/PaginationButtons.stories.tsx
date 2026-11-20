import { useState } from 'react';
import { fn } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PaginationButtonsComponent from '@/components/PaginationButtons';

const meta = {
  title: 'Components/PaginationButtons',
  component: PaginationButtonsComponent,
  tags: ['autodocs'],
  args: {
    page: 1,
    pageCount: 3,
    onChange: fn(),
    labels: { nav: 'Pagination', previous: 'Previous', next: 'Next', page: 'Page' },
  },
} satisfies Meta<typeof PaginationButtonsComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManyPages: Story = { args: { page: 6, pageCount: 12 } };

export const Interactive: Story = {
  render: (args) => {
    const [page, setPage] = useState(2);

    return (
      <PaginationButtonsComponent
        {...args}
        onChange={setPage}
        page={page}
        pageCount={5}
      />
    );
  },
};
