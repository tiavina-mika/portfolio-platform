import { type Theme } from '@emotion/react';
import {
  Button, IconButton, Tooltip,
} from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiChevronDown, FiDownload, FiEdit3, FiEye, FiGlobe, FiList, FiMoreHorizontal, FiPlus,
  FiRotateCcw, FiTrash,
} from 'react-icons/fi';

import { RowEditIcon, RowMoreIcon, RowPreviewIcon } from '@/components/icons/RowActionIcons';
import { ROW_ACTIONS_ICON_SIZE } from '@/constants/_core/ui/list.constants';
import { PAGE_HEAD_ACTION_ICON_SIZE } from '@/constants/_core/ui/page.constants';
import {
  ICON_BUTTON_SMALL_ICON_SIZE, MENU_ITEM_ICON_SIZE, MENU_MIN_WIDTH,
} from '@/constants/_core/ui/ui.constants';
import { useToggle } from '@/hooks/_core/useToggle';
import { IMenu } from '@/types/_core/app.type';
import { getDestructiveMenuItemStyles, getRowActionsStyles } from '@/utils/_core/theme/styles.utils';

import Dialog from './Dialog';

/*
 * paper border/shadow/radius, item height, type size and the icon gap all come from the theme's
 * MuiMenu / MuiMenuItem overrides — only the panel's own width and offset are set here
 */
const classes = {
  menu: (theme: Theme) => ({
    '& .MuiPaper-root': {
      marginTop: theme.spacing(1),
      minWidth: MENU_MIN_WIDTH,
    },
  }),
  destructiveItem: (theme: Theme) => getDestructiveMenuItemStyles(theme),
  rowActions: (theme: Theme) => getRowActionsStyles(theme),
};

export type ActionsMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  goToList?: () => void;
  onCreate?: () => void;
  onPreview?: () => void;
  onDestroy?: () => void;
  /**
   * Puts a row back where it came from. Only the recycle bin passes it: until now the bin offered
   * "destroy permanently" as its single action, so a row deleted by mistake could only be
   * destroyed for good or left there forever.
   */
  onRestore?: () => void;
  onDownloadJson?: () => void;
  websiteUrl?: string;
  label?: string;
  dialogDescription?: string;
  menus?: IMenu[];
  /*
   * `row` is the list variant: the two actions a reader reaches for on every row — open and edit —
   * stand as their own slots and only the rest folds into the overflow menu, so scanning a list
   * never costs a menu opening. `preview` is the same idea on a detail page, where editing is the
   * one thing the reader came to do: it stands as a full button and everything else folds behind
   * the overflow trigger. `icon`/`button` keep everything behind a single trigger.
   */
  type?: 'icon' | 'button' | 'row' | 'preview';
};

const ActionsMenu = ({
  onEdit,
  onDelete,
  goToList,
  onPreview,
  onCreate,
  onDestroy,
  onRestore,
  onDownloadJson,
  label,
  websiteUrl,
  dialogDescription,
  type = 'button',
  menus = [],
}: ActionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    t,
  } = useTranslation();

  const {
    open: openDeleteDialog, toggle: toggleDeleteDialog,
  } = useToggle();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    toggleDeleteDialog();
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

  const handleGoToWebsite = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (!websiteUrl) return;
    if (!window) return;
    window.open(websiteUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadJson = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (!onDownloadJson) return;
    onDownloadJson();
  };

  const handleRestore = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    handleClose();
    if (!onRestore) return;
    onRestore();
  };

  const handleConfirmDeleteDialogClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleCloseDeleteDialog = () => {
    toggleDeleteDialog();
    handleClose();
  };

  const isRow = type === 'row';
  const isPreview = type === 'preview';

  const options = [
    {
      onClick: handleEdit,
      display: !isRow && !isPreview && !!onEdit,
      label: t('edit'),
      icon: <FiEdit3 size={MENU_ITEM_ICON_SIZE} />,
    },
    {
      onClick: handlePreview,
      display: !isRow && !!onPreview,
      label: t('seePreview'),
      icon: <FiEye size={MENU_ITEM_ICON_SIZE} />,
    },
    {
      onClick: handleGoToWebsite,
      display: !!websiteUrl,
      label: t('seeWebsite'),
      icon: (
        <FiGlobe
          css={(theme: Theme) => ({ color: theme.palette.success.main })}
          size={MENU_ITEM_ICON_SIZE}
        />
      ),
    },
    {
      onClick: handleDownloadJson,
      display: !!onDownloadJson,
      label: t('downloadJson'),
      icon: <FiDownload size={MENU_ITEM_ICON_SIZE} />,
    },
    {
      onClick: handleRestore,
      display: !!onRestore,
      label: t('restore'),
      icon: <FiRotateCcw size={MENU_ITEM_ICON_SIZE} />,
    },

    {
      onClick: goToList,
      display: !!goToList,
      label: t('returnToList'),
      icon: <FiList size={MENU_ITEM_ICON_SIZE} />,
    },
    {
      onClick: onCreate,
      display: !!onCreate,
      label: t('add'),
      icon: <FiPlus size={MENU_ITEM_ICON_SIZE} />,
    },
    ...menus, // before delete
    {
      onClick: handleDelete,
      display: !!onDelete || !!onDestroy,
      label: t('delete'),
      icon: <FiTrash size={MENU_ITEM_ICON_SIZE} />,
      isDestructive: true,
    },
  ];

  // the overflow trigger disappears when everything a row can do already stands on the row
  const hasMenuOptions = options.some((option) => option.display);

  const renderTrigger = () => {
    if (isRow) {
      return (
        <div css={classes.rowActions}>
          {onPreview && (
            <Tooltip title={t('viewDetails')}>
              <IconButton aria-label="preview" onClick={handlePreview}>
                <RowPreviewIcon size={ROW_ACTIONS_ICON_SIZE} />
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
          {hasMenuOptions && (
            <Tooltip title={t('otherActions')}>
              <IconButton aria-expanded={open} aria-label="otherActions" onClick={handleClick}>
                <RowMoreIcon size={ROW_ACTIONS_ICON_SIZE} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      );
    }

    /*
     * a detail page opens on the thing it is about, so the action it exists for stands on its own
     * next to the title instead of being reached through a menu that has to be opened first
     */
    if (isPreview) {
      return (
        <>
          {onEdit && (
            <Button
              onClick={handleEdit}
              startIcon={<FiEdit3 size={PAGE_HEAD_ACTION_ICON_SIZE} />}
              variant="contained"
            >
              {t('edit')}
            </Button>
          )}
          {hasMenuOptions && (
            <Tooltip title={t('otherActions')}>
              <IconButton aria-expanded={open} aria-label="otherActions" onClick={handleClick}>
                <FiMoreHorizontal size={ICON_BUTTON_SMALL_ICON_SIZE} />
              </IconButton>
            </Tooltip>
          )}
        </>
      );
    }

    if (type === 'button') {
      return (
        <Button endIcon={<FiChevronDown />} onClick={handleClick} variant="outlined">
          Actions
        </Button>
      );
    }

    return (
      <Tooltip title="Actions">
        <IconButton onClick={handleClick}>
          <FiMoreHorizontal size={ICON_BUTTON_SMALL_ICON_SIZE} />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <>
      {/* -------- trigger(s) -------- */}
      {renderTrigger()}
      {/* -------- menu -------- */}
      <Menu
        disableScrollLock
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        css={classes.menu}
        elevation={0}
        id="account-menu"
        onClick={handleClose}
        onClose={handleClose}
        open={open}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {options.map((option, index) => (
          option.display && (
            <MenuItem
              key={index}
              onClick={option.onClick}
              css={'isDestructive' in option && option.isDestructive
                ? classes.destructiveItem
                : undefined}
            >
              <ListItemIcon>
                {option.icon}
              </ListItemIcon>
              {option.label}
            </MenuItem>
          )
        ))}
      </Menu>

      {/* ---------- delete confirmation modal */}
      <Dialog
        buttonColor="error"
        maxWidth="xs"
        onClick={handleConfirmDeleteDialogClick}
        onPrimaryButtonAction={onDelete || onDestroy}
        open={openDeleteDialog}
        title={t('deletion')}
        toggle={handleCloseDeleteDialog}
        description={dialogDescription || (onDestroy
          ? t('infoMessages.onDestructionMessage')
          : '')}
      >
        {label && (!!onDelete || !!onDestroy)
          ? t('sureToDelete', { value: label })
          : ''}
      </Dialog>
    </>
  );
};

export default ActionsMenu;
