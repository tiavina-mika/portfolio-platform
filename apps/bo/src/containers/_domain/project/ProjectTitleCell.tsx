import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { Locale } from '@/types/_core/setting.type';
import { IProject, IProjectTranslatedFields } from '@/types/_domain/project.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { getProjectTypeLabel } from '@/utils/_domain/project.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    minWidth: 0,
  },
};

type Props = {
  project: IProject;
  locale: Locale;
};

/**
 * What the project is: its name, and under it the society it was made for and the kinds of project
 * it belongs to, which place it before it is opened.
 */
const ProjectTitleCell = ({ project, locale }: Props) => {
  const name = getTranslatedField<IProjectTranslatedFields>(project.translated, locale, 'name');
  const meta = [
    project.society,
    (project.types ?? []).map(getProjectTypeLabel).join(', '),
  ].filter(Boolean).join(' · ');

  return (
    <Box css={classes.root}>
      <Typography noWrap variant="subtitle1">{name}</Typography>
      {meta && <Typography noWrap variant="body2">{meta}</Typography>}
    </Box>
  );
};

export default ProjectTitleCell;
