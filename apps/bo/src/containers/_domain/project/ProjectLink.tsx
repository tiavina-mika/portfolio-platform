import { Stack } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  url: string;
  icon: ReactNode;
};

/**
 * One address of a project (its website, a repository, a package) opened in a new tab, with the
 * glyph of the kind of site it points to.
 */
const ProjectLink = ({ url, icon }: Props) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
    {icon}
    <a href={url} rel="noreferrer" target="_blank">{url}</a>
  </Stack>
);

export default ProjectLink;
