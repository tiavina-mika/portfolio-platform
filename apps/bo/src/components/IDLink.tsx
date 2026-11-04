import { Typography } from '@mui/material';

import { FONT_FAMILY_MONO, FONT_SIZE_META } from '@/constants/_core/ui/ui.constants';

import Link from './Link';

type Props = {
  id: string | undefined;
  path: string;
};

const IDLink = ({
  id,
  path,
}: Props) => {
  if (!id) {
    return <Typography>-</Typography>;
  }

  return (
    <Link
      css={{ color: 'inherit', fontSize: FONT_SIZE_META, fontFamily: FONT_FAMILY_MONO }}
      params={{ id }}
      preload={false}
      to={path + '/$id'}
    >
      {id}
    </Link>
  );
};

export default IDLink;
