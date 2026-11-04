import Typography from '@mui/material/Typography';

import StatusDot from '@/components/StatusDot';
import { IPage } from '@/types/_core/page.type';
import { getPageStatus, getPageStatusColor, getTranslatedPageStatusLabel } from '@/utils/_core/cms.utils';

type Props = {
  page: IPage;
};

/**
 * Whether the page is on the website, in the same tinted-dot language every other list uses for a
 * state. A filled chip repeated down a column turns the list into a wall of color with no row
 * standing out from the others, which is the one thing a status column is there for.
 */
const PageStatusCell = ({ page }: Props) => {
  const status = getPageStatus(page);

  return (
    <Typography component="span" variant="subtitle1">
      <StatusDot color={getPageStatusColor(status)} label={getTranslatedPageStatusLabel(status)} />
    </Typography>
  );
};

export default PageStatusCell;
