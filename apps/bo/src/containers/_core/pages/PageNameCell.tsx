import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { IPage, IPageTranslatedFields } from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    minWidth: 0,
  },
};

type Props = {
  page: IPage;
  locale: Locale;
};

/**
 * Which page the row is: the name the team calls it by, and under it the two things that identify
 * it beyond that name — the title the public site prints, and the technical code the apps look it
 * up with. Both fold into this cell rather than taking a column each: neither is ever scanned down
 * a column on its own, and every extra column costs width the names need.
 */
const PageNameCell = ({
  page, locale,
}: Props) => {
  const name = getTranslatedField<IPageTranslatedFields>(page.translated, locale, 'name');
  const title = getTranslatedField<IPageTranslatedFields>(page.translated, locale, 'title');

  // a page whose title repeats its name says nothing twice — only the code is worth the second line
  const meta = [title === name ? '' : title, page.code].filter(Boolean).join(' · ');

  return (
    <Box css={classes.root}>
      <Typography noWrap variant="subtitle1">{name}</Typography>
      {meta && <Typography noWrap variant="body2">{meta}</Typography>}
    </Box>
  );
};

export default PageNameCell;
