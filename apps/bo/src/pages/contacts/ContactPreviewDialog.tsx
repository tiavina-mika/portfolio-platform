import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import LabelValue from '@/components/LabelValue';
import ReplyContactForm from '@/containers/contacts/ReplyContactForm';
import { IContact, ReplyContactInput } from '@/types/contact.type';
import { DEFAULT_LOCALE } from '@/utils/constants';
import { displayDate } from '@/utils/date.utils';
import { getUserFullName, sendMailto } from '@/utils/user.utils';

const classes = {
  label: {
    fontSize: 14,
  },
};

type Props = {
  selectedContact: IContact | null;
  onClose: () => void;
  onChangeIsMessageReplied: () => void;
};
const ContactPreviewDialog = ({ selectedContact, onClose, onChangeIsMessageReplied }: Props) => {
  const { t } = useTranslation(['user']);

  const handleSendEmail = (values: ReplyContactInput) => {
    if (!selectedContact) return;

    const lng = selectedContact.get('language') || DEFAULT_LOCALE;
    const subject = t('user:contacts.replySubject', { subject: selectedContact.get('name'), date: displayDate(selectedContact.get('createdAt'), true), lng });

    sendMailto({
      email: selectedContact.get('email') || '',
      subject,
      body: values.message,
    });

    // delay to let the email client open
    setTimeout(() => {
      onClose();
      onChangeIsMessageReplied();
    }, 12000);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={!!selectedContact}
      secondaryButtonText={t('common:close')}
      toggle={onClose}
      withCancelButton={!!selectedContact?.get('replied')}
      title={(
        <Stack className="flex1 stretchSelf spaceBetween center" direction="row">
          <Stack>
            <Typography>{t('user:contacts.messageBy', { name: selectedContact?.get('name') })}</Typography>
            <Typography variant="caption">{selectedContact?.get('email')}</Typography>
          </Stack>
          <Typography variant="caption">{displayDate(selectedContact?.get('createdAt'), true)}</Typography>
        </Stack>
      ) as any}
    >
      <Stack spacing={1}>
        <Typography css={classes.label}>{t('user:contacts.message')}</Typography>
        <Typography css={{ color: '#000' }}>{selectedContact?.get('message')}</Typography>
      </Stack>
      {selectedContact?.get('replied')
        ? (
          <Stack css={{ marginTop: 25 }} spacing={1}>
            <LabelValue label={t('user:contacts.repliedBy')} value={getUserFullName(selectedContact?.get('repliedBy'))} />
            <LabelValue label={t('user:contacts.repliedAt')} value={displayDate(selectedContact.get('repliedAt'), true)} />
          </Stack>
        ) : (
          <Stack css={{ marginTop: 25 }} spacing={1}>
            <Typography css={classes.label}>{t('user:contacts.reply')}</Typography>
            <ReplyContactForm
              onSecondaryButtonClick={onClose}
              onSubmit={handleSendEmail}
            />
          </Stack>
        )}
    </Dialog>
  );
};

export default ContactPreviewDialog;
