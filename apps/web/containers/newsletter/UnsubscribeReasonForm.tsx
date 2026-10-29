'use client';

import { useTranslations } from 'next-intl';

import RadioGroupField from '@/components/forms/fields/RadioGroupField';
import Form from '@/components/forms/Form';
import { useServerAction } from '@/hooks/useServerAction';
import { Locale } from '@/i18n/config';
import { addReasonToUnsubscribeToTheNewsletter } from '@/server/mutations/newsletter.mutation';
import { ISelectOption, IUnsubscribeReasonSchemaInput } from '@/types/app.type';
import { UnsubscribeReasonSchema } from '@/validations/app.validations';

type Props = {
  options: ISelectOption[];
  encryptedEmail: string;
  locale: Locale;
};
const UnsubscribeReasonForm = ({ options, encryptedEmail, locale }: Props) => {
  const tForm = useTranslations('Form');
  const t = useTranslations('Newsletter');

  const {
    form, onSubmit, sentSuccessMessage, error, loading,
  } = useServerAction<
    IUnsubscribeReasonSchemaInput,
      typeof UnsubscribeReasonSchema,
      typeof addReasonToUnsubscribeToTheNewsletter,
      Locale[]
  >({
    schema: UnsubscribeReasonSchema,
    action: addReasonToUnsubscribeToTheNewsletter,
    sentMessage: t('reasonSubmittedSuccessfully'),
    translationKey: 'Newsletter',
    bind: [locale],
  });

  return (
    <div className="flex flex-col gap-3">
      <Form
        action={onSubmit}
        buttonFullWidth={false}
        error={error}
        form={form}
        loading={loading}
        primaryButtonText={tForm('submit')}
        successMessage={sentSuccessMessage}
      >
        {/* hidden input */}
        <input name="encryptedEmail" type="hidden" value={encryptedEmail} />
        <RadioGroupField
          label={t('tellUsWhy')}
          labelClassName="font-bold text-lg"
          name="reason"
          options={options}
        />
      </Form>
    </div>
  );
};

export default UnsubscribeReasonForm;
