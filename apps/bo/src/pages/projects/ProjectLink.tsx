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
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {icon}
      <a href={url} rel="noreferrer" target="_blank">{url}</a>
    </Stack>
  );
};

export default ProjectLink;
