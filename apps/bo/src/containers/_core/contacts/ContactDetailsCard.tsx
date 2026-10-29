import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import Link from '@/components/Link';
import { TICKET_LOCALE_LABEL_KEYS } from '@/constants/_core/ticket.constants';
import {
  INBOX_CONTEXT_CARD_PADDING, INBOX_CONTEXT_ROW_GAP, INBOX_CONTEXT_ROW_PADDING_Y,
  INBOX_CONTEXT_TITLE_GAP,
} from '@/constants/_core/ui/inbox.constants';
import { IContact } from '@/types/_core/contact.type';
import { IUser } from '@/types/_core/user.type';
import { getContactDetailRows } from '@/utils/_core/contact.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  card: { padding: `${INBOX_CONTEXT_CARD_PADDING}px` },
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
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    minWidth: 0,
    textAlign: 'right' as const,
    // an address or a long name breaks rather than pushing the card wider than its column
    overflowWrap: 'anywhere' as const,
    textWrap: 'pretty' as const,
  },
};

type Props = {
  contact: IContact;
};

/** An agent named with the moment they did something — "Admin Name · 28 Sep 14:12". */
const getAgentAndDate = (agent: IUser | undefined, date: string): string => (
  [agent && getUserFullName(agent), displayDate(date)].filter(Boolean).join(' · ')
);

/**
 * What the ticket is, as a list of facts: the number the requester quotes, how to reach them, when
 * and in which language they wrote, what they said the request is about, and how the back-office has
 * handled it so far — who opened it first and last, how many times, and who answered first.
 *
 * A fact the ticket does not carry has no row rather than a placeholder, except the ways to reach
 * the requester: an agent has to be told that there is no phone number, not left to wonder whether
 * the row is missing. The two records a request may point at by person or booking sit here with
 * the other facts; the ride and the payment it points at have a card of their own.
 */
const ContactDetailsCard = ({ contact }: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const {
    reference, email, phone, createdAt, locale, subject, reason, reportedUser,
    seenAt, seenBy, lastSeenAt, lastSeenBy, seenCount, repliedAt, repliedBy,
  } = contact;

  const renderRow = (label: string, value: ReactNode) => (
    <Box css={classes.row} key={label}>
      <Typography css={classes.label} variant="caption">{label}</Typography>
      <Box css={classes.value}>
        <Typography component="div" sx={{ fontWeight: 500 }} variant="body2">{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <Card css={classes.card}>
      <Typography css={classes.title} variant="overline">{t('user:contacts.details.title')}</Typography>

      {!!reference && renderRow(t('user:contacts.details.reference'), `#${reference}`)}
      {renderRow(t('user:contacts.details.email'), email || t('user:contacts.details.notProvided'))}
      {renderRow(t('user:contacts.details.phone'), phone || t('user:contacts.details.notProvided'))}
      {renderRow(t('user:contacts.details.createdAt'), displayDate(createdAt))}
      {!!locale && renderRow(
        t('user:contacts.details.language'),
        TICKET_LOCALE_LABEL_KEYS[locale] ? t(TICKET_LOCALE_LABEL_KEYS[locale]) : locale
      )}
      {renderRow(
        t('user:contacts.details.newsletter'),
        contact.acceptNewsLetter ? t('common:yes') : t('common:no')
      )}
      {/* a ticket from the website or an SOS says nothing about its subject: no row, not a dash */}
      {!!subject && renderRow(t('user:contacts.details.subject'), t(`user:contacts.subjects.${subject}`))}
      {!!subject && !!reason && renderRow(
        t('user:contacts.details.reason'),
        t(`user:contacts.reasons.${subject}.${reason}`)
      )}
      {!!reportedUser && renderRow(
        t('user:contacts.details.reportedUser'),
        <Link params={{ id: reportedUser.objectId }} to={`${PATH_NAMES.users}/$id`}>
          {getUserFullName(reportedUser)}
        </Link>
      )}
      {getContactDetailRows(contact).map(({ label, value }) => renderRow(label, value))}

      {/*
        * how the ticket has been read so far: `seenAt` names the agent who took it out of the queue
        * and is never rewritten, the next two say what happened after it
        */}
      {!!seenAt && renderRow(t('user:contacts.details.firstOpened'), getAgentAndDate(seenBy, seenAt))}
      {!!lastSeenAt && renderRow(
        t('user:contacts.details.lastOpened'),
        getAgentAndDate(lastSeenBy, lastSeenAt)
      )}
      {!!seenCount && renderRow(t('user:contacts.details.visits'), seenCount)}
      {contact.replied && !!repliedAt && renderRow(
        t('user:contacts.details.firstReply'),
        getAgentAndDate(repliedBy, repliedAt)
      )}
    </Card>
  );
};

export default ContactDetailsCard;
