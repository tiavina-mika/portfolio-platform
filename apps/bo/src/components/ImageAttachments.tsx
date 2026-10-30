import { type Theme } from '@emotion/react';
import Box from '@mui/material/Box';

import {
  IMAGE_ATTACHMENT_GAP, IMAGE_ATTACHMENT_RADIUS, IMAGE_ATTACHMENT_SIZE,
} from '@/constants/_core/ui/page.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { isHttpsUrl } from '@/utils/_core/utils';

const classes = {
  root: (isEnd: boolean) => ({
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: isEnd
      ? 'flex-end'
      : 'flex-start',
    gap: `${IMAGE_ATTACHMENT_GAP}px`,
  }),
  attachment: (theme: Theme) => ({
    display: 'block',
    width: IMAGE_ATTACHMENT_SIZE,
    height: IMAGE_ATTACHMENT_SIZE,
    objectFit: 'cover' as const,
    borderRadius: IMAGE_ATTACHMENT_RADIUS,
    border: `1px solid ${getDesignTokens(theme).border}`,
  }),
};

type Props = {
  // `label` names each photo for screen readers
  attachments: { url: string; label: string }[];
  // aligned on the right, under a message written on the right of the thread
  isEnd?: boolean;
};

/**
 * The photos a member joined to what they wrote — a no-show message, a report on a ride — each
 * opened full size in a new tab.
 */
const ImageAttachments = ({ attachments, isEnd = false }: Props) => (
  <Box css={classes.root(isEnd)}>
    {attachments.map((attachment) => {
      const image = (
        <Box
          alt={attachment.label}
          component="img"
          css={classes.attachment}
          key={attachment.url}
          src={attachment.url}
        />
      );

      /*
       * the url is written by the member who sent the message: only an https one becomes a
       * link, so a `javascript:` url can never run in the session of the agent clicking it
       */
      return isHttpsUrl(attachment.url)
        ? (
          <a
            href={attachment.url}
            key={attachment.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {image}
          </a>
        )
        : image;
    })}
  </Box>
);

export default ImageAttachments;
