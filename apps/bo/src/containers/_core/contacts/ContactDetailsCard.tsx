import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { CONTACT_LOCALE_LABEL_KEYS } from '@/constants/_core/contact.constants';
import {
  INBOX_CONTEXT_CARD_PADDING, INBOX_CONTEXT_ROW_GAP, INBOX_CONTEXT_ROW_PADDING_Y,
  INBOX_CONTEXT_TITLE_GAP,
} from '@/constants/_core/ui/inbox.constants';
import { IContact } from '@/types/_core/contact.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  card: (theme: Theme) => ({
    padding: `${INBOX_CONTEXT_CARD_PADDING}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  title: { display: 'block', marginBottom: `${INBOX_CONTEXT_TITLE_GAP}px` },
  // a fact is a row closed by a rule above it: the values line up down the trailing edge
  row: (theme: Theme) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: `${INBOX_CONTEXT_ROW_GAP}px`,
    padding: `${INBOX_CONTEXT_ROW_PADDING_Y}px 0`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  label: { flexShrink: 0 },
  value: {
    minWidth: 0,
    textAlign: 'right' as const,
    // an address or a long name breaks rather than pushing the card wider than its column
    overflowWrap: 'anywhere' as const,
  },
};

type Props = {
  contact: IContact;
};

/**
 * What the message carries besides its text, as a list of facts: how to reach the sender, when and
 * in which language they wrote, and whether they asked for the newsletter. The ways to reach the
 * sender always have a row, so a missing phone number reads as missing rather than as a hidden row.
 */
const ContactDetailsCard = ({ contact }: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const {
    email, phone, createdAt, locale, acceptNewsLetter: isNewsletterAccepted,
  } = contact;

  const renderRow = (label: string, value: ReactNode) => (
    <Box css={classes.row} key={label}>
      <Typography css={classes.label} variant="caption">{label}</Typography>
      <Typography
        component="div"
        css={classes.value}
        sx={{ fontWeight: 500 }}
        variant="body2"
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box css={classes.card}>
      <Typography css={classes.title} variant="overline">{t('user:contacts.details.title')}</Typography>
      {renderRow(t('user:contacts.details.email'), email || t('user:contacts.details.notProvided'))}
      {renderRow(t('user:contacts.details.phone'), phone || t('user:contacts.details.notProvided'))}
      {renderRow(t('user:contacts.details.createdAt'), displayDate(createdAt))}
      {!!locale && renderRow(
        t('user:contacts.details.language'),
        CONTACT_LOCALE_LABEL_KEYS[locale] ? t(CONTACT_LOCALE_LABEL_KEYS[locale]) : locale
      )}
      {renderRow(
        t('user:contacts.details.newsletter'),
        isNewsletterAccepted ? t('common:yes') : t('common:no')
      )}
    </Box>
  );
};

export default ContactDetailsCard;
