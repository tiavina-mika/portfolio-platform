import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';

import type { ReactNode } from 'react';

import { REPORT_FILE_CHIP_GAP, REPORT_PAGE_CARD_BODY_GAP } from '@/constants/_core/ui/inbox.constants';

const classes = {
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: `${REPORT_FILE_CHIP_GAP}px`,
  },
  body: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${REPORT_PAGE_CARD_BODY_GAP}px`,
  },
};

type Props = {
  title: string;
  // how many entries the card lists, when it is a list
  count?: number;
  // what acts on the card as a whole, at the far end of its header
  action?: ReactNode;
  children: ReactNode;
};

/**
 * One block of the report's page: a titled card holding a single question of the file — what was
 * reported, what else the target has drawn, what the target is, how it was ruled on. It adds only
 * the stacking of its content and an optional count to the theme's own card, so every block reads
 * as the same kind of thing.
 */
const ReportDetailCard = ({
  title, count, action, children,
}: Props) => (
  <Card>
    <CardHeader
      action={action}
      title={count === undefined
        ? title
        : (
          <Box css={classes.title}>
            {title}
            <Chip label={count} size="small" variant="outlined" />
          </Box>
        )}
    />
    <CardContent>
      <Box css={classes.body}>{children}</Box>
    </CardContent>
  </Card>
);

export default ReportDetailCard;
