import { IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { MouseEvent, useState, ReactNode } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

type Props = {
  icon?: ReactNode;
  message: string;
};
const IconPopover = ({
  icon, message,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <IconButton
        aria-haspopup="true"
        aria-owns={open
          ? 'mouse-over-popover'
          : undefined}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {icon || <FaInfoCircle color={grey[400]} size={18} />}
      </IconButton>
      <Popover
        disableRestoreFocus
        anchorEl={anchorEl}
        id="mouse-over-popover"
        open={open}
        slotProps={{ paper: { sx: { maxWidth: 300 } } }}
        sx={{ pointerEvents: 'none' }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
      >
        <Typography sx={{ p: 1, fontSize: 14 }}>{message}</Typography>
      </Popover>
    </div>
  );
};

export default IconPopover;
