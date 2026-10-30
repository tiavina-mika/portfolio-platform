import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DateType } from '@/types/_core/utils.type';
import { displayDate } from '@/utils/_core/date.utils';

type Props = {
  createdAt: DateType;
  updatedAt: DateType;
};

const DatesCell = ({
  createdAt,
  updatedAt,
}: Props) => {
  return (
    <Stack sx={{
      alignItems: 'flex-end',
    }}
    >
      <Typography variant="body2">{displayDate(createdAt, false, true)}</Typography>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
        }}
      >{displayDate(updatedAt, false, true)}</Typography>
    </Stack>
  );
};

export default DatesCell;
