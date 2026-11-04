import {
  IconButton, Theme, Tooltip,
} from '@mui/material';
import { MouseEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  RowDeleteIcon, RowEditIcon, RowOpenIcon, RowPreviewIcon,
} from '@/components/icons/RowActionIcons';
import { ROW_ACTIONS_ICON_SIZE } from '@/constants/_core/ui/list.constants';
import { getRowActionsStyles } from '@/utils/_core/theme/styles.utils';

import Dialog from './Dialog';


const classes = {
  row: (theme: Theme) => getRowActionsStyles(theme),
};

type Props = {
  onDelete?: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
  value?: any;
  dialogDescription?: string | null;
  /**
   * Actions the row's own domain adds, drawn before the generic ones. The row reads left to right
   * from the lightest gesture to the heaviest — reaching out to the row's subject, then opening it,
   * then editing it, then deleting it — so a domain action that is not destructive opens the row
   * rather than trailing behind the delete button.
   */
  leadingActions?: ReactNode;
  children?: ReactNode;
  withDeletionModal?: boolean;
  previewIcon?: 'eye' | 'enter';
};
const ButtonActions = ({
  onDelete,
  onEdit,
  onPreview,
  value,
  dialogDescription,
  leadingActions,
  children,
  withDeletionModal = true,
  previewIcon = 'eye',
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
      <div css={classes.row}>
        {leadingActions}
        {onPreview && (
          <Tooltip title={t('viewDetails')}>
            <IconButton aria-label="preview" onClick={handlePreview}>
              {previewIcon === 'eye'
                ? <RowPreviewIcon size={ROW_ACTIONS_ICON_SIZE} />
                : <RowOpenIcon size={ROW_ACTIONS_ICON_SIZE} />}
            </IconButton>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title={t('edit')}>
            <IconButton aria-label="edit" onClick={handleEdit}>
              <RowEditIcon size={ROW_ACTIONS_ICON_SIZE} />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title={t('delete')}>
            <IconButton aria-label="delete" color="error" onClick={handleDelete}>
              <RowDeleteIcon size={ROW_ACTIONS_ICON_SIZE} />
            </IconButton>
          </Tooltip>
        )}
        {children}
      </div>
      {/* ---------- delete confirmation modal */}
      <Dialog
        buttonColor="error"
        description={dialogDescription ?? t('sureToDelete', { value })}
        maxWidth="xs"
        onClick={handleConfirmDeleteDialogClick}
        onPrimaryButtonAction={onDelete}
        open={openDeleteModal}
        title={t('delete', { value })}
        toggle={toggleDeleteModal}
      />
    </>
  );
};

export default ButtonActions;
