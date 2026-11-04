import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { cn } from '@/utils/app.utils';
import { SOCIALS } from '@/utils/constants';

type Props = {
  className?: string;
  /**
   * centers the icons in their row
   * @default false
   */
  isCentered?: boolean;
};

/**
 * Icon-only buttons, one per social network of SOCIALS, each one named by its network
 */
const Socials = ({ className, isCentered = false }: Props) => {
  const t = useTranslations('Footer');
  const tCommon = useTranslations('Common');

  return (
    <nav aria-label={t('socials')} className={className}>
      <ul
        className={cn(
          'm-0 flex list-none flex-row flex-wrap items-center gap-2 self-stretch p-0',
          isCentered ? 'justify-center' : 'justify-start'
        )}
      >
        {SOCIALS.map(social => (
          <li key={social.label}>
            <a
              aria-label={tCommon('newTab', { name: social.name })}
              href={social.value}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex size-[42px] flex-row items-center justify-center rounded-sm bg-default">
                {/* light */}
                <Image
                  alt=""
                  aria-hidden="true"
                  height="24"
                  src={`/icons/${social.label}.svg`}
                  width="24"
                  className={`
                    block w-[24px]
                    dark:hidden
                  `}
                />
                {/* dark */}
                <Image
                  alt=""
                  aria-hidden="true"
                  height="24"
                  src={`/icons/${social.label}-dark.svg`}
                  width="24"
                  className={`
                    hidden w-[24px]
                    dark:block
                  `}
                />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Socials;
