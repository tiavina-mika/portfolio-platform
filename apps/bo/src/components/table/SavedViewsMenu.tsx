import {
  Box, IconButton, ListItemIcon, Menu, MenuItem, TextField, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiTrash } from 'react-icons/fi';
import { MdBookmarkAdd, MdBookmarks } from 'react-icons/md';

import Dialog from '@/components/Dialog';
import ToolbarIconButton from '@/components/ToolbarIconButton';
import { TOOLBAR_ICON_BUTTON_GLYPH_SIZE } from '@/constants/_core/ui/ui.constants';
import { useSavedViews } from '@/hooks/_core/useSavedViews';
import { useToggle } from '@/hooks/_core/useToggle';

type Props = {
  listId: string;
  currentSearch: Record<string, any>;
  onApply: (search: Record<string, any>) => void;
};

const SavedViewsMenu = ({
  listId, currentSearch, onApply,
}: Props) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const {
    views, saveView, deleteView,
  } = useSavedViews(listId);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    open: openSaveDialog, toggle: toggleSaveDialog,
  } = useToggle();
  const [viewName, setViewName] = useState<string>('');

  const hasCurrentFilters = Object.keys(currentSearch).length > 0;

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleApply = (search: Record<string, any>) => () => onApply(search);

  const handleOpenSaveDialog = () => {
    setViewName('');
    toggleSaveDialog();
  };

  const handleDelete = (id: string) => (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    deleteView(id);
    enqueueSnackbar(t('viewDeleted'), { variant: 'success' });
  };

  const handleSaveView = () => {
    if (!viewName.trim()) return;
    saveView(viewName.trim(), currentSearch);
    enqueueSnackbar(t('viewSaved'), { variant: 'success' });
  };

  return (
    <>
      {/* the same bordered slot the sort and export triggers stand in — one family per toolbar group */}
      <ToolbarIconButton
        icon={<MdBookmarks size={TOOLBAR_ICON_BUTTON_GLYPH_SIZE} />}
        isMenuOpen={open}
        label={t('savedViews')}
        onClick={handleOpenMenu}
      />
      <Menu
        anchorEl={anchorEl}
        onClick={handleCloseMenu}
        onClose={handleCloseMenu}
        open={open}
      >
        <MenuItem disabled={!hasCurrentFilters} onClick={handleOpenSaveDialog}>
          <ListItemIcon>
            <MdBookmarkAdd size={18} />
          </ListItemIcon>
          {t('saveCurrentFilters')}
        </MenuItem>
        {views.length === 0 && (
          <MenuItem disabled>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
            >{t('noSavedViews')}</Typography>
          </MenuItem>
        )}
        {views.map((view) => (
          <MenuItem className="flexRow spaceBetween center" key={view.id} onClick={handleApply(view.search)}>
            <Box sx={{ flex: 1 }}>{view.name}</Box>
            {/* a bin glyph at the end of the row: the name says which action it is */}
            <IconButton
              aria-label={t('delete')}
              edge="end"
              onClick={handleDelete(view.id)}
              size="small"
            >
              <FiTrash size={14} />
            </IconButton>
          </MenuItem>
        ))}
      </Menu>
      <Dialog
        maxWidth="xs"
        onPrimaryButtonAction={handleSaveView}
        open={openSaveDialog}
        primaryButtonText={t('save')}
        title={t('saveCurrentFilters')}
        toggle={toggleSaveDialog}
      >
        <TextField
          fullWidth
          label={t('viewName')}
          onChange={(event) => setViewName(event.target.value)}
          value={viewName}
        />
      </Dialog>
    </>
  );
};

export default SavedViewsMenu;
