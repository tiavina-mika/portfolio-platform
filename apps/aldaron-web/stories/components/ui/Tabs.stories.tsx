import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Tabs, TabsContent, TabsCount, TabsList, TabsTrigger,
} from '@/components/ui/Tabs';

type StoryProps = {
  variant: 'underline' | 'pill';
  hasCounts: boolean;
  isLastDisabled: boolean;
};

const TabsDemo = ({ variant, hasCounts, isLastDisabled }: StoryProps) => (
  <Tabs className="w-130" defaultValue="all">
    <TabsList aria-label="Articles" variant={variant}>
      <TabsTrigger value="all">
        All
        {hasCounts && <TabsCount>24</TabsCount>}
      </TabsTrigger>
      <TabsTrigger value="published">
        Published
        {hasCounts && <TabsCount>18</TabsCount>}
      </TabsTrigger>
      <TabsTrigger disabled={isLastDisabled} value="drafts">
        Drafts
        {hasCounts && <TabsCount>6</TabsCount>}
      </TabsTrigger>
    </TabsList>
    <TabsContent value="all">24 articles, all statuses.</TabsContent>
    <TabsContent value="published">18 published articles.</TabsContent>
    <TabsContent value="drafts">6 drafts pending.</TabsContent>
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
  args: { variant: 'underline', hasCounts: true, isLastDisabled: false },
} satisfies Meta<typeof TabsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Underline: Story = {};

export const Pill: Story = { args: { variant: 'pill' } };

export const WithoutCounts: Story = { args: { hasCounts: false } };

export const DisabledTab: Story = { args: { isLastDisabled: true } };
