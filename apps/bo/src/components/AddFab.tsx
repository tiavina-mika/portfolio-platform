import Fab from '@mui/material/Fab';
import { FiPlus } from 'react-icons/fi';

type Props = {
  onClick?: () => void;
};

const AddFab = ({
  onClick,
}: Props) => {
  return (
    <Fab
      aria-label="add"
      color="primary"
      css={{ margin: 0, top: 'auto', right: 30, bottom: 30, left: 'auto', position: 'fixed' }}
      onClick={onClick}
    >
      <FiPlus size={26} />
    </Fab>
  );
};

export default AddFab;
