/**
 * NotFound may be translated (app/[locale]/not-found.tsx)
 * or not translated (outside app, ex: app/some-page/page.tsx)
 */
import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import TextLink from '@/components/typography/TextLink';
import Title from '@/components/typography/Title';
import { ROUTES } from '@/i18n/routes';

type Props = {
  /**
   * The error mention above the title, a plain text (the title is the h1)
   * @example 'Error 404'
   */
  code: string;
  /**
   * @example 'Page not found'
   */
  title: string;
  /**
   * @example 'The page you are looking for does not exist or has been moved.'
   */
  description: string;
  /**
   * Label of the button that leads to the home page
   */
  homeText: string;
  /**
   * Label of the link that leads to the contact page
   */
  contactText: string;
  /**
   * Label of the link that leads to the blog
   */
  blogText: string;
};

/**
 * A page that does not exist: the error mention, the title (the only h1 of the page), the
 * explanation, then three ways out: home, contact and blog
 */
const NotFound = ({
  code, title, description, homeText, contactText, blogText,
}: Props) => (
  <Section
    as="section"
    className={'flex min-h-[500px] flex-col items-center justify-center gap-8 py-12 text-center'}
  >
    <div className="flex flex-col items-center gap-4">
      <span className="text-lg font-semibold text-primary-dark">{code}</span>
      <Title className="text-[120px]! font-semibold">404</Title>
      <div className="flex flex-col items-center gap-2">
        <Title className="text-3xl! font-semibold" level={2}>{title}</Title>
        <Text className="text-center">{description}</Text>
      </div>
    </div>

    <div className="flex flex-col items-center justify-center gap-6">
      <TextLink href={ROUTES.home} variant="button">
        {homeText}
      </TextLink>
      <TextLink href={ROUTES.contact} variant="text">
        {contactText}
      </TextLink>
      <TextLink href={ROUTES.articles.root} variant="text">
        {blogText}
      </TextLink>
    </div>
  </Section>
);

export default NotFound;
