import { Tooltip } from '@mui/material';
import Fab from '@mui/material/Fab';
import { FiSend } from 'react-icons/fi';

type Props = {
  onClick?: () => void;
};

// Copied from AddFab.tsx
const EmailFab = ({
  onClick,
}: Props) => {
  return (
    <Tooltip placement="top" title="Send email to this user">
      <Fab
        aria-label="add"
        color="primary"
        sx={{
          margin: 0,
          top: 'auto',
          right: 30,
          bottom: 30,
          left: 'auto',
          position: 'fixed',
        }}
        onClick={onClick}
      >
        <FiSend size={26} />
      </Fab>
    </Tooltip>
  );
};

export default EmailFab;
