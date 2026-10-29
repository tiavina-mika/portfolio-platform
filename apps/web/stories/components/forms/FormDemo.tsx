import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import TextField from '@/components/forms/fields/TextField';
import Form from '@/components/forms/Form';


export const DemoSchema = z.object({
  title: z
    .string()
    .max(75),
});

export type DemoInput = z.infer<typeof DemoSchema>;

type Props = {
  withPlaceholder?: boolean;
  withDescription?: boolean;
  withError?: boolean;
};
const FormDemo = ({ withPlaceholder, withDescription, withError }: Props) => {
  const tDemo = useTranslations('Article');

  const form = useForm<DemoInput>({
    resolver: zodResolver(DemoSchema),
  });

  const { handleSubmit } = form;

  const onSubmitHandler: SubmitHandler<DemoInput> = (values) => {
    console.log('values: ', values);
  };

  return (
    <Form form={form} onSubmit={handleSubmit(onSubmitHandler)}>
      <TextField
        required
        description={withDescription ? 'Description' : ''}
        error={withError}
        label={tDemo('title')}
        name="title"
        placeholder={withPlaceholder ? 'title' : ''}
      />
    </Form>
  );
};

export default FormDemo;
