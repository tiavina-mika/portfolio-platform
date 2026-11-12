import TranslationClientProvider from '@/components/TranslationClientProvider';

import ContactForm, { ContactFormProps } from './ContactForm';

const ContactFormProvider = ({ ...props }: ContactFormProps) => {
  return (
    <TranslationClientProvider rootKeys={['Form', 'Contact', 'Common']}>
      <ContactForm {...props} />
    </TranslationClientProvider>
  );
};

export default ContactFormProvider;
