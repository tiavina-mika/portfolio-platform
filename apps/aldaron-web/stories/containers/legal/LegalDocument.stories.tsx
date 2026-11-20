import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LegalDocumentComponent from '@/containers/legal/LegalDocument';

const meta = {
  title: 'Containers/Legal/LegalDocument',
  component: LegalDocumentComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    label: 'Legal',
    title: 'Legal notice',
    updated: 'Last updated: 20 November 2026',
    sections: [
      {
        title: 'Site publisher',
        lines: [
          'The site is published by Aldaron, a web and mobile development company for startups.',
          'Contact: contact@aldaron.eu',
        ],
      },
      {
        title: 'Hosting',
        lines: ['Site host: to be completed'],
      },
      {
        title: 'Estimates and quotes',
        lines: [
          'Estimates from the price simulator are indicative. Only a firm quote binds Aldaron.',
        ],
      },
    ],
  },
} satisfies Meta<typeof LegalDocumentComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LegalDocument: Story = {};
