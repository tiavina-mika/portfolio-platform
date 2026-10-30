import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { TICKET_ATTACHMENT_MAX_COUNT } from '@shared/constants';
import { MessageChannelEnum } from '@shared/types';
import { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPaperclip, FiSend } from 'react-icons/fi';

import { TICKET_ATTACHMENT_ACCEPT } from '@/constants/_core/file.constants';
import { TICKET_QUICK_REPLY_KEYS } from '@/constants/_core/ticket.constants';
import {
  INBOX_COMPOSER_GAP, INBOX_COMPOSER_MIN_HEIGHT, INBOX_COMPOSER_PADDING_X, INBOX_COMPOSER_PADDING_Y,
  INBOX_COMPOSER_ROWS, INBOX_QUICK_REPLY_GAP, INBOX_QUICK_REPLY_HEIGHT, INBOX_QUICK_REPLY_PADDING_X,
  INBOX_QUICK_REPLY_RADIUS,
} from '@/constants/_core/ui/inbox.constants';
import { PAGE_HEAD_ACTION_ICON_SIZE } from '@/constants/_core/ui/page.constants';
import ContactOneWayNotice from '@/containers/_core/contacts/ContactOneWayNotice';
import { TicketQuickReplyKey } from '@/types/_core/ticket-message.type';

/** what the file picker accepts, as the `accept` attribute wants it: one flat list of extensions */
const ATTACHMENT_ACCEPT = Object.values(TICKET_ATTACHMENT_ACCEPT).flat().join(',');

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${INBOX_COMPOSER_GAP}px`,
    padding: `${INBOX_COMPOSER_PADDING_Y}px ${INBOX_COMPOSER_PADDING_X}px`,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: `${INBOX_COMPOSER_GAP}px`,
  },
  /*
   * the canned openings close the row on the trailing edge rather than opening it: the switch on
   * the other side decides who is being written to, and that has to be read first
   */
  quickReplies: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    justifyContent: 'flex-end',
    gap: `${INBOX_QUICK_REPLY_GAP}px`,
  },
  quickReply: {
    height: INBOX_QUICK_REPLY_HEIGHT,
    borderRadius: `${INBOX_QUICK_REPLY_RADIUS}px`,
    '& .MuiChip-label': { padding: `0 ${INBOX_QUICK_REPLY_PADDING_X}px` },
  },
  field: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: `${INBOX_COMPOSER_GAP}px`,
  },
  send: { height: INBOX_COMPOSER_MIN_HEIGHT, flexShrink: 0 },
};

type Props = {
  onSubmit: (message: string, isInternal: boolean, files: File[]) => void;
  disabled?: boolean;
  /*
   * the requester has no account, so a reply leaves as an email they cannot answer. It changes
   * nothing about how the message is sent — only what the agent needs to know before writing it
   */
  isOneWay?: boolean;
  // what a one-way reply leaves as: an email, or an SMS for a requester with a phone number alone
  replyChannel?: MessageChannelEnum;
};

/**
 * The one field an agent works from. Replying and noting are the same gesture aimed at two
 * different readers, so they share a field and a switch rather than being two forms: what changes
 * is who will see it, which the switch states, the placeholder repeats and the send button's tone
 * confirms — a note is never sent to anyone.
 */
const ContactComposer = ({
  onSubmit, disabled = false, isOneWay = false, replyChannel = MessageChannelEnum.EMAIL,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    onSubmit(trimmedMessage, isInternal, files);
    setMessage('');
    setFiles([]);
  };

  // the picker only ever adds up to the cap the server enforces, so a sixth file is never uploaded
  const handlePickFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);

    setFiles((current: File[]) => [...current, ...picked].slice(0, TICKET_ATTACHMENT_MAX_COUNT));
    // cleared so picking the same file twice in a row still fires a change
    event.target.value = '';
  };

  const handleRemoveFile = (name: string) => {
    setFiles((current: File[]) => current.filter((file: File) => file.name !== name));
  };

  /*
   * a canned opening fills the field instead of sending: it is the first sentence of an answer,
   * and what follows it is the part that is actually about this ticket
   */
  const handleQuickReply = (key: TicketQuickReplyKey) => {
    setMessage(t(`user:contacts.quickReplies.${key}.body`));
  };

  return (
    <Box css={classes.root}>
      {/* a note stays worth reading only while it is true: it is dropped for a ticket with an account */}
      {isOneWay && !isInternal && <ContactOneWayNotice channel={replyChannel} />}
      <Box css={classes.head}>
        <ToggleButtonGroup
          exclusive
          onChange={(_, value: string | null) => value !== null && setIsInternal(value === 'note')}
          size="small"
          value={isInternal ? 'note' : 'reply'}
        >
          <ToggleButton value="reply">{t('user:contacts.reply')}</ToggleButton>
          <ToggleButton value="note">{t('user:contacts.internalNote')}</ToggleButton>
        </ToggleButtonGroup>
        <Box css={classes.quickReplies}>
          {TICKET_QUICK_REPLY_KEYS.map((key: TicketQuickReplyKey) => (
            <Chip
              clickable
              css={classes.quickReply}
              key={key}
              label={t(`user:contacts.quickReplies.${key}.label`)}
              onClick={() => handleQuickReply(key)}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
      {files.length > 0 && (
        <Box css={classes.quickReplies} sx={{ justifyContent: 'flex-start' }}>
          {files.map((file: File) => (
            <Chip
              key={file.name}
              label={file.name}
              onDelete={() => handleRemoveFile(file.name)}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      )}
      <Box css={classes.field}>
        <Tooltip title={t('user:contacts.addAttachment')}>
          <span>
            <IconButton
              disabled={disabled || files.length >= TICKET_ATTACHMENT_MAX_COUNT}
              onClick={() => fileInputRef.current?.click()}
              size="small"
            >
              <FiPaperclip size={PAGE_HEAD_ACTION_ICON_SIZE} />
            </IconButton>
          </span>
        </Tooltip>
        <input
          hidden
          multiple
          accept={ATTACHMENT_ACCEPT}
          onChange={handlePickFiles}
          ref={fileInputRef}
          type="file"
        />
        <TextField
          fullWidth
          multiline
          onChange={(event) => setMessage(event.target.value)}
          rows={INBOX_COMPOSER_ROWS}
          value={message}
          placeholder={isInternal
            ? t('user:contacts.internalNotePlaceholder')
            : t('user:contacts.replyPlaceholder')}
        />
        <Button
          color={isInternal ? 'warning' : 'primary'}
          css={classes.send}
          disabled={disabled || !message.trim()}
          onClick={handleSubmit}
          startIcon={isInternal ? undefined : <FiSend size={PAGE_HEAD_ACTION_ICON_SIZE} />}
          variant="contained"
        >
          {isInternal ? t('user:contacts.addNote') : t('user:contacts.send')}
        </Button>
      </Box>
    </Box>
  );
};

export default ContactComposer;
