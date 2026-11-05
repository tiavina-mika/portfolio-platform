import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

const ROWS = [
  {
    name: 'Home page', status: 'Published', variant: 'success', views: '1 204',
  },
  {
    name: 'Pricing', status: 'Draft', variant: 'default', views: '0',
  },
] as const;

const meta = {
  title: 'Components/UI/Table',
  component: Table,
  tags: ['autodocs'],
  render: args => (
    <Table {...args}>
      <TableCaption>Pages of the site</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead isNumeric>Views</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map(row => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell>
              <Badge hasDot variant={row.variant}>{row.status}</Badge>
            </TableCell>
            <TableCell isNumeric>{row.views}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
