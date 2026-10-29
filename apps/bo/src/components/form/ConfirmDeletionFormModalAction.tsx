import { IconButton } from '@mui/material';
import { FiTrash } from 'react-icons/fi';

import { useToggle } from '@/hooks/useToggle';

import ConfirmDeletionFormModal from './ConfirmDeletionFormModal';

type Props = {
  value: string;
  onConfirmed: () => void;
  label: string;
  type: string;
};

const ConfirmDeletionFormModalAction = ({
  value, onConfirmed, label, type,
}: Props) => {
  const {
    open: isOpenConfirmDeleteModal, toggle: toggleOpenConfirmDeleteModal,
  } = useToggle();

  return (
    <>
      <IconButton aria-label="delete" color="error" onClick={toggleOpenConfirmDeleteModal}>
        <FiTrash size={20} />
      </IconButton>
      <ConfirmDeletionFormModal
        label={label}
        open={isOpenConfirmDeleteModal}
        toggle={toggleOpenConfirmDeleteModal}
        type={type}
        value={value}
        onConfirmed={onConfirmed}
      />
    </>
  );
};

export default ConfirmDeletionFormModalAction;
