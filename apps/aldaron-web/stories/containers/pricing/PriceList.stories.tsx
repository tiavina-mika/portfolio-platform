import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import OptionLine from '@/containers/pricing/OptionLine';
import PriceListComponent from '@/containers/pricing/PriceList';
import QuoteLine from '@/containers/pricing/QuoteLine';

const meta = {
  title: 'Containers/Pricing/PriceList',
  component: PriceListComponent,
  tags: ['autodocs'],
  args: { children: null },
} satisfies Meta<typeof PriceListComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Quotes: Story = {
  args: {
    children: (
      <>
        <QuoteLine detail="A mockup · up to 60 web screens" price="€1,500" title="Showcase website" />
        <QuoteLine
          detail="A mockup · 60 mobile screens · 25-screen back office"
          price="€2,500"
          title="Mobile app with back office"
        />
        <QuoteLine
          detail="A mockup · 40 web screens · 60 mobile screens · online payment"
          price="€3,000"
          title="Web and mobile product with payment"
        />
      </>
    ),
  },
};

export const Options: Story = {
  args: {
    children: (
      <>
        <OptionLine
          description="€8 per screen from an idea, €6 from a specification."
          label="Mockups (if not provided)"
          price="€6 to €8 / screen"
        />
        <OptionLine
          description="For the first integration. €22 per additional integration."
          label="Online payment"
          price="€500"
        />
        <OptionLine
          description="Real-time messaging between users."
          label="Instant chat"
          price="€500"
        />
      </>
    ),
  },
};
