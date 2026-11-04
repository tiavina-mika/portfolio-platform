import { Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const TableTitle = ({ children }: Props) => {
  return (
    <div css={{ padding: '14px 14px 10px 14px' }}>
      <Typography
        component="div"
        id="tableTitle"
        sx={{ flex: '1 1 100%' }}
        variant="h6"
      >
        {children}
      </Typography>
    </div>
  );
};

export default TableTitle;
