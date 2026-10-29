import { Stack, Typography } from '@mui/material';
import { capitalize } from 'string-ts';

type Props = {
  items: string[];
};
const ListSeparatedByComma = ({
  items = [],
}: Props) => {
  if (!items.length) {
    return <Typography variant="body2">-</Typography>;
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
      {items?.map((item: string) => (
        <span key={item}>
          {capitalize(item)}
          {/* separate by comma if not last */}
          {items && items.indexOf(item) !== items.length - 1 && ', '}
        </span>
      ))}
    </Stack>
  );
};

export default ListSeparatedByComma;
