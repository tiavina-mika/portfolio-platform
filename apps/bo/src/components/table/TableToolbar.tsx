import { Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { IListSelectionAction } from '@/types/app.type';
import { wait } from '@/utils/utils';

type Props = {
  selectedIds: string[];
  selectionActions: IListSelectionAction[];
  resetSelectedIds: () => void;
};

const TableToolbar = ({
  selectedIds, resetSelectedIds, selectionActions = [],
}: Props) => {
  const numSelected = selectedIds.length;

  const {
    t,
  } = useTranslation();

  if (numSelected <= 0) {
    return null;
  }

  return (
    <>
      <Toolbar
        className="flexRow center spaceBetween"
        sx={[{
          borderRadius: 1,
          mb: 2,
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        }, numSelected > 0 && {
          bgcolor: theme => alpha(
            theme.palette.primary.main,
            theme.palette.action.activatedOpacity
          ),
        }]}
      >
        {/* label with count */}
        <Typography variant="subtitle1">
          {t('selectedCount', { count: numSelected })}
        </Typography>
        <Stack direction="row" spacing={2}>
          {selectionActions.map((option, index) => (
            option.display && (
              <Fragment key={index}>
                {option.icon
                  ? (
                    <Tooltip title={option.label}>
                      <IconButton onClick={async () => {
                        option.onClick?.(selectedIds);
                        await wait();
                        resetSelectedIds();
                      }}
                      >
                        {option.icon}
                      </IconButton>
                    </Tooltip>
                  )
                  : option.renderTriggerComponent?.(selectedIds, resetSelectedIds)}
                {option.renderActionComponent?.(selectedIds)}
              </Fragment>
            )
          ))}
        </Stack>
      </Toolbar>
    </>
  );
};

export default TableToolbar;
