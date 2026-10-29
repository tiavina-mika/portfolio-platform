import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { TEST_EMAIL_LOCALES, TEST_EMAIL_TEMPLATES } from '@/constants/_core/testEmail.constants';
import { sendCodeToEmailTest } from '@/redux/actions/_core/test.action';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { fetchTestEmailSenders } from '@/services/_core/test.service';
import { ISelectOption } from '@/types/_core/app.type';
import { TestEmailInput } from '@/types/_core/testEmail.type';
import { localeOptions } from '@/utils/_core/settings.utils';
import { testEmailSchema } from '@/validations/_core/testEmail.validations';

const TEST_EMAIL_FORM_ID = 'test-email-form';

/* translation keys reused from the existing misc.* buttons — one label per selectable template */
const TEMPLATE_LABEL_KEYS: Record<typeof TEST_EMAIL_TEMPLATES[number], string> = {
  sendVerificationCodeTest: 'misc.sendEmailVerification',
  sendResetPasswordVerificationCodeTest: 'misc.sendResetPassword',
  sendArticleToNewsletterTest: 'misc.sendArticleToNewsletter',
  sendInvitationTest: 'misc.sendInvitationEmail',
  sendWelcomeEmailTest: 'misc.sendWelcomeEmail',
};

type Props = {
  open: boolean;
  toggle: () => void;
};

const TestEmailsModal = ({ open, toggle }: Props) => {
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();
  const currentUser = useSelector(getAppCurrentUserSelector);
  const currentLocale = useSelector(getSettingsLocaleSelector);
  const [senderOptions, setSenderOptions] = useState<ISelectOption[]>([]);

  const form = useForm<TestEmailInput>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      template: TEST_EMAIL_TEMPLATES[0],
      to: currentUser?.email ?? '',
      firstName: currentUser?.firstName ?? '',
      // settings.locale can briefly be '' before it's hydrated — fall back to the first BO locale
      locale: (currentLocale || TEST_EMAIL_LOCALES[0]),
    },
  });

  useEffect(() => {
    /*
     * reload every time the modal opens — reflects the server's current closed sender list
     * (ALLOWED_TEST_EMAIL_SENDERS) instead of duplicating it in a BO constant that could drift
     * out of sync with what's actually verified in Brevo
     */
    if (!open) return;

    const loadSenders = async () => {
      const senders = await fetchTestEmailSenders();

      setSenderOptions(senders.map((sender): ISelectOption => ({ value: sender, label: sender })));
      if (senders[0]) form.setValue('sender', senders[0]);
    };

    loadSenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const templateOptions: ISelectOption[] = useMemo(() => TEST_EMAIL_TEMPLATES.map(
    (template): ISelectOption => ({ value: template, label: t(TEMPLATE_LABEL_KEYS[template]) })
  ), [t]);

  const handleSubmit = (values: TestEmailInput) => dispatch(sendCodeToEmailTest(values));

  return (
    <Dialog
      withCloseButton
      formId={TEST_EMAIL_FORM_ID}
      maxWidth="sm"
      open={open}
      primaryButtonText={t('misc.sendTestEmail')}
      title={t('misc.testEmailsModalTitle')}
      toggle={toggle}
    >
      <Form form={form} formId={TEST_EMAIL_FORM_ID} onSubmit={handleSubmit}>
        <SelectField label={t('misc.testEmailTemplate')} name="template" options={templateOptions} />
        <TextField
          required
          label={t('misc.testEmailRecipient')}
          name="to"
          type="email"
        />
        <TextField label={t('misc.testEmailFirstName')} name="firstName" type="text" />
        <SelectField label={t('misc.testEmailSender')} name="sender" options={senderOptions} />
        <SelectField label={t('misc.testEmailLocale')} name="locale" options={localeOptions} />
      </Form>
    </Dialog>
  );
};

export default TestEmailsModal;
