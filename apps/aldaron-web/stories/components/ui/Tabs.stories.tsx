import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/Tabs';

type StoryProps = {
  variant: 'underline' | 'pill';
};

const TabsDemo = ({ variant }: StoryProps) => (
  <Tabs defaultValue="base">
    <TabsList aria-label="Offer" variant={variant}>
      <TabsTrigger value="base">Base</TabsTrigger>
      <TabsTrigger value="options">Options</TabsTrigger>
      <TabsTrigger disabled value="mobile">Mobile</TabsTrigger>
    </TabsList>
    <TabsContent value="base">Authentication, roles, CMS and back-office.</TabsContent>
    <TabsContent value="options">Extra screens and integrations.</TabsContent>
    <TabsContent value="mobile">The mobile application.</TabsContent>
  </Tabs>
);

const meta = {
  title: 'Components/UI/Tabs',
  component: TabsDemo,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['underline', 'pill'],
      control: { type: 'select' },
    },
  },
  args: { variant: 'underline' },
} satisfies Meta<typeof TabsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Underline: Story = {};

export const Pill: Story = { args: { variant: 'pill' } };
