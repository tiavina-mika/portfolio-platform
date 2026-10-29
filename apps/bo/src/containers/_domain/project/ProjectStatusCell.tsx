import Typography from '@mui/material/Typography';

import StatusDot from '@/components/StatusDot';
import { IProject } from '@/types/_domain/project.type';
import {
  getProjectStatus, getProjectStatusColor, getTranslatedProjectStatusLabel,
} from '@/utils/_domain/project.utils';

type Props = {
  project: IProject;
};

/**
 * Whether the project is on the website, in the same tinted-dot language every other list uses for
 * a state.
 */
const ProjectStatusCell = ({ project }: Props) => {
  const status = getProjectStatus(project);

  return (
    <Typography component="span" variant="subtitle1">
      <StatusDot color={getProjectStatusColor(status)} label={getTranslatedProjectStatusLabel(status)} />
    </Typography>
  );
};

export default ProjectStatusCell;
