import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Checkbox } from '@/components/ui/Checkbox';

const meta = {
  title: 'Components/UI/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    id: 'terms',
    label: 'Mobile application',
    description: 'Option: from €3,000',
    disabled: false,
    invalid: false,
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const LabelOnly: Story = { args: { description: undefined } };

export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = { args: { disabled: true } };

export const BoxOnly: Story = {
  args: { label: undefined, description: undefined, 'aria-label': 'Accept' },
};

const SelectAllDemo = () => {
  const [items, setItems] = useState({ app: true, site: false });
  const checkedCount = Object.values(items).filter(Boolean).length;
  let allChecked: boolean | 'indeterminate' = 'indeterminate';

  if (checkedCount === 0) allChecked = false;
  if (checkedCount === 2) allChecked = true;

  return (
    <div className="grid w-100 gap-2.5">
      <Checkbox
        checked={allChecked}
        label="Select all"
        onCheckedChange={checked => setItems({ app: checked === true, site: checked === true })}
      />
      <Checkbox
        checked={items.app}
        description="Option: from €3,000"
        label="Mobile application"
        onCheckedChange={checked => setItems(current => ({ ...current, app: checked === true }))}
      />
      <Checkbox
        checked={items.site}
        description="Home, offer, contact"
        label="Public site"
        onCheckedChange={checked => setItems(current => ({ ...current, site: checked === true }))}
      />
    </div>
  );
};

export const SelectAll: Story = { render: () => <SelectAllDemo /> };
