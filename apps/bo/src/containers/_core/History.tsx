/**
 * The timeline a record's own history is read on: one dot per event that actually happened, newest
 * first, with the date it happened and the account behind it.
 * @NOTE Make sure to include (populate) the fields in the Parse query
 */
import { Theme } from '@mui/material';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Avatar from '@/components/Avatar';
import Link from '@/components/Link';
import {
  HISTORY_AUTHOR_AVATAR_SIZE, HISTORY_AUTHOR_GAP, HISTORY_AUTHOR_INITIALS_FONT_SIZE,
  HISTORY_AUTHOR_OFFSET, HISTORY_DOT_RING, HISTORY_DOT_SIZE, HISTORY_EVENT_GAP, HISTORY_HEAD_GAP,
  HISTORY_RAIL_INSET,
} from '@/constants/_core/ui/inbox.constants';
import { DefaultMUIColorType } from '@/types/_core/app.type';
import { IHistoryEvent } from '@/types/_core/history.type';
import { IUser } from '@/types/_core/user.type';
import { displayDate } from '@/utils/_core/date.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

/**
 * Reads a field from either a live Parse.Object (via `.get()`) or a plain JSON object.
 * Some domains are still raw Parse.Object instances, others have been converted to JSON —
 * this keeps History usable across both during the migration.
 */
const getField = (obj: Record<string, any>, field: string): any =>
  (typeof obj.get === 'function' ? obj.get(field) : obj[field]);

/**
 * Orders the events by the date each one carries, most recent first — a timeline is read from what
 * just happened backwards, and an event with no date stands at the end. The list is copied before
 * sorting: callers pass arrays they own.
 */
const getEventsOrderedByDate = (events: IHistoryEvent[]): IHistoryEvent[] => {
  return [...events].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;

    return dayjs(b.date).diff(dayjs(a.date));
  });
};

const classes = {
  /*
   * the rail the dots stand on runs between the first and the last of them rather than the whole
   * height of the block: a line continuing past the oldest event would say the history goes on
   */
  rail: (theme: Theme) => ({
    position: 'relative' as const,
    paddingLeft: HISTORY_RAIL_INSET,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${HISTORY_EVENT_GAP}px`,
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      left: (HISTORY_DOT_SIZE - 1) / 2,
      top: HISTORY_DOT_SIZE / 2,
      bottom: HISTORY_DOT_SIZE / 2,
      width: 1,
      backgroundColor: getDesignTokens(theme).border,
    },
  }),
  event: { position: 'relative' as const },
  /*
   * the dot is punched out of the rail by a ring of the card's own surface, so the line reads as
   * passing behind the events rather than through them
   */
  dot: (color: DefaultMUIColorType) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      position: 'absolute' as const,
      left: -HISTORY_RAIL_INSET,
      top: HISTORY_DOT_RING,
      width: HISTORY_DOT_SIZE,
      height: HISTORY_DOT_SIZE,
      borderRadius: '50%',
      backgroundColor: color === 'default'
        ? tokens.textDisabled
        : theme.palette[color].main,
      boxShadow: `0 0 0 ${HISTORY_DOT_RING}px ${tokens.surface}`,
    };
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HISTORY_HEAD_GAP}px`,
    flexWrap: 'wrap' as const,
  },
  // the account is a detail of the event above it, so it stands one line down and one tone quieter
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HISTORY_AUTHOR_GAP}px`,
    marginTop: HISTORY_AUTHOR_OFFSET,
  },
};

type Props<T> = {
  parseObj: T;
  /**
   * the database fields to display
   * @example ['accepted', 'refused', 'canceled'] to acceptedAt and acceptedBy
   */
  fields: string[];
  // translation key for the fields, ex: 'requests'
  translationKey?: string;
  /*
   * the tone each event's dot takes. The rail is scanned before any of the labels are read, so the
   * colour is what says whether a record appeared, changed or left.
   */
  colors?: Record<string, DefaultMUIColorType>;
  /*
   * the field holding the author of an event, when it is not the `<event>By` the others follow —
   * the CMS classes name the account that created a record `user`.
   */
  authorFields?: Record<string, string>;
  /*
   * events that are not a date column of the record — rows of another collection, like the resends
   * of a notification — already named and dated by the caller, and placed on the same rail in date
   * order with the rest
   */
  extraEvents?: IHistoryEvent[];
};

const History = <T,>({
  parseObj,
  fields,
  translationKey,
  colors = {},
  authorFields = {},
  extraEvents = [],
}: Props<T>) => {
  const { t } = useTranslation(['common', 'project', 'user']);

  const fieldEvents: IHistoryEvent[] = fields
    .map((field) => ({
      key: field,
      label: t(translationKey + '.' + field),
      date: getField(parseObj as any, `${field}At`),
      user: getField(parseObj as any, authorFields[field] ?? `${field}By`) as IUser | undefined,
      color: colors[field],
    }))
    .filter((event) => event.date || event.user);
  const events = getEventsOrderedByDate([...fieldEvents, ...extraEvents]);

  if (!events.length) return <Typography variant="body2">{t('common:errors.noHistory')}</Typography>;

  return (
    <div css={classes.rail}>
      {events.map((event) => (
        <div css={classes.event} key={event.key}>
          <span css={classes.dot(event.color ?? 'primary')} />
          <div css={classes.head}>
            <Typography variant="subtitle1">
              {event.label}
            </Typography>
            <Typography variant="caption">
              {event.date
                ? displayDate(event.date, true)
                : '-'}
            </Typography>
          </div>
          {event.user && (
            <div css={classes.author}>
              <Avatar
                size={HISTORY_AUTHOR_AVATAR_SIZE}
                sx={{ fontSize: HISTORY_AUTHOR_INITIALS_FONT_SIZE }}
                user={event.user}
              />
              <Link
                params={{ id: event.user.id ?? event.user.objectId }}
                to={PATH_NAMES.users + '/$id'}
                variant="caption"
              >
                {getUserFullName(event.user)}
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default History;
