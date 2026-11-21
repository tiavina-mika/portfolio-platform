import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { fn } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContactFormContent, {
  ContactFormContentProps,
} from '@/containers/contact/ContactFormContent';
import { IQuoteRequestInput } from '@/types/contact.type';
import { createQuoteRequestSchema } from '@/validations/contact.validation';

const schema = createQuoteRequestSchema({
  name: 'Enter your name.',
  email: 'Enter a valid email address.',
  product: 'Describe your product in one or two sentences.',
  supports: 'Choose at least one platform.',
  consent: 'Accept to send your request.',
});

const EMPTY_VALUES: IQuoteRequestInput = {
  name: '',
  email: '',
  product: '',
  supports: { web: false, app: false, mobile: false, bo: false },
  bring: '',
  needs: '',
  estimate: '',
  consent: false,
};

type DemoProps = Omit<ContactFormContentProps, 'form'> & {
  values?: Partial<IQuoteRequestInput>;
  /**
   * Validates the empty form at once, to show the errors
   */
  showErrors?: boolean;
};

// the form is created here: the container itself only receives it
const ContactFormContentDemo = ({ values, showErrors, ...props }: DemoProps) => {
  const form = useForm<IQuoteRequestInput>({
    resolver: zodResolver(schema) as any,
    defaultValues: { ...EMPTY_VALUES, ...values },
  });

  useEffect(() => {
    if (showErrors) void form.trigger();
  }, [form, showErrors]);

  return <ContactFormContent {...props} form={form} />;
};

const meta = {
  title: 'Containers/Contact/ContactFormContent',
  component: ContactFormContentDemo,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    action: fn(),
  },
} satisfies Meta<typeof ContactFormContentDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithErrors: Story = { args: { showErrors: true } };

export const WithSimulatorEstimate: Story = {
  args: {
    hasEstimate: true,
    values: {
      supports: { web: false, app: true, mobile: false, bo: true },
      bring: 'mockup',
      estimate: 'Web app: 12 screens\nBack office: 6 screens\nTotal: from €3,500',
    },
  },
};

const FILLED_VALUES: Partial<IQuoteRequestInput> = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  product: 'A booking app for medical practices.',
  supports: { web: false, app: true, mobile: false, bo: false },
  consent: true,
};

export const Sending: Story = { args: { isLoading: true, values: FILLED_VALUES } };

export const Sent: Story = { args: { isSent: true, values: FILLED_VALUES } };

export const Failed: Story = {
  args: { error: 'Try again in a moment, or write to us.', values: FILLED_VALUES },
};

export const Offline: Story = { args: { isOffline: true } };
