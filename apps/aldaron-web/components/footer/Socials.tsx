import { useTranslations } from 'next-intl';
import { ReactElement } from 'react';

import { cn } from '@/utils/app.utils';
import { SOCIALS } from '@/utils/constants';

type Props = {
  className?: string;
};

// the marks of the networks, drawn in the current color so they follow the theme
const SOCIAL_PATHS: Record<(typeof SOCIALS)[number]['label'], string> = {
  linkedin:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z',
  facebook:
    'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z',
  youtube:
    'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z',
};

/**
 * Icon-only links, one per social network of SOCIALS, each one named by its network and opening in a
 * new tab
 */
const Socials = ({ className }: Props): ReactElement => {
  const t = useTranslations('Footer');
  const tCommon = useTranslations('Common');

  return (
    <nav aria-label={t('socials')} className={className}>
      <ul className="m-0 flex list-none flex-row flex-wrap items-center gap-1 p-0">
        {SOCIALS.map(social => (
          <li key={social.label}>
            <a
              aria-label={tCommon('newTab', { name: social.name })}
              href={social.value}
              rel="noopener noreferrer"
              target="_blank"
              className={cn(`
                inline-flex size-11 items-center justify-center text-muted-foreground transition-colors
                duration-120
                hover:text-foreground
                motion-reduce:transition-none
              `)}
            >
              <svg
                aria-hidden
                fill="currentColor"
                height="20"
                viewBox="0 0 24 24"
                width="20"
              >
                <path d={SOCIAL_PATHS[social.label]} />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Socials;
