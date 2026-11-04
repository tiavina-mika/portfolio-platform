import Typography from '@mui/material/Typography';

import { PROJECT_TECHNOLOGIES_SHOWN } from '@/constants/_domain/project.constants';
import { IProject } from '@/types/_domain/project.type';

type Props = {
  project: IProject;
};

/**
 * The technologies the project was built with, cut after the first few: the complete list is on the
 * project page, a list row only has to say what kind of stack it is.
 */
const ProjectTechnologiesCell = ({ project }: Props) => {
  const technologies = project.technologies ?? [];
  const rest = technologies.length - PROJECT_TECHNOLOGIES_SHOWN;
  const label = [
    ...technologies.slice(0, PROJECT_TECHNOLOGIES_SHOWN),
    ...(rest > 0 ? ['+' + rest] : []),
  ].join(', ');

  return <Typography noWrap variant="body1">{label}</Typography>;
};

export default ProjectTechnologiesCell;
