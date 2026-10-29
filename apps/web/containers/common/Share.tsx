import { useTranslations } from 'next-intl';
import { capitalize } from 'string-ts';

import Text from '@/components/typography/Text';
import { formatNumberToUnit } from '@/utils/utils';

import ShareIcon, { ShareIconProps } from './ShareIcon';

type ShareOption = Omit<ShareIconProps, 'collection' | 'id' | 'title'>;

type Props = {
  parseObj: any;
  currentPathname: string;
};
const Share = ({ parseObj, currentPathname }: Props) => {
  const t = useTranslations('Common');

  const options: ShareOption[] = [
    {
      url: `https://www.facebook.com/sharer/sharer.php?u=${currentPathname}`,
      social: 'facebook',
      // buttonClassName: 'bg-blue-500',
    },
    {
      url: `https://twitter.com/intent/tweet?url=${currentPathname}`,
      social: 'x',
      // buttonClassName: 'bg-blue-400',
    },
    {
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${currentPathname}`,
      social: 'linkedin',
      // buttonClassName: 'bg-blue-600',
    },
    {
      url: `https://wa.me/?text=${currentPathname}`,
      social: 'whatsapp',
      // buttonClassName: 'bg-green-500',
    },
    {
      url: `https://t.me/share/url?url=${currentPathname}`,
      social: 'telegram',
      // buttonClassName: 'bg-blue-200',
    },
    {
      url: `https://www.reddit.com/submit?url=${currentPathname}`,
      social: 'reddit',
      // buttonClassName: 'bg-orange-500',
    },
    // skype
    {
      url: `https://web.skype.com/share?url=${currentPathname}`,
      social: 'skype',
      // buttonClassName: 'bg-blue-500',
    },
  ];

  return (
    <div className={`
      mt-4 flex flex-col gap-3
      md:mt-8
    `}
    >
      {/* social medial shares count */}
      {parseObj.has('totalMediaShare') &&
        parseObj.get('totalMediaShare') > 0 && (
        <div className="flex flex-row items-center gap-1">
          <Text className={`
            font-bold
            max-sm:text-sm
          `}
          >
            {formatNumberToUnit(parseObj.get('totalMediaShare')) || 0}
          </Text>

          <Text className={`
            font-normal
            max-sm:text-sm
          `}
          >{t('shares')}</Text>
        </div>
      )}
      {/* share icons */}
      <div className={`
        flex flex-row items-center gap-3
        lg:gap-4
      `}
      >
        {options.map((option, index) => (
          <ShareIcon
            collection={parseObj.className}
            id={parseObj.id}
            key={index}
            social={option.social}
            title={t('shareOn', { social: capitalize(option.social) })}
            url={option.url}
          />
        ))}
      </div>
    </div>
  );
};

export default Share;
