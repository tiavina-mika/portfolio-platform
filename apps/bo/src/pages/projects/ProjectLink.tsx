import { Stack } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  url: string;
  icon: ReactNode;
};
const ProjectLink = ({
  url, icon,
}: Props) => {
  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      {icon}
      <a href={url} rel="noreferrer" target="_blank">{url}</a>
    </Stack>
  );
};

export default ProjectLink;
