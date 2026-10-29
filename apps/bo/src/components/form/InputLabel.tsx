
import {
  Box, type SxProps, type Theme, Tooltip, Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaInfoCircle } from 'react-icons/fa';

const classes = {
  required: (theme: Theme) => ({
    color: grey[500],
    marginRight: 6,
    marginLeft: 6,
    [theme.breakpoints.down('sm')]: { fontSize: 14 },
  }),
};

type Props = {
  label?: string | ReactNode;
  tooltip?: string;
  sx?: SxProps<Theme>;
  required?: boolean;
};

const InputLabel = ({
  label, sx, tooltip, required,
}: Props) => {
  const {
    t,
  } = useTranslation();

  return (
    <Box sx={[{
      mb: 0.8,
      display: 'flex',
      alignItems: 'center',
    }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography css={{ marginRight: 6 }}>{label}</Typography>
      {' '}
      {tooltip && (
        <Tooltip placement="top" title={tooltip}>
          <span className="flexColumn">
            <FaInfoCircle color={grey[400]} size={16} />
          </span>
        </Tooltip>
      )}
      {required && <Typography css={classes.required}>({t('required')})</Typography>}
    </Box>
  );
};

export default InputLabel;
