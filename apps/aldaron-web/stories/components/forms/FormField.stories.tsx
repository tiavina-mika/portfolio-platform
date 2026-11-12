import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FormField from '@/components/forms/FormField';
import SelectComponent from '@/components/forms/inputs/Select';
import { Input } from '@/components/ui/Input';

const roles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

const meta = {
  title: 'Components/Forms/FormField',
  component: FormField,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    label: 'Project budget',
    htmlFor: 'budget',
    description: 'The base starts at €5,000.',
    required: false,
    optional: false,
    children: <Input id="budget" placeholder="5000" trailing="€" />,
  },
  decorators: [
    Story => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDescription: Story = {};

export const WithError: Story = {
  args: {
    error: 'Enter an amount of at least €5,000.',
    children: (
      <Input
        error
        id="budget"
        placeholder="5000"
        trailing="€"
      />
    ),
  },
};

export const Required: Story = { args: { required: true } };

export const Optional: Story = { args: { optional: true } };

export const WithSelect: Story = {
  args: {
    label: 'Role',
    htmlFor: 'role',
    description: 'Permissions are set in Roles and permissions.',
    children: (
      <SelectComponent
        fullWidth
        id="role"
        options={roles}
        placeholder="Choose a role"
        value="editor"
      />
    ),
  },
};

export const SelectWithError: Story = {
  args: {
    label: 'Role',
    htmlFor: 'role',
    error: 'Choose a role.',
    children: (
      <SelectComponent
        error
        fullWidth
        id="role"
        options={roles}
        placeholder="Choose a role"
      />
    ),
  },
};
