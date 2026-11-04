import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { TEST_EMAIL_LOCALES } from '@/constants/_core/testEmail.constants';
import { sendCodeToSmsTest } from '@/redux/actions/_core/test.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { TestSmsInput } from '@/types/_core/testSms.type';
import { localeOptions } from '@/utils/_core/settings.utils';
import { testSmsSchema } from '@/validations/_core/testSms.validations';

const TEST_SMS_FORM_ID = 'test-sms-form';

type Props = {
  open: boolean;
  toggle: () => void;
};

const TestSmsModal = ({ open, toggle }: Props) => {
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();
  const currentLocale = useSelector(getSettingsLocaleSelector);

  const form = useForm<TestSmsInput>({
    resolver: zodResolver(testSmsSchema),
    defaultValues: {
      to: '',
      // settings.locale can briefly be '' before it's hydrated — fall back to the first BO locale
      locale: (currentLocale || TEST_EMAIL_LOCALES[0]),
    },
  });

  const handleSubmit = (values: TestSmsInput) => dispatch(sendCodeToSmsTest(values));

  return (
    <Dialog
      withCloseButton
      formId={TEST_SMS_FORM_ID}
      maxWidth="sm"
      open={open}
      primaryButtonText={t('misc.sendTestSms')}
      title={t('misc.testSmsModalTitle')}
      toggle={toggle}
    >
      <Form form={form} formId={TEST_SMS_FORM_ID} onSubmit={handleSubmit}>
        <TextField
          required
          label={t('misc.testSmsRecipient')}
          name="to"
          type="text"
        />
        <SelectField label={t('misc.testSmsLocale')} name="locale" options={localeOptions} />
      </Form>
    </Dialog>
  );
};

export default TestSmsModal;
