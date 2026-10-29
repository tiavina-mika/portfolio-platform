/**
 * NotFound may be translated (app/[locale]/not-found.tsx)
 * or not translated (outside app, ex: app/some-page/page.tsx)
 */
import { primaryFont } from '@/components/fonts';
import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import TextLink from '@/components/typography/TextLink';
import Title from '@/components/typography/Title';
import { ROUTES } from '@/i18n/routes';

type Props = {
  title: string;
  description: string;
  linkText: string;
  secondaryLinkText: string;
};
const NotFound = ({
  title,
  description,
  linkText,
  secondaryLinkText,
}: Props) => {
  return (
    <html lang="en">
      <body className={`
        ${primaryFont}
        antialiased
        dark:bg-neutral-900
      `}
      >
        <Section className={`
          flex min-h-screen flex-col items-center
          sm:justify-center
        `}
        >
          <div className={`
            flex min-h-[500px] flex-col items-center
            sm:min-w-[500px]
          `}
          >
            {/* top (text) */}
            <div className="flex flex-col items-center gap-8">
              <Title className="text-[120px]! font-semibold">404</Title>
              <div className="flex flex-col items-center gap-2">
                <Title className="text-3xl! font-semibold">{title}</Title>
                <Text className="space-y-6 text-center">{description}</Text>
              </div>
            </div>

            {/* links */}
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              <TextLink href="/" variant="button">
                {linkText}
              </TextLink>
              <TextLink href={ROUTES.contact} variant="text">
                {secondaryLinkText}
              </TextLink>
            </div>
          </div>
        </Section>
      </body>
    </html>
  );
};

export default NotFound;
