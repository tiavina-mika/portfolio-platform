import {
  Box, Link, Stack, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { FaFileAlt } from 'react-icons/fa';

import type { Theme } from '@mui/material/styles';

import EmptyData from '@/components/EmptyData';
import {
  INBOX_ATTACHMENT_SIZE, INBOX_BUBBLE_MAX_WIDTH, INBOX_BUBBLE_META_GAP, INBOX_BUBBLE_PADDING_X,
  INBOX_BUBBLE_PADDING_Y, INBOX_BUBBLE_RADIUS, INBOX_SYSTEM_BUBBLE_PADDING_X,
  INBOX_SYSTEM_BUBBLE_PADDING_Y, INBOX_SYSTEM_BUBBLE_RADIUS, INBOX_THREAD_GAP,
} from '@/constants/_core/ui/inbox.constants';
import { ITicketAttachment, ITicketMessage, TicketMessageSenderRoleEnum } from '@/types/_core/ticket-message.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';
import { isHttpsUrl } from '@/utils/_core/utils';

type Props = {
  messages: ITicketMessage[];
};

const isImageAttachment = (attachment: ITicketAttachment): boolean =>
  /\.(jpe?g|png|webp|gif|svg)$/i.test(attachment.url);

/*
 * every upload comes back as an https url, so anything else was written by hand into the message:
 * a `javascript:` url would run in the agent's session on click, so it is not drawn at all
 */
const getLinkableAttachments = (message: ITicketMessage): ITicketAttachment[] =>
  (message.attachments ?? []).filter((attachment) => isHttpsUrl(attachment.url));

/*
 * three kinds of line, three drawings. What the requester wrote sits on the surface at the leading
 * edge; what the back office answered is tinted and closes on the trailing edge; what happened to
 * the ticket by itself is centred and outlined rather than filled, because it is not speech. A
 * note is the fourth case and is drawn in the warning tone it belongs to — an agent must be able
 * to see, without reading a word of it, that this line never left the back office.
 */
const classes = {
  bubble: (theme: Theme, isAgent: boolean, isInternal: boolean) => {
    const tokens = getDesignTokens(theme);

    if (isInternal) {
      return {
        backgroundColor: getTintedBackground(theme, theme.palette.warning.main),
        border: `1px solid ${alpha(theme.palette.warning.main, 0.4)}`,
      };
    }

    return isAgent
      ? {
        backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      }
      : {
        backgroundColor: tokens.surface,
        border: `1px solid ${tokens.border}`,
      };
  },
  system: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      maxWidth: INBOX_BUBBLE_MAX_WIDTH,
      padding: `${INBOX_SYSTEM_BUBBLE_PADDING_Y}px ${INBOX_SYSTEM_BUBBLE_PADDING_X}px`,
      borderRadius: `${INBOX_SYSTEM_BUBBLE_RADIUS}px`,
      textAlign: 'center' as const,
      color: tokens.textMuted,
      backgroundColor: tokens.surface,
      border: `1px dashed ${tokens.border}`,
    };
  },
};

/**
 * Everything said on one ticket, oldest first. It is the ticket: the status and the priority say
 * where it stands, but only the thread says what the problem actually is, which is why the agent's
 * own answers are drawn as replies rather than as rows of a log.
 */
const TicketMessageThread = ({ messages }: Props) => {
  const { t } = useTranslation(['user']);

  if (messages.length === 0) return <EmptyData title={t('user:contacts.noMessages')} />;

  return (
    <Stack spacing={`${INBOX_THREAD_GAP}px`}>
      {messages.map((message: ITicketMessage) => {
        const isAgent = message.senderRole === TicketMessageSenderRoleEnum.AGENT;
        const isSystem = message.senderRole === TicketMessageSenderRoleEnum.SYSTEM;
        const isInternal = !!message.isInternal;
        const senderLabel = message.sender ? getUserFullName(message.sender) : t('user:contacts.contact');

        if (isSystem) {
          return (
            <Box key={message.id} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box css={classes.system}>
                <Typography variant="body2">{message.message}</Typography>
              </Box>
            </Box>
          );
        }

        return (
          <Box
            key={message.id}
            sx={{ display: 'flex', justifyContent: isAgent ? 'flex-end' : 'flex-start' }}
          >
            <Box
              css={(currentTheme: Theme) => classes.bubble(currentTheme, isAgent, isInternal)}
              sx={{
                maxWidth: INBOX_BUBBLE_MAX_WIDTH,
                borderRadius: `${INBOX_BUBBLE_RADIUS}px`,
                padding: `${INBOX_BUBBLE_PADDING_Y}px ${INBOX_BUBBLE_PADDING_X}px`,
              }}
            >
              <Typography
                sx={{ display: 'block', mb: `${INBOX_BUBBLE_META_GAP}px`, fontWeight: 600 }}
                variant="caption"
              >
                {isInternal
                  ? t('user:contacts.internalNoteBy', { value: senderLabel })
                  : senderLabel}
                {' · '}
                {displayDate(message.createdAt, true)}
              </Typography>
              {!!message.message && (
                <Typography sx={{ whiteSpace: 'pre-wrap', textWrap: 'pretty' }} variant="body1">
                  {message.message}
                </Typography>
              )}
              {getLinkableAttachments(message).length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: 'wrap', mt: 1 }}
                >
                  {getLinkableAttachments(message).map((attachment: ITicketAttachment) => (
                    isImageAttachment(attachment) ? (
                      <Box
                        component="a"
                        href={attachment.url}
                        key={attachment.publicId}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Box
                          component="img"
                          src={attachment.url}
                          sx={{
                            width: INBOX_ATTACHMENT_SIZE,
                            height: INBOX_ATTACHMENT_SIZE,
                            borderRadius: 1,
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    ) : (
                      <Link
                        href={attachment.url}
                        key={attachment.publicId}
                        rel="noopener noreferrer"
                        target="_blank"
                        underline="hover"
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 0.5,
                        }}
                      >
                        <FaFileAlt size={16} />
                        <Typography variant="body2">{t('user:contacts.attachment')}</Typography>
                      </Link>
                    )
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

export default TicketMessageThread;
