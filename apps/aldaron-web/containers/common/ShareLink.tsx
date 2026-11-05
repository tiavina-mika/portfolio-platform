'use client';

import NextIcon from '@/components/NextIcon';
import { incrementShareCountBySocial } from '@/server/mutations/app.mutation';

export type ShareLinkProps = {
  /**
   * Opens the sharing page of the network, with the address of the content in it
   */
  url: string;
  /**
   * Name of the network, lowercase. It is also the name of the icon file and what the share
   * counter stores
   * @example 'facebook'
   */
  social: string;
  /**
   * Name of the link for screen readers
   * @example 'Share on Facebook'
   */
  label: string;
  /**
   * The database collection where the share count is incremented
   * @example 'Article'
   */
  collection: string;
  /**
   * The id of the object where the share count is incremented
   */
  id: string;
};

/**
 * An icon that opens the sharing page of one social network in a new tab and counts the share
 */
const ShareLink = ({
  url, social, label, collection, id,
}: ShareLinkProps) => {
  const handleClick = async () => {
    await incrementShareCountBySocial(id, collection, social);
  };

  return (
    <a
      aria-label={label}
      href={url}
      onClick={handleClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      <NextIcon
        aria-hidden
        alt=""
        size={32}
        src={`/icons/share/${social}.svg`}
      />
    </a>
  );
};

export default ShareLink;
