import { useTranslations } from 'next-intl';

import { ROUTES } from '@/i18n/routes';
import { EMAIL } from '@/utils/constants';

import LanguageButtons from '../languages/LanguageButtons';
import Section from '../layouts/Section';
import Logo from '../Logo';
import Socials from './Socials';
import TextLink from '../typography/TextLink';

type FooterMenu = { id: string; label: string; value: string };

type Props = {
  /**
   * The pages of the site, the same links as the navigation bar
   */
  menus: FooterMenu[];
};

/*
 * read once at module load (build/deploy time), not per-render — `cacheComponents` treats
 * `new Date()` read during render as an unstable blocking value, and a copyright year only
 * needs to be correct as of the last deploy, not per-request
 */
const currentYear = new Date().getFullYear();

const FOOTER_LINK_CLASS_NAME = `
  inline-flex min-h-11 items-center text-[15px] text-muted-foreground transition-colors duration-120
  hover:text-foreground
  md:text-[15px]
  motion-reduce:transition-none
`;

const LEGAL_LINK_CLASS_NAME = `
  inline-flex min-h-11 items-center label-mono text-xs font-medium text-muted-foreground transition-colors
  duration-120
  hover:text-foreground
  md:text-xs
  motion-reduce:transition-none
`;

/**
 * The footer: the brand and its networks, the pages, the contact, then the legal links and the language.
 * It sits under the page h1, so its columns are titled with h2.
 */
const Footer = ({ menus }: Props) => {
  const t = useTranslations('Footer');

  return (
    <footer className={`
      mt-10 flex flex-col self-stretch
      md:mt-16
    `}
    >
      <Section className="flex-col">
        {/* the line sits inside the margins of the page, like the one of the navigation bar */}
        <div className="flex flex-col gap-10 border-t border-border py-12">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-8 gap-y-10">
            {/* ------------- brand ------------- */}
            <div className="flex max-w-[34ch] flex-col content-start gap-4">
              <Logo className="h-7 self-start" />
              <p className="m-0 text-[15px] leading-normal text-pretty text-muted-foreground">
                {t('tagline')}
              </p>
              <Socials className="-ml-2.5" />
            </div>

            {/* ------------- pages ------------- */}
            <nav aria-labelledby="footer-navigation">
              <h2 className="mb-3 label-mono text-brand-text" id="footer-navigation">{t('navigation')}</h2>
              <ul className="m-0 grid list-none gap-0.5 p-0">
                {menus.map(menu => (
                  <li key={menu.id}>
                    <TextLink className={FOOTER_LINK_CLASS_NAME} href={menu.value} underline={false}>
                      {menu.label}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ------------- contact ------------- */}
            <div>
              <h2 className="mb-3 label-mono text-brand-text">{t('contact')}</h2>
              <ul className="m-0 grid list-none gap-0.5 p-0">
                <li>
                  <a className={FOOTER_LINK_CLASS_NAME} href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </li>
                <li>
                  <TextLink
                    className={FOOTER_LINK_CLASS_NAME}
                    href={ROUTES.contact}
                    underline={false}
                  >
                    {t('quote')}
                  </TextLink>
                </li>
              </ul>
            </div>
          </div>

          {/* ------------- bottom bar ------------- */}
          <div
            className={`
              flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-3
              label-mono text-muted-foreground
            `}
          >
            <span className="min-w-40 flex-1">© {currentYear} Aldaron · {t('region')}</span>
            <nav aria-label={t('legal')} className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              <TextLink className={LEGAL_LINK_CLASS_NAME} href={ROUTES.legal} underline={false}>
                {t('legalNotice')}
              </TextLink>
              <TextLink className={LEGAL_LINK_CLASS_NAME} href={ROUTES.privacy} underline={false}>
                {t('privacy')}
              </TextLink>
            </nav>
            <div className="flex min-w-40 flex-1 justify-end">
              <LanguageButtons />
            </div>
          </div>
        </div>
      </Section>
    </footer>
  );
};

export default Footer;
