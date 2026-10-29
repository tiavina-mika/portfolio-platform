import {
  IconButton, Tooltip,
} from '@mui/material';
import { MouseEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit3, FiEye, FiTrash } from 'react-icons/fi';

import Dialog from './Dialog';

type Props = {
  onDelete?: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
  value?: any;
  dialogDescription?: string | null;
  children?: ReactNode;
  withDeletionModal?: boolean;
};
const ButtonActions = ({
  onDelete,
  onEdit,
  onPreview,
  value,
  dialogDescription,
  children,
  withDeletionModal = true,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const toggleDeleteModal = () => setOpenDeleteModal(!openDeleteModal);

  const handleDelete = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (withDeletionModal) {
      toggleDeleteModal();
      return;
    }
    onDelete?.();
  };

  const handleEdit = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (!onEdit) return;
    onEdit();
  };

  const handlePreview = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (!onPreview) return;
    onPreview();
  };

  const handleConfirmDeleteDialogClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <>
      <div className="flexRow justifyEnd center">
        {onPreview && (
          <Tooltip title={t('viewDetails')}>
            <IconButton aria-label="preview" onClick={handlePreview}>
              <FiEye size={20} />
            </IconButton>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title={t('edit')}>
            <IconButton aria-label="edit" onClick={handleEdit}>
              <FiEdit3 size={20} />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title={t('delete')}>
            <IconButton aria-label="delete" color="error" onClick={handleDelete}>
              <FiTrash size={20} />
            </IconButton>
          </Tooltip>
        )}
        {children}
      </div>
      {/* ---------- delete confirmation modal */}
      <Dialog
        description={dialogDescription ?? t('sureToDelete', { value })}
        maxWidth="xs"
        open={openDeleteModal}
        title={t('delete', { value })}
        toggle={toggleDeleteModal}
        onClick={handleConfirmDeleteDialogClick}
        onPrimaryButtonAction={onDelete}
      />
    </>
  );
};

export default ButtonActions;
