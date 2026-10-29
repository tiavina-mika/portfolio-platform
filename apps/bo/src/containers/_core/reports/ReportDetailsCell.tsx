import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { TABLE_CELL_TEXT_CLAMP_LINES, TABLE_CELL_TEXT_MAX_WIDTH } from '@/constants/_core/ui/list.constants';

const classes = {
  clamped: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
    WebkitLineClamp: TABLE_CELL_TEXT_CLAMP_LINES,
    overflow: 'hidden',
    maxWidth: TABLE_CELL_TEXT_MAX_WIDTH,
    // a complaint is prose, so it breaks on whole words rather than filling every line edge to edge
    textWrap: 'pretty' as const,
  },
};

type Props = {
  details: string | undefined;
};

/**
 * What the reporter actually wrote, cut to the first couple of lines. It earns a column because
 * the reason alone rarely says whether a report is worth opening — a dangerous-driving complaint
 * could be a near-miss or a bald tyre — while two lines of it usually settle the question. The rest
 * is in the report's own file, and the full text is on the tooltip for a row weighed in place.
 */
const ReportDetailsCell = ({ details }: Props) => {
  if (!details) {
    return <Typography sx={{ color: 'text.disabled' }} variant="body1">—</Typography>;
  }

  return (
    <Tooltip title={details}>
      <Typography css={classes.clamped} variant="body2">{details}</Typography>
    </Tooltip>
  );
};

export default ReportDetailsCell;
