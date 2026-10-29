/**
 * This component is the presentational part of the footer: all its data comes through props or
 * slots, so it can be used as a story (the Footer itself is async and fetches the CMS links).
 */
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

import { ISelectOption } from '@/types/app.type';

import Section from '../layouts/Section';
import LogoSVG from '../LogoSVG';
import FooterBottom from './FooterBottom';
import FooterLink from './FooterLink';
import FooterTitle from './FooterTitle';
import Socials from './Socials';
import Text from '../typography/Text';

type Props = {
  /**
   * The links that always show, before the ones loaded from the CMS
   */
  links: ISelectOption[];
  /**
   * Under the logo, a quote that loads on its own
   */
  quote?: ReactNode;
  /**
   * More links, e.g. the ones that load on their own
   */
  dynamicLinks?: ReactNode;
  /**
   * The contact lines of the right column
   */
  contacts: string[];
};

const DIVIDER_CLASS_NAME = `
  h-1 self-stretch border-t border-t-dark-300
  dark:border-neutral-700
`;

const FooterContainer = ({
  links, quote, dynamicLinks, contacts,
}: Props) => {
  const t = useTranslations('Footer');

  return (
    <footer className="flex flex-col self-stretch p-0">
      <Section className="flex flex-col self-stretch">
        <div className={DIVIDER_CLASS_NAME} />
        {/* ------------- top row ------------- */}
        <div className={`
          flex flex-col gap-8 self-stretch py-8
          md:flex-row md:gap-0
        `}
        >
          {/* ------------- left ------------- */}
          <div className={`
            flex flex-[1.8] flex-col gap-[13px] px-0
            lg:pl-3
          `}
          >
            <LogoSVG className="w-[50px]" />
            <div className="flex flex-col gap-6">
              {quote}
              <Socials />
            </div>
          </div>

          {/* ------------- center ------------- */}
          <div className="flex flex-1 flex-col gap-[13px]">
            <FooterTitle text={t('moreInfo')} />
            <div className={`
              flex flex-col gap-2
              md:gap-3
            `}
            >
              {links.map(link => (
                <FooterLink href={link.value || '/'} key={link.value}>
                  {link.label}
                </FooterLink>
              ))}
              {dynamicLinks}
            </div>
          </div>

          {/* ------------- right ------------- */}
          <div className="flex flex-1 flex-col gap-[13px]">
            <FooterTitle text={t('contact')} />
            <div className={`
              flex flex-col gap-2
              md:gap-3
            `}
            >
              {contacts.map(contact => (
                <Text className="text-base" key={contact}>
                  {contact}
                </Text>
              ))}
            </div>
          </div>
        </div>
        <div className={DIVIDER_CLASS_NAME} />
        <FooterBottom />
      </Section>
    </footer>
  );
};

export default FooterContainer;
