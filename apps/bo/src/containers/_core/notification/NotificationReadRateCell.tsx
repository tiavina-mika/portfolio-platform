import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import StatusDot from '@/components/StatusDot';
import RowMeter from '@/components/table/RowMeter';
import {
  ROW_METER_GAP, TABLE_CELL_INLINE_GAP, TABLE_CELL_LINE_GAP,
} from '@/constants/_core/ui/list.constants';
import { FONT_VARIANT_TABULAR_NUMS } from '@/constants/_core/ui/ui.constants';
import { INotification } from '@/types/_core/notification.type';
import {
  getNotificationReadRate, getNotificationReadStateColor, getNotificationReadStateLabel,
} from '@/utils/_core/notification.utils';
import { getStatusSolidColor } from '@/utils/_core/theme/styles.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    minWidth: 0,
  },
  meterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${ROW_METER_GAP}px`,
  },
  // the two halves of the fraction line up down the column, so it can be compared row to row
  ratio: {
    fontVariantNumeric: FONT_VARIANT_TABULAR_NUMS,
    whiteSpace: 'nowrap' as const,
    marginLeft: TABLE_CELL_INLINE_GAP,
  },
};

type Props = {
  notification: INotification;
};

/**
 * How far the send has got through the people it was addressed to.
 *
 * The word alone would not separate a reminder two passengers out of forty have opened from one
 * thirty-eight have — both are "partly read", and only one of them is a problem — so the bar and
 * the fraction stand under it. A send to a single person has no fraction to state: it is read or
 * it is not, and a 1/1 next to it would be noise on most of the list.
 */
const NotificationReadRateCell = ({ notification }: Props) => {
  const theme = useTheme();

  const { seen, total, ratio } = getNotificationReadRate(notification);
  const color = getNotificationReadStateColor(notification);

  return (
    <Box css={classes.root}>
      <StatusDot
        color={color}
        label={(
          <Typography component="span" variant="body2">
            {getNotificationReadStateLabel(notification)}
          </Typography>
        )}
      />
      {total > 1 && (
        <Box css={classes.meterRow}>
          <RowMeter color={getStatusSolidColor(theme, color)} ratio={ratio} />
          <Typography css={classes.ratio} variant="caption">{`${seen}/${total}`}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default NotificationReadRateCell;
