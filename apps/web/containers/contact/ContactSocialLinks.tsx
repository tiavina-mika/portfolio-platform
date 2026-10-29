import Image from 'next/image';
import { useTranslations } from 'next-intl';

import Title from '@/components/typography/Title';
import { SOCIALS } from '@/utils/constants';

/**
 * "Follow me": one link per social network, each opening in a new tab
 */
const ContactSocialLinks = () => {
  const t = useTranslations('Contact');
  const tCommon = useTranslations('Common');

  return (
    <section aria-labelledby="contact-social-title" className="flex flex-col gap-3.5">
      <Title gutterBottom={false} id="contact-social-title" level={2}>
        {t('socialTitle')}
      </Title>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 p-0">
        {SOCIALS.map(social => (
          <li key={social.label}>
            <a
              aria-label={tCommon('newTab', { name: social.name })}
              href={social.value}
              rel="noopener noreferrer"
              target="_blank"
              className={`
                box-border flex min-h-14 items-center gap-3 rounded-md border border-border bg-card px-4
                text-base font-bold text-foreground no-underline transition-colors outline-none
                hover:bg-muted
                focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring
              `}
            >
              {/* the name written beside the icon says what the link is */}
              <Image
                alt=""
                height={24}
                src={`/icons/${social.label}.svg`}
                width={24}
                className={`
                  block w-6
                  dark:hidden
                `}
              />
              <Image
                alt=""
                height={24}
                src={`/icons/${social.label}-dark.svg`}
                width={24}
                className={`
                  hidden w-6
                  dark:block
                `}
              />
              {social.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ContactSocialLinks;
