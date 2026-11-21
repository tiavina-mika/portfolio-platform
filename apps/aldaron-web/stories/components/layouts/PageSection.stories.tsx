import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PageSectionComponent from '@/components/layouts/PageSection';
import SectionIntro from '@/components/layouts/SectionIntro';

const meta = {
  title: 'Components/PageSection',
  component: PageSectionComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    hasDivider: true,
    children: (
      <SectionIntro
        description="A distinct view counts as one screen."
        eyebrow="Process"
        title="Four steps, three payments."
      />
    ),
  },
} satisfies Meta<typeof PageSectionComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PageSection: Story = {};

export const WithoutDivider: Story = { args: { hasDivider: false } };
