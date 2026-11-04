import ContactFormProvider from '@/containers/contact/ContactFormProvider';
import ContactFormSection from '@/containers/contact/ContactFormSection';
import ContactSocialLinks from '@/containers/contact/ContactSocialLinks';
import { Locale } from '@/i18n/config';

type Props = {
  /**
   * Language of the page
   * @example 'en'
   * @required
   */
  locale: Locale;
};

/**
 * The contact page layout: the intro and the social networks beside the form
 */
const ContactUs = ({ locale }: Props) => (
  <div className="flex flex-col self-stretch">
    <ContactFormSection socials={<ContactSocialLinks />}>
      <ContactFormProvider locale={locale} />
    </ContactFormSection>
  </div>
);

export default ContactUs;
