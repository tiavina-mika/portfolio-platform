'use client';

import NextIcon from '@/components/NextIcon';
import { incrementShareCountBySocial } from '@/server/mutations/app.mutation';


export type ShareIconProps = {
  url: string;
  /**
   * name of the social media
   * used also as the name of the icon (so the icon should be named as the social media)
   * @example 'facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'reddit', 'skype'
   */
  social: string;
  /**
   * the title of the object that will be shared
   * used as a title for the share link
   */
  title: string;
  /**
   * the database collection where the share count will be incremented
   * @example 'Project', 'Article'
   */
  collection: string;
  /**
   * the id of the object where the share count will be incremented
   * @example '1234567890'
   */
  id: string;
};

const ShareIcon = ({
  id, url, social, title, collection,
}: ShareIconProps) => {
  const handleClick = async () => {
    await incrementShareCountBySocial(id, collection, social);
  };

  return (
    <a
      href={url}
      onClick={handleClick}
      rel="noopener noreferrer"
      target="_blank"
      title={title}
    >
      <NextIcon size={32} src={`/icons/share/${social}.svg`} />
    </a>
  );
};

export default ShareIcon;
