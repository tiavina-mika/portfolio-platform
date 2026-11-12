import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { capitalize } from 'string-ts';

import Section from '@/components/layouts/Section';
import Text from '@/components/typography/Text';
import { formatNumberToUnit } from '@/utils/utils';

import ShareLink from './ShareLink';

type Props = {
  /**
   * the database collection where the share count will be incremented
   * @example 'Article'
   */
  collection: string;
  id: string;
  /**
   * Shown above the icons once the content has been shared at least once
   */
  totalMediaShare?: number;
  /**
   * Absolute address of the content, put in the sharing pages
   */
  currentPathname: string;
};

const NETWORKS = [
  { social: 'facebook', getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${url}` },
  { social: 'x', getUrl: (url: string) => `https://twitter.com/intent/tweet?url=${url}` },
  { social: 'linkedin', getUrl: (url: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${url}` },
  { social: 'whatsapp', getUrl: (url: string) => `https://wa.me/?text=${url}` },
  { social: 'telegram', getUrl: (url: string) => `https://t.me/share/url?url=${url}` },
  { social: 'reddit', getUrl: (url: string) => `https://www.reddit.com/submit?url=${url}` },
  { social: 'skype', getUrl: (url: string) => `https://web.skype.com/share?url=${url}` },
];

/**
 * The share block of a content: a link per network and the discreet count of shares
 */
const Share = ({
  collection, id, totalMediaShare, currentPathname,
}: Props) => {
  const t = useTranslations('Common');
  const titleId = useId();
  const encodedUrl = encodeURIComponent(currentPathname);

  return (
    <Section
      aria-labelledby={titleId}
      as="section"
      className="flex-col gap-3"
      rootClassName="mt-4 md:mt-8"
      size="md"
    >
      <h2 className="sr-only" id={titleId}>{t('share')}</h2>
      {!!totalMediaShare && totalMediaShare > 0 && (
        <div className="flex flex-row items-center gap-1">
          <Text className={`
            font-bold
            max-sm:text-sm
          `}
          >{formatNumberToUnit(totalMediaShare) || 0}</Text>
          <Text className={`
            font-normal
            max-sm:text-sm
          `}
          >{t('shares')}</Text>
        </div>
      )}
      <div className={`
        flex flex-row flex-wrap items-center gap-3
        lg:gap-4
      `}
      >
        {NETWORKS.map((network) => (
          <ShareLink
            collection={collection}
            id={id}
            key={network.social}
            label={t('shareOn', { social: capitalize(network.social) })}
            social={network.social}
            url={network.getUrl(encodedUrl)}
          />
        ))}
      </div>
    </Section>
  );
};

export default Share;
