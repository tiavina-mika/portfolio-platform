import {
  Box, Button, SxProps, Theme,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FiInbox } from 'react-icons/fi';

import {
  LIST_STATE_ACTIONS_GAP, LIST_STATE_GAP, LIST_STATE_ICON_SIZE, LIST_STATE_PADDING_X,
  LIST_STATE_PADDING_Y, LIST_STATE_TEXT_MAX_WIDTH,
} from '@/constants/_core/ui/list.constants';

type EmptyDataAction = {
  label: string;
  onClick: () => void;
};

type Props = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: EmptyDataAction;
  sx?: SxProps<Theme>;
};

/**
 * The state a list shows in place of its rows — nothing found, nothing yet, nothing left. It is a
 * band, not a message: the icon, the sentence naming what happened and the way out of it are
 * stacked in one centered column, and the sentence is capped so it breaks into two readable lines
 * instead of running the full width of a wide table.
 */
const EmptyData = ({
  title, description, icon, action, sx,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // it stands in for the rows, so it takes the width they would have had
        width: '100%',
        alignSelf: 'stretch',
        gap: `${LIST_STATE_GAP}px`,
        padding: `${LIST_STATE_PADDING_Y}px ${LIST_STATE_PADDING_X}px`,
        textAlign: 'center',
        ...sx,
      }}
    >
      <Box sx={{ color: 'text.disabled', lineHeight: 0 }}>
        {icon ?? <FiInbox size={LIST_STATE_ICON_SIZE} />}
      </Box>
      {/* the line of a placeholder states why the block is empty — it is not a level of the page outline */}
      <Typography component="p" variant="h5">
        {title ?? t('noDataAvailable')}
      </Typography>
      {description && (
        <Typography
          variant="body1"
          sx={{
            color: 'text.disabled',
            maxWidth: LIST_STATE_TEXT_MAX_WIDTH,
            textWrap: 'pretty',
          }}
        >
          {description}
        </Typography>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          size="small"
          sx={{ mt: `${LIST_STATE_ACTIONS_GAP}px` }}
          variant="outlined"
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyData;
